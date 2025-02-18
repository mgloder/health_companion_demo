import { createChatCompletion } from '../utils/openai.js';
import { ChatManager } from './healthAssistantMachine.js';

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

async function makeOpenAIRequest(messages, client) {
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await client({
        messages: messages,
        model: "gpt-4o-mini",
        temperature: 0.7
      });
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  
  throw new Error(`Failed to get OpenAI response after ${maxRetries} attempts: ${lastError.message}`);
}

async function handleToolCall(toolCall, chatManager, client) {
  const { function: { name, arguments: args }, id: toolCallId } = toolCall;
  let response;

  switch (name) {
    case 'collect_user_symptoms':
      chatManager.getSymptoms().push(JSON.parse(args));
      chatManager.session.symptoms = chatManager.getSymptoms();
      chatManager.session.askedQuestions = chatManager.getAskedQuestions() + 1;

      if (chatManager.session.askedQuestions < MAX_FOLLOW_UP_QUESTIONS) {
        chatManager.addToolChatMessage(toolCallId, `请根据用户的输入信息，提问更具提的问题`);
      } else {
        chatManager.session.currentStep = STEPS.GENERATE_POSSIBLE_DISEASES;
        chatManager.addToolChatMessage(toolCallId, `根据信息 ${JSON.stringify(chatManager.getSymptoms())} 以列表的方式列出可能的疾病`);
      }
      break;

    case 'user_confirm_diagnosis':
      chatManager.session.currentStep = STEPS.CONFIRMED_WITH_USER;
      chatManager.addToolChatMessage(toolCallId, `根据信息 ${JSON.stringify(chatManager.getSymptoms())} 推荐挂号的科室`);
      break;

    case 'user_reject_diagnosis':
      chatManager.addToolChatMessage(toolCallId, `根据信息 ${JSON.stringify(chatManager.getSymptoms())} 以列表的方式列出可能的疾病 返回的信息要求严格避免使用 Markdown、LaTeX 或其他富文本语法，所有换行请使用 HTML 的 <br> 标签`);
      break;
  }

  response = await makeOpenAIRequest(chatManager.getChatHistory(), client);
  chatManager.addChatMessage(response.choices[0].message);
  return response.choices[0].message.content;
}

export async function handler(request) {
  const { message } = request.body;
  const { session } = request;

  // Initialize chat history if it doesn't exist
  if (!session.chatHistory) {
    session.chatHistory = [
      {
        role: "system",
        content: "You are a helpful health assistant, designed to assist the user in identifying possible diseases"
      }
    ];
  }

  // Add user message to history
  session.chatHistory.push({ role: "user", content: message });

  // Initialize chat manager with session context
  const chatManager = new ChatManager({ session });

  request.log.debug({
    msg: 'Making chat completion request',
    messageCount: session.chatHistory.length,
    currentStep: chatManager.getCurrentStep(),
    symptoms: chatManager.getSymptoms(),
    askedQuestions: chatManager.getAskedQuestions()
  });

  // Get completion from OpenAI with tools
  let response;
  try {
    response = await makeOpenAIRequest(
      chatManager.getChatHistory(), 
      createChatCompletion
    );
  } catch (error) {
    request.log.error("Error calling OpenAI:", {
      error: error.message,
      stack: error.stack,
      details: error.cause || 'No additional details',
      url: error.url
    });
    throw error;
  }

  let type = "text";
  let data = null;
  let toolMessage = "";

  // Handle tool calls if present
  if (response?.choices[0].message.tool_calls) {
    const toolCalls = response.choices[0].message.tool_calls;
    for (const toolCall of toolCalls) {
      toolMessage = await handleToolCall(toolCall, chatManager, createChatCompletion);
    }
  } else {
    // If no tool calls, add assistant's response to history
    session.chatHistory.push(response.choices[0].message);
  }

  // Use tool message if available, otherwise use assistant's message
  const chatMessage = response?.choices[0].message.content || toolMessage || "";

  return {
    type,
    message: chatMessage,
    data
  };
}
