import { searchSimilar } from "../../utils/cosmos.js";
import { createChatCompletion } from "../../utils/openai.js";
import { MESSAGE_TYPES } from "../chatManager.js";

export async function handleInsuranceRecommendation(session, message, chatManager) {
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
  return { message: chatMessage, type: MESSAGE_TYPES.TEXT };
}

async function handleToolCalls(message, chatManager) {
  let toolMessage = "";
  let type = MESSAGE_TYPES.TEXT;
  let data = null;
  for (const toolCall of message.tool_calls) {
    const { id: toolCallId, function: { name, arguments: argStr } } = toolCall;
    console.log(`handle insurance recommendation ${name} tool call arguments:`, argStr);
    const args = JSON.parse(argStr);

    if (name === 'user_want_to_purchase_insurance') {
      toolMessage = chatManager.handleWantToPurchaseInsurance(toolCallId, args);
      type = MESSAGE_TYPES.PURCHASE_INSURANCE;
    }

  }
  return { type, toolMessage, data };
}

