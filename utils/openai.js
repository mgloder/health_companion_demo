import pino from "pino";
import OpenAI from 'openai';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { cosineSimilarity } from "./math.js";
import embeddingDoc from "../data/embeddings.json" with { type: "json" };
import contentDoc from "../data/content.json" with { type: "json" };

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

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }

  let openaiConfig = {
    apiKey: process.env.OPENAI_API_KEY,
  };

  // Only use proxy agent in development environment
  if (process.env.NODE_ENV === "development") {
    const proxyUrl = process.env.ALL_PROXY;
    const proxyAgent = new HttpsProxyAgent(proxyUrl);
    openaiConfig.httpAgent = proxyAgent;
    openaiConfig.httpsAgent = proxyAgent;
  }

  const openai = new OpenAI(openaiConfig);
  return openai;
}

export async function createChatCompletion({
  messages,
  model = "gpt-4o-mini",
  temperature = 0.7,
  tools = null,
  tool_choice = null ,
  response_format = { type: 'text' },
}) {
  const openai = getOpenAI();

  try {
    const completion = await openai.chat.completions.create({
        messages: messages,
        model: model,
        temperature: temperature,
        tools: tools,
        tool_choice: tool_choice,
        response_format
    });

    return completion;
  } catch (error) {
      console.error('Error in chat completion:', error);
      throw error;
  }
}

async function createEmbedding({ input, model = "text-embedding-3-small" }) {
  const openai = getOpenAI();

  try {
    const response = await openai.embeddings.create({ model, input });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
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
  createChatCompletion,
  createEmbedding
};




export async function stringsRankedByRelatedness(query, topN = 10) {
  try {
    // 获取查询的 Embedding
    const queryEmbedding = await createEmbedding({ input: query });

    // 获取已上传文件的 Embeddings
    const documentEmbeddings = embeddingDoc[0].chunks.map((doc, index) => ({
        embedding: doc.embedding,
        content: contentDoc[0].chunks[index].content,
      }));

    // 计算查询与每个文档的相似度
    const stringsAndRelatednesses = documentEmbeddings.map((doc) => ({
      ...doc,
      relatedness: cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    // 按相似度排序
    stringsAndRelatednesses.sort((a, b) => b.relatedness - a.relatedness);

    // 返回最相似的前 N 个文档
    return stringsAndRelatednesses.slice(0, topN);
  } catch (error) {
    console.error("Error ranking strings by relatedness:", error);
    throw error;
  }
}
