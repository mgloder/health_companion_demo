import { createChatCompletion } from '../utils/openai.js';
import { getChatManager } from './healthAssistantMachine.js';

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

async function makeOpenAIRequest({ client, messages, tools = null }) {
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await client({
        messages,
        model: "gpt-4o-mini",
        temperature: 0.7,
        tools,
        tool_choice: tools ? "auto" : null
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

export async function handler(request) {
  const { message } = request.body;
  const { session } = request;
  const sessionId = session.sessionId;

  request.log.info({
    msg: 'Processing chat request',
    sessionId,
    message
  });

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

  // Use singleton instance
  const chatManager = getChatManager();

  request.log.debug({
    msg: 'Making chat completion request',
    messageCount: session.chatHistory.length,
    currentState: chatManager.getState(session.sessionId),
    followUpCount: chatManager.getFollowUpCount(session.sessionId)
  });

  // Get completion from OpenAI with tools
  let response;
  try {
    response = await makeOpenAIRequest({
      client: createChatCompletion,
      messages: session.chatHistory,
      tools: chatManager.getTools(session.sessionId)
    });
  } catch (error) {
    request.log.error("Error calling OpenAI:", {
      error: error.message,
      stack: error.stack,
      details: error.cause || 'No additional details',
      url: error.url
    });
    throw error;
  }

  let finalResponse = null
  let finalResponseType = null;
  let finalData = null;
  
  // Handle tool calls if present
  if (response?.choices[0].message.tool_calls) {
    const toolCalls = response.choices[0].message.tool_calls;
    for (const toolCall of toolCalls) {
      const [toolsResponse, responseType, data] = await handleToolCall(toolCall, chatManager, createChatCompletion);
      chatManager.update_state_with_tool_call(session.sessionId, toolCall);
      finalResponse = toolsResponse;
      finalResponseType = responseType;
      finalData = data;
    }
  } else{
    finalResponse = response.choices[0].message.content;
    finalResponseType = "text";
    finalData = null;
  }

  // Use tool message if available, otherwise use assistant's message

  return {
    finalResponseType,
    message: finalResponse,
    finalData,
    currentState: chatManager.getState(session.sessionId)
  };
}

async function handleToolCall(toolCall, chatManager, createChatCompletion) {
  const { name, arguments: args } = toolCall.function;

  if (name === 'collect_user_symptoms') {
    // Parse the symptoms from the tool call
    const parsedArgs = JSON.parse(args);
    
    // Get a response from OpenAI about the symptoms
    const response = await createChatCompletion({
      messages: [{
        role: "system",
        content: `根据用户的症状去询问更细节的症状, 问题应该简洁，主要的症状：${parsedArgs.symptoms}, 其他信息: ${parsedArgs.others || 'None'}`
      }],
      temperature: 0.7
    });

    return [response.choices[0].message.content, "text", null];
  } else if (name === 'user_confirm_diagnosis') {
    return ["好的了解！现在我会根据这个症状去查询一下我们的医疗保险有没有覆盖到相关的疾病，请稍等。", "text", null];
  } else if (name === 'user_reject_diagnosis') {
    return ["好的，我明白了。那我们将会重新开始收集不舒服的症状，请您重新描述一下关键的症状", "text", null];
  }

  // Default return for other tool calls
  return ["", "text", null];
}
