import { createChatCompletion } from '../utils/openai.js';
import { ChatManager, STEPS } from "./healthAssistantMachine.js";

export function registerChatRoutes(server) {
  server.post('/api/chat', async (request, reply) => {
    try {
      const result = await handler(request);
      return result;
    } catch (error) {
      request.log.error({
        msg: 'Chat completion failed',
        error: error.message,
        stack: error.stack
      });

      reply.code(500).send({
        success: false,
        error: 'Failed to process chat request',
        details: error.message
      });
    }
  });
}

async function handleToolCalls(message, chatManager) {
  let toolMessage = '';
  let type = 'text';
  let data = null;
  chatManager.addChatMessage(message);
  for (const toolCall of message.tool_calls) {
    const { id: toolCallId, function: { name, arguments: argStr } } = toolCall;
    console.log(`${name} tool call arguments:`, argStr);
    const args = JSON.parse(argStr);

    if (name === "collect_user_symptoms") {
      toolMessage = await chatManager.handleCollectInfo(toolCallId, args);
      if (chatManager.getCurrentStep() === STEPS.GENERATE_POSSIBLE_DISEASES) {
        type = 'confirm'
        data = JSON.parse(toolMessage);
      }
    }

    if (name === "user_confirm_diagnosis") {
      toolMessage = await chatManager.handleConfirmDiagnosis(toolCallId, args);
    }

    if (name === "user_reject_diagnosis") {
      toolMessage = await chatManager.handleRejectDiagnosis(toolCallId, args);
    }
  }
  return { type, toolMessage, data };
}

export async function handler(request) {
  const { message } = request.body;
  const { session } = request;

  if (!session.chatHistory) {
    session.chatHistory = [
      {
        role: "developer",
        content: "You are a helpful health assistant, designed to assist the user in identifying possible diseases",
      },
    ];
  }
  session.chatHistory.push({ role: "user", content: message });

  const chatManager = new ChatManager({ session });

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

