import { createChatCompletion, insuranceRankedByRelatedness } from "../../utils/openai.js";

export async function handleInsuranceQA(session, message, chatManager) {
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

async function handleToolCalls(message, chatManager) {
  let toolMessage = "";
  let type = "text";
  let data = null;
  for (const toolCall of message.tool_calls) {
    const { id: toolCallId, function: { name, arguments: argStr } } = toolCall;
    console.log(`handle insurance Q&A ${name} tool call arguments:`, argStr);
    const args = JSON.parse(argStr);

    if (name === "user_need_recommend_doctor") {
      toolMessage = chatManager.handleNeedRecommendDoctor(toolCallId, args);
    }
  }
  return { type, toolMessage, data };
}
