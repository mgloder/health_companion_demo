import { createChatCompletion, insuranceRankedByRelatedness } from "../utils/openai.js";
import { ChatManager, checkDoctorsInCoverage, STEPS } from "./healthAssistantMachine.js";
import { zodResponseFormat } from "openai/helpers/zod";
import { RESPONSE_FORMAT } from "../utils/healthAssistantUtil.js";
import doctors from "../data/dummy_medical_data.json" with { type: "json" };
import { searchSimilar } from "../utils/cosmos.js";

export function registerChatRoutes(server) {
  server.post("/api/chat", async (request, reply) => {
    try {
      const result = await handler(request);
      return result;
    } catch (error) {
      request.log.error({
        msg: "Chat completion failed",
        error: error.message,
        stack: error.stack,
      });

      reply.code(500).send({
        success: false,
        error: "Failed to process chat request",
        details: error.message,
      });
    }
  });
}

async function handleToolCalls(message, chatManager) {
  let toolMessage = "";
  let type = "text";
  let data = null;
  for (const toolCall of message.tool_calls) {
    const { id: toolCallId, function: { name, arguments: argStr } } = toolCall;
    console.log(`${name} tool call arguments:`, argStr);
    const args = JSON.parse(argStr);

    if (name === "collect_user_symptoms") {
      chatManager.addChatMessage(message);
      toolMessage = await chatManager.handleCollectInfo(toolCallId, args);
      if (chatManager.getCurrentStep() === STEPS.GENERATE_POSSIBLE_DISEASES) {
        type = "confirm";
        data = JSON.parse(toolMessage);
      }
    }

    if (name === "user_confirm_diagnosis") {
      chatManager.addChatMessage(message);
      toolMessage = await chatManager.handleConfirmDiagnosis(toolCallId, args);
      type = "confirm_upload";
    }

    if (name === "user_reject_diagnosis") {
      chatManager.addChatMessage(message);
      toolMessage = await chatManager.handleRejectDiagnosis(toolCallId, args);
    }

    if (name === "user_uploaded_insurance_coverage") {
      toolMessage = await chatManager.handleUploadedInsuranceCoverage(toolCallId, args);
      type = "confirm_insurance";
      data = JSON.parse(toolMessage);
    }

    if (name === "user_reject_upload") {
      console.log("user_reject_upload called");
    }
    if (name === "user_need_more_detail") {
      chatManager.addChatMessage(message);
      toolMessage = await chatManager.handleNeedMoreDetail(toolCallId, args);
    }

    if (name === "user_need_recommend_doctor") {
      toolMessage = chatManager.handleNeedRecommendDoctor(toolCallId, args);
    }

    if (name === "user_prefer_doctor") {
      chatManager.addRecommendMessage(message);
      toolMessage = await chatManager.handlePreferDoctor(toolCallId, args);
      type = "recommend_doctor";
    }

    if (name === 'user_need_recommend_insurance') {
      chatManager.handleNeedRecommendInsurance(message);
      type = "need_recommend_insurance";
    }

    if (name === 'user_want_to_purchase_insurance') {
      toolMessage = chatManager.handleWantToPurchaseInsurance(toolCallId, args);
      type = "purchase_insurance";
    }

  }
  return { type, toolMessage, data };
}

async function handleInsuranceQA(session, message, chatManager) {
  const ret = await insuranceRankedByRelatedness(message, 1);
  const { content } = ret[0];
  if (!session.insuranceQAHistory) {
    session.insuranceQAHistory = [
      {
        role: "developer",
        content: `You are a helpful health insurance Q&A assistant.`,
      },
    ];
  }
  session.insuranceQAHistory.push({ role: "user", content: `I have possible disease: ${session.possibleDisease} and confirmed insurance info ${JSON.stringify(session.insuranceInfo)}, Question: ${message}; Reference: ${content}. Response with user language` });
  const response = await createChatCompletion({
    messages: session.insuranceQAHistory,
    tools: chatManager.getTools(),
    tool_choice: 'auto'
  });

  let toolMessage;
  let type = "confirm_doctor";
  let data = null;

  if (response?.choices[0].message.tool_calls) {
    console.log("Tool calls:", response.choices[0].message.tool_calls);
    const ret = await handleToolCalls(response.choices[0].message, chatManager);
    toolMessage = ret.toolMessage;
    type = ret.type;
    data = ret.data;
  }
  const chatMessage = response?.choices[0].message.content || toolMessage || "";
  session.insuranceQAHistory.push({ role: "assistant", content: chatMessage });
  return { message: chatMessage, type, data };
}

