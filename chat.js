import OpenAI from "openai";
import { ChatManager, STEPS } from "./healthAssistantMachine.js";

async function handleToolCalls(message, chatManager) {
  let toolMessage = '';
  let type = 'text';
  chatManager.addChatMessage(message);
  for (const toolCall of message.tool_calls) {
    const { id: toolCallId, function: { name, arguments: argStr } } = toolCall;
    console.log(`${name} tool call arguments:`, argStr);
    const args = JSON.parse(argStr);

    if (name === "collect_user_symptoms") {
      toolMessage = await chatManager.handleCollectInfo(toolCallId, args);
      type = chatManager.getCurrentStep() === STEPS.GENERATE_POSSIBLE_DISEASES ? 'confirm' : 'text';
    }

    if (name === "user_confirm_diagnosis") {
      toolMessage = await chatManager.handleConfirmDiagnosis(toolCallId, args);
    }

    if (name === "user_reject_diagnosis") {
      toolMessage = await chatManager.handleRejectDiagnosis(toolCallId, args);
      type = chatManager.getCurrentStep() === STEPS.GENERATE_POSSIBLE_DISEASES ? 'confirm' : 'text';
    }
  }
  return { type, toolMessage };
}

export async function handler(request, dispatcher) {
  const { message } = request.body;
  const { session } = request;

  if (!session.chatHistory) {
    session.chatHistory = [
      {
        role: "developer",
        content: `You are a helpful health assistant, designed to assist the user in identifying possible diseases and guiding them to the appropriate doctor based on their symptoms.
       `,
      },
    ];
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    fetch: async (url, options) => {
      try {
        const response = await fetch(url, { ...options, dispatcher });
        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }
        return response;
      } catch (error) {
        console.error("OpenAI API fetch error:", {
          url,
          error: error.message,
          stack: error.stack,
        });
        throw new Error(`Failed to connect to OpenAI API: ${error.message}`);
      }
    },
  });
  session.chatHistory.push({ role: "user", content: message });

  const chatManager = new ChatManager({ openai, session });

  let response;
  try {
    response = await openai.chat.completions.create({
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
    const ret = await handleToolCalls(response.choices[0].message, chatManager);
    toolMessage = ret.toolMessage;
    type = ret.type;
  } else {
    session.chatHistory.push({ role: "assistant", content: response?.choices[0].message.content });
  }

  // 最终返回 AI 回复（优先使用 chatMessage，否则使用工具返回的消息）
  const chatMessage = response?.choices[0].message.content || toolMessage || "";
  return { aiMessage: chatMessage, type, data };
}
