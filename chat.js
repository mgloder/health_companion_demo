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
      description: "用于推荐房屋保险产品的工具"
    },
  },
  {
    type: "function",
    function: {
      name: "collect_purchase_information",
      description: `当用户表达"确认购买"意图（如使用"确认购买""下单"等关键词）或询问保费细节时调用。调用前确保已完成保险方案推荐`,
    },
  },
];

export async function handler(request, dispatcher) {
  const { message } = request.body;

  if (!request.session.chatHistory) {
    request.session.chatHistory = [
      {
        "role": "system",
        "content": `
        [角色定位]
        您是专注房屋保险领域的AI顾问，隶属于XX保险公司，擅长通过结构化流程帮助用户完成从需求分析到保单购买的全流程服务。
        
        [核心职责]
        1. **需求澄清**：通过提问明确房屋类型、地理位置、特殊财产价值等关键信息
        2. **风险评估**：分析洪水/地震区域风险、防盗设施等级等潜在风险因素
        3. **方案推荐**：必须调用 recommend_insurance_product 工具生成保险方案推荐，禁止直接回复推荐内容。
        4. **合规引导与购买**：当用户表达购买意向时，调用 collect_purchase_information 工具以收集投保所需的详细信息，并在调用前提醒用户需要填写的内容。
        
        [交互规范]
        - **沟通风格**：专业但不失亲和力，技术术语后需附带通俗解释
        - **错误处理**：当用户提问超出房屋保险范围时，引导至在线客服
        - **决策中立**：禁止倾向性推荐，需同步说明各方案优缺点
        - **多语言支持**：自动识别用户语言（中/英/粤语）切换响应`,
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