async function handleDoctorRecommendation(session, message, chatManager) {
  if (!session.recommendDoctorHistory) {
    session.recommendDoctorHistory = [
      {
        role: "developer",
        content: `You are a helpful health assistant specialized in recommending doctors. Response with user language. Based on the user's symptoms, location, and preferences, provide tailored doctor recommendations that best match their needs. Reference: ${JSON.stringify(doctors)}`,
      },
    ];
  }
  session.recommendDoctorHistory.push({ role: "user", content: message });
  const response = await createChatCompletion({
    messages: session.recommendDoctorHistory,
    tools: chatManager.getTools(),
    tool_choice: 'auto',
    response_format: zodResponseFormat(RESPONSE_FORMAT.RECOMMEND_DOCTOR, 'recommend_doctor')
  });

  let toolMessage;
  let type = "recommend_doctor";
  let data = null;

  if (response?.choices[0].message.tool_calls) {
    console.log("Tool calls:", response.choices[0].message.tool_calls);
    const ret = await handleToolCalls(response.choices[0].message, chatManager);
    toolMessage = ret.toolMessage;
    type = ret.type;
  }
  const chatMessage = response?.choices[0].message.content || toolMessage || "";
  if (type !== 'text') {
    data = JSON.parse(chatMessage);
    // go to doctor_q_and_a step
    session.currentStep = STEPS.DOCTOR_Q_AND_A;
    session.recommendDoctors = data.doctors;
    if (!session.doctorCoverage) {
      session.doctorCoverage = await checkDoctorsInCoverage(session.recommendDoctors);
      data.doctors = data.doctors.map((doctor) => {
        const doctorCoverage = session.doctorCoverage.find((_) => _.doctor === doctor.doctor);
        console.log(doctorCoverage);
        return {...doctor, coverage: doctorCoverage?.coverage};
      })
    }
  }
  session.recommendDoctorHistory.push({ role: "assistant", content: chatMessage });
  return { message: chatMessage, type, data };
}

async function handleDoctorQA(session, message, chatManager) {
  if (!session.doctorQAHistory) {
    session.doctorCoverage = await checkDoctorsInCoverage(session.recommendDoctors);
    session.doctorQAHistory = [
      {
        role: "developer",
        content: `You are a helpful health assistant. Reference: insurance_info: ${JSON.stringify(session.insuranceInfo)} doctor_insurance_coverage: ${JSON.stringify(session.doctorCoverage)} disease:${session.possibleDisease} recommend_doctors: ${JSON.stringify(session.recommendDoctors)}`,
      },
    ];
  }
  session.doctorQAHistory.push({ role: "user", content: message });
  const response = await createChatCompletion({
    messages: session.doctorQAHistory,
    tools: chatManager.getTools(),
    tool_choice: 'auto',
    response_format: zodResponseFormat(RESPONSE_FORMAT.DOCTOR_Q_AND_A, 'doctor_q_and_a')
  });

  let toolMessage;
  let type = "recommend_insurance";
  let data = null;

  if (response?.choices[0].message.tool_calls) {
    console.log("Tool calls:", response.choices[0].message.tool_calls);
    const ret = await handleToolCalls(response.choices[0].message, chatManager);
    toolMessage = ret.toolMessage;
    type = ret.type;
    return { message: toolMessage, type, data };
  }
  const chatMessage = response?.choices[0].message.content || toolMessage || "";

  const ret = JSON.parse(chatMessage);
  const answer = ret.answer;

  // if mentioned doctor not in insurance network provider
  const recommendDoctor = session.doctorCoverage.find(({ doctor }) => doctor === ret.doctor_name);
  console.log("doctor:", ret.doctor_name);
  console.log("recommendDoctor:", recommendDoctor);
  console.log("doctorCoverage:", session.doctorCoverage);
  if (recommendDoctor && !recommendDoctor.coverage) {
    data = {
      doctor_name: ret.doctor_name,
      coverage: recommendDoctor.coverage,
    }
  }

  session.doctorQAHistory.push({ role: "assistant", content: chatMessage });
  return { message: answer, type, data };
}

