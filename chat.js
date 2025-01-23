import OpenAI from 'openai';

export async function handler(request, dispatcher) {
  const { message } = request.body;

  // 从 session 中获取或初始化聊天记录
  if (!request.session.chatHistory) {
    request.session.chatHistory = [];
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
        console.error('OpenAI API fetch error:', {
          url,
          error: error.message,
          stack: error.stack
        });
        throw new Error(`Failed to connect to OpenAI API: ${error.message}`);
      }
    }
  });
  // 将用户的消息添加到聊天记录中
  request.session.chatHistory.push({ role: "user", content: message });

  // 调用 OpenAI 的 Chat Completion API
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: request.session.chatHistory,
    });
  } catch (error) {
    console.error(error);
  }


  // 获取 AI 的回复
  const aiMessage = response.choices[0].message.content;

  // 将 AI 的回复添加到聊天记录中
  request.session.chatHistory.push({ role: "assistant", content: aiMessage });
  return aiMessage;
}
