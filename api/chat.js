import { createChatCompletion, stringsRankedByRelatedness } from "../utils/openai.js";
import { ChatManager, STEPS } from "./healthAssistantMachine.js";
import doctors from "../data/dummy_medical_data.json" with { type: "json" };
import { zodResponseFormat } from "openai/helpers/zod";
import { RESPONSE_FORMAT } from "../utils/healthAssistantUtil.js";

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


  }
  return { type, toolMessage, data };
}

async function handleInsuranceQA(message, chatManager) {
  const ret = await stringsRankedByRelatedness(message, 1);
  const { content } = ret[0];
  let messages = [{ role: "user", content: `Question: ${message}; Reference: ${content}` }];
  const response = await createChatCompletion({
    messages: messages,
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
  return { message: chatMessage, type, data };
}

async function handleDoctorRecommendation(session, message, chatManager) {
  if (!session.recommendDoctorHistory) {
    session.recommendDoctorHistory = [
      {
        role: "developer",
        content: `You are a helpful health assistant specialized in recommending doctors. Based on the user's symptoms, location, and preferences, provide tailored doctor recommendations that best match their needs. Reference: ${JSON.stringify(doctors)}`,
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
  data = JSON.parse(chatMessage);
  session.recommendDoctorHistory.push({ role: "assistant", content: chatMessage });
  console.log(session.recommendDoctorHistory);
  return { message: chatMessage, type, data };
}

export async function handler(request) {
  const { message } = request.body;
  const { session } = request;
  const chatManager = new ChatManager({ session });

  if (!session.chatHistory) {
    session.chatHistory = [
      {
        role: "developer",
        content: "You are a helpful health assistant, designed to assist the user in identifying possible diseases",
      },
    ];
  }

  if (session.currentStep === STEPS.DOCUMENT_Q_AND_A) {
    return await handleInsuranceQA(message, chatManager);
  }

  if (session.currentStep === STEPS.DOCTOR_RECOMMENDATION) {
    return await handleDoctorRecommendation(session, message, chatManager);
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

