import OpenAI from "openai";

const insuranceData = [
  {
    insuranceName: "Contractors 'All Risks' Insurance",
    insuranceCompany: "安盛",
    insurancePrice: "1650",
    insuranceDiscountPrice: "1500",
    advantages: [
      "屬於市面上較多人撰擇的公司品牌",
      "12月有镯家75折優惠"
    ]
  },
  {
    insuranceName: "装修保险",
    insuranceCompany: "蓝十字",
    insurancePrice: "1450",
    insuranceDiscountPrice: "1255",
    advantages: [
      "A1A友邦集團全资擁有",
      "装修後保養期莲12個月比市面上大部分只有36個月長"
    ]
  },
  {
    insuranceName: "豐隆家居裝修保險",
    insuranceCompany: "Hong Leong 豐隆",
    insurancePrice: "980",
    advantages: [
      "性價比高",
      "各项保障都比較全面"
    ]
  }
];


const tools = [
  {
    type: "function",
    function: {
      name: "recommend_insurance_product",
      description: "当用户想要获得房屋保险推荐的时候，推荐合适的保险产品。"
    },
  },
  {
    type: "function",
    function: {
      name: "collect_purchase_information",
      description: "当用户想要购买保险时，或想要询价时",
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
  request.session.chatHistory.push({ role: "user", content: message });

  console.log(`session history: `, request.session.chatHistory);

  let response;
  try {
    response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
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
