import pino from "pino";
import OpenAI from 'openai';
import { HttpsProxyAgent } from 'https-proxy-agent';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info'
});

// Log proxy configuration
logger.info({
  msg: 'Proxy configuration',
  nodeEnv: process.env.NODE_ENV,
  hasProxy: !!process.env.ALL_PROXY,
  proxyUrl: process.env.ALL_PROXY
});

export async function createChatCompletion({ 
  messages, 
  model = "gpt-4o", 
  temperature = 0.7,
  tools = null,
  tool_choice = null 
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  const proxyUrl = 'http://127.0.0.1:1087';
  const proxyAgent = new HttpsProxyAgent(proxyUrl);
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    httpAgent: proxyAgent,
    httpsAgent: proxyAgent
  });

  try {
    const completion = await openai.chat.completions.create({
        messages: messages,
        model: model,
        temperature: temperature,
        tools: tools,
        tool_choice: tool_choice
    });

    return completion
  } catch (error) {
      console.error('Error in chat completion:', error);
      throw error;
  }
}

export function initializeOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  // Any additional initialization logic can go here
  return true;
}

export const openai = {
  createChatCompletion
};
