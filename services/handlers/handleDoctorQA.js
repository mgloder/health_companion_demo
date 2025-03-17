import { zodResponseFormat } from "openai/helpers/zod";

import { checkDoctorsInCoverage, MESSAGE_TYPES } from "../chatManager.js";
import { createChatCompletion } from "../../utils/openai.js";
import { RESPONSE_FORMAT } from "../../utils/healthAssistantUtilEN.js";

export async function handleDoctorQA(session, message, chatManager) {
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
  let type = MESSAGE_TYPES.RECOMMEND_INSURANCE;
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

async function handleToolCalls(message, chatManager) {
  let toolMessage = "";
  let type = MESSAGE_TYPES.TEXT;
  let data = null;
  for (const toolCall of message.tool_calls) {
    const { function: { name, arguments: argStr } } = toolCall;
    console.log(`handle doctor Q&A ${name} tool call arguments:`, argStr);

    if (name === 'user_need_recommend_insurance') {
      chatManager.handleNeedRecommendInsurance(message);
      type = MESSAGE_TYPES.NEED_RECOMMEND_INSURANCE;
    }
  }
  return { type, toolMessage, data };
}