async function handleInsuranceRecommendation(session, message, chatManager) {
  if (!session.insuranceRecommendationHistory) {
    session.insuranceRecommendationHistory = [
      {
        role: "developer",
        content: `You are a professional insurance consultant. Context: insurance_info: ${JSON.stringify(session.insuranceInfo)} user_symptoms: ${JSON.stringify(session.symptoms)} disease:${session.possibleDisease}`,
      },
    ];
  }
  const references = await searchSimilar(message, 2);
  const referencesText = references.map((reference) => `${reference.metadata?.filename}: ${reference.text}`).join("\n\n");

  session.insuranceRecommendationHistory.push({ role: "user", content: `Task: respond to user question in their preferred language, using the provided reference for context.\n\n Question: ${message}\n\n Reference: ${referencesText} ` });
  const response = await createChatCompletion({
    messages: session.insuranceRecommendationHistory,
    tools: chatManager.getTools(),
    tool_choice: 'auto',
  });

  if (response?.choices[0].message.tool_calls) {
    console.log("Tool calls:", response.choices[0].message.tool_calls);
    const ret = await handleToolCalls(response.choices[0].message, chatManager);
    const toolMessage = ret.toolMessage;
    const type = ret.type;
    return { message: toolMessage, type };
  }

  const chatMessage = response?.choices[0].message.content;
  session.insuranceRecommendationHistory.push({ role: "assistant", content: chatMessage });
  return { message: chatMessage, type: 'text' };
}

export async function handler(request) {
  const { message } = request.body;
  const { session } = request;
  const chatManager = new ChatManager({ session });

  if (!session.chatHistory) {
    session.chatHistory = [
      {
        role: "developer",
        content: "You are a helpful health assistant and response with user language, designed to assist the user in identifying possible diseases, if the user having mental health issues, you should ask the user to see a doctor",
      },
    ];
  }

  if (session.currentStep === STEPS.DOCUMENT_Q_AND_A) {
    return await handleInsuranceQA(session, message, chatManager);
  }

  if (session.currentStep === STEPS.DOCTOR_RECOMMENDATION) {
    return await handleDoctorRecommendation(session, message, chatManager);
  }

  if (session.currentStep === STEPS.DOCTOR_Q_AND_A) {
    return await handleDoctorQA(session, message, chatManager);
  }

  if (session.currentStep === STEPS.INSURANCE_RECOMMENDATION) {
    return await handleInsuranceRecommendation(session, message, chatManager);
  }

  session.chatHistory.push({ role: "user", content: message });
  let response;
  try {
    response = await createChatCompletion({
      model: "gpt-4o-mini",
      messages: session.chatHistory,
      tools: chatManager.getTools(),
      tool_choice: "auto",
    });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }

  let type = "text";
  let data = null;
  let toolMessage = "";

  if (response?.choices[0].message.tool_calls) {
    console.log("Tool calls:", response.choices[0].message.tool_calls);
    const ret = await handleToolCalls(response.choices[0].message, chatManager);
    toolMessage = ret.toolMessage;
    type = ret.type;
    data = ret.data;
  } else {
    session.chatHistory.push({ role: "assistant", content: response?.choices[0].message.content });
  }

  // 最终返回 AI 回复（优先使用 chatMessage，否则使用工具返回的消息）
  const chatMessage = response?.choices[0].message.content || toolMessage || "";
  return { message: chatMessage, type, data };
}

