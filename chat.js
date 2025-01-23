import OpenAI from "openai";

const insuranceData = [
  {
    insuranceName: "装修保险",
    insuranceCompany: "蓝十字",
    insurancePrice: "1450",
    insuranceDiscountPrice: "1255",
  },
  {
    insuranceName: "豐隆家居裝修保險",
    insuranceCompany: "Hong Leong 豐隆",
    insurancePrice: "980",
  },
  {
    insuranceName: "Contractors 'All Risks' Insurance",
    insuranceCompany: "安盛",
    insurancePrice: "1650",
    insuranceDiscountPrice: "1500",
  },
];


const tools = [
  {
    type: "function",
    function: {
      name: "recommend_insurance_product",
      description: "当用户想要购买保险时，推荐合适的保险产品。",
      parameters: {
        type: 'object',
        properties: {
          user_preferences: {
            type: 'string',
            description: '用户的偏好或需求，例如保险类型、预算等。',
          },
        },
        required: ['user_preferences'],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "collect_purchase_information",
      description: "当用户确认购买保险时，收集用于购买保险的投保人基本信息。",
      parameters: {
        type: 'object',
        properties: {
          product_name: {
            type: 'string',
            description: '用户选择的保险产品名称。',
          },
          user_name: {
            type: 'string',
            description: '用户的姓名。',
          },
          user_email: {
            type: 'string',
            description: '用户的电子邮件地址。',
          },
          user_phone: {
            type: 'string',
            description: '用户的电话号码。',
          },
          user_address: {
            type: 'string',
            description: '用户的地址。',
          },
        },
        required: ['product_name', 'user_name', 'user_email', 'user_phone'],
      },
    },
  },
];

export async function handler(request, dispatcher) {
  const { message } = request.body;

  if (!request.session.chatHistory) {
    request.session.chatHistory = [
      {
        "role": "system",
        "content": "You are a helpful insurance assistant to help the user buy a product.",
      },
    ];
  }


  const openai = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: "sk-9f01f2c2d59545308e04e61eea160628",
  });
  request.session.chatHistory.push({ role: "user", content: message });

  console.log(`session history: `, request.session.chatHistory);

  let response;
  try {
    response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: request.session.chatHistory,
      tools,
      tool_choice: "auto",
    });
  } catch (error) {
    console.error(error);
  }

  let type = "text";
  let data = null;

  if (response?.choices[0].message.tool_calls) {
    const toolCalls = response.choices[0].message.tool_calls;
    for (const toolCall of toolCalls) {
      const { name, arguments: args } = toolCall.function;
      console.log('arguments', args);

      if (name === "recommend_insurance_product") {
        const { user_preferences } = JSON.parse(args);
        console.log(`用户偏好 ${user_preferences} 推荐产品: ${insuranceData}`);

        type = "recommendation";
        data = insuranceData;
      } else if (name === "collect_purchase_information") {
        const { product_name, user_name, user_email, user_phone } = JSON.parse(args);
        console.log("收集购买信息:", { product_name, user_name, user_email, user_phone });

        type = "form";
      }
    }
  }


  // 获取 AI 的回复
  const aiMessage = response?.choices[0].message.content;

  // 将 AI 的回复添加到聊天记录中
  request.session.chatHistory.push({ role: "assistant", content: aiMessage });
  return { aiMessage, type, data };
}
