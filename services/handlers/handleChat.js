import { createChatCompletion } from "../../utils/openai.js";
import { MESSAGE_TYPES, STEPS } from "../chatManager.js";

export async function handleChat(session, message, chatManager) {
  if (!session.chatHistory) {
    session.chatHistory = [
      {
        role: "developer",
        content: `
        You are a helpful health assistant, designed to assist the user in identifying possible diseases.
        
        Requirement:
        1. if the user having mental health issues, you should ask the user to see a doctor.
        2. response message should translate to user language unless the user input is in English.
        `,
      },
    ];
  }

  session.chatHistory.push({ role: "user", content: message });
  let response;
  try {
    response = await createChatCompletion({
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

  const chatMessage = response?.choices[0].message.content || toolMessage || "";
  console.log(session.chatHistory);
  return { message: chatMessage, type, data };
}

async function handleToolCalls(message, chatManager) {
  let toolMessage = "";
  let type = MESSAGE_TYPES.TEXT;
  let data = null;
  for (const toolCall of message.tool_calls) {
    const { id: toolCallId, function: { name, arguments: argStr } } = toolCall;
    console.log(`handle chat ${name} tool call arguments:`, argStr);
    const args = JSON.parse(argStr);

    if (name === "collect_user_symptoms") {
      chatManager.addChatMessage(message);
      toolMessage = await chatManager.handleCollectInfo(toolCallId, args);
      if (chatManager.getCurrentStep() === STEPS.GENERATE_POSSIBLE_DISEASES) {
        type = MESSAGE_TYPES.CONFIRM_POSSIBLE_DISEASE;
        data = JSON.parse(toolMessage);
      }
    }

    if (name === "user_confirm_diagnosis") {
      chatManager.addChatMessage(message);
      toolMessage = await chatManager.handleConfirmDiagnosis(toolCallId, args);
      type = MESSAGE_TYPES.CONFIRM_INSURANCE_UPLOAD;
    }

    if (name === "user_reject_diagnosis") {
      chatManager.addChatMessage(message);
      toolMessage = await chatManager.handleRejectDiagnosis(toolCallId, args);
    }

    if (name === "user_uploaded_insurance_coverage") {
      toolMessage = await chatManager.handleUploadedInsuranceCoverage(toolCallId, args);
      type = MESSAGE_TYPES.CONFIRM_INSURANCE;
      data = JSON.parse(toolMessage);
    }

    if (name === "user_reject_upload") {
      console.log("user_reject_upload called");
    }

    if (name === "user_need_more_detail") {
      chatManager.addChatMessage(message);
      toolMessage = await chatManager.handleNeedMoreDetail(toolCallId, args);
    }
  }
  return { type, toolMessage, data };
}
