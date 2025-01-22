import OpenAI from 'openai';

export async function handler(req, reply) {
  try {
    const { summary } = req.body;
    const { dispatcher } = req;

    if (!summary) {
      throw new Error('Summary is required');
    }

    if (!dispatcher) {
      throw new Error('Dispatcher is required');
    }

    // Create OpenAI client with custom fetch using our dispatcher
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

    console.log('Making OpenAI request for summary:', summary);
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `
          你是一名专业的健身教练，负责与用户进行互动并总结每次的聊天内容。你的总结应当以教练的口吻，简洁明了地回顾用户的进展、成就和未来的目标。总结的风格应积极、鼓励，并带有一定的专业性和亲和力，且以用户对话的方式来总结。

          总结示例：
          
      "我今天很开心和 Enoch 聊天。他的情况非常好，连续四周超越了他的运动目标，整体保持健康！💪 而且已经在 3 个月内减了 3 公斤。我们将会继续专注在六个月内实现更健康生活方式的目标。🎯 Enoch 真的很努力，作为他的教练我非常骄傲！😆"
          `
        },
        {
          role: "user",
          content: `帮我总结下："${summary}"`
        }
      ],
      response_format: { type: "text" },
      temperature: 0.8
    });

    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API');
    }

    const result = completion.choices[0].message.content;

    console.log('Successfully parsed exercise data:', result);
    reply.code(200).send({ summary: result });

  } catch (error) {
    console.error('Exercise parsing error:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    // Specific error messages for different scenarios
    if (error.message.includes('OpenAI API')) {
      reply.code(503).send({
        error: 'OpenAI service unavailable',
        details: error.message
      });
    } else if (error.message.includes('Invalid')) {
      reply.code(422).send({
        error: 'Invalid data received',
        details: error.message
      });
    } else {
      reply.code(500).send({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
}
