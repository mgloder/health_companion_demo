import { zodResponseFormat } from "openai/helpers/zod";
import { checkDoctorsInCoverage, MESSAGE_TYPES, STEPS } from "../chatManager.js";
import { createChatCompletion } from "../../utils/openai.js";
import { RESPONSE_FORMAT as RESPONSE_FORMAT_EN} from "../../utils/healthAssistantUtilEN.js";
import { RESPONSE_FORMAT as RESPONSE_FORMAT_CN } from "../../utils/healthAssistantUtil.js";

import doctors from "../../data/dummy_medical_data.json" with { type: "json" };

export async function handleDoctorRecommendation(session, message, chatManager, isEN = false) {
  const RESPONSE_FORMAT = isEN ? RESPONSE_FORMAT_EN : RESPONSE_FORMAT_CN;

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
  let type = MESSAGE_TYPES.RECOMMEND_DOCTOR;
  let data = null;

  if (response?.choices[0].message.tool_calls) {
    console.log("Tool calls:", response.choices[0].message.tool_calls);
    const ret = await handleToolCalls(response.choices[0].message, chatManager);
    toolMessage = ret.toolMessage;
    type = ret.type;
  }
  const chatMessage = response?.choices[0].message.content || toolMessage || "";
  if (type !== MESSAGE_TYPES.TEXT) {
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

async function handleToolCalls(message, chatManager) {
  let toolMessage = "";
  let type = MESSAGE_TYPES.TEXT;
  let data = null;
  for (const toolCall of message.tool_calls) {
    const { id: toolCallId, function: { name, arguments: argStr } } = toolCall;
    console.log(`handle doctor recommendation ${name} tool call arguments:`, argStr);
    const args = JSON.parse(argStr);

    if (name === "user_prefer_doctor") {
      chatManager.addRecommendMessage(message);
      toolMessage = await chatManager.handlePreferDoctor(toolCallId, args);
      type = MESSAGE_TYPES.RECOMMEND_DOCTOR;
    }
  }
  return { type, toolMessage, data };
}

