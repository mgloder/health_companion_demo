import OpenAI from "openai";

const STEPS = {
  COLLECT_USER_SYMPTOMS: 1,
  SEARCH_POSSIBLE_DISEASE: 2,
  CONFIRM_DIAGNOSIS: 3
};

const tools = [
  {
    type: "function",
    function: {
      name: "collect_user_symptoms_finished",
      description: "当用户确认已告知所有的病情时"
    },
  },
  {
    type: "function",
    function: {
      name: "search_possible_disease_finished",
      description: `当用户确认与 Agent 提供的疾病一致时`,
    },
  },
];

function handleToolCalls(response, type, data) {
  let step;
  const toolCalls = response.choices[0].message.tool_calls;
  for (const toolCall of toolCalls) {
    const { name, arguments: args } = toolCall.function;
    console.log("arguments", args);

    if (name === "collect_user_symptoms_finished") {
      console.log("collect_user_symptoms_finished");
      step = STEPS.SEARCH_POSSIBLE_DISEASE;

    } else if (name === "search_possible_disease_finished") {
      console.log("search_possible_disease_finished");
      step = STEPS.CONFIRM_DIAGNOSIS;
    }
  }
  return { type, data, step };
}

export async function handler(request, dispatcher) {
  const { message } = request.body;
  let currentStep = request.session.step;

  if (!request.session.chatHistory) {
    request.session.chatHistory = [
      {
        "role": "system",
        "content": `
        You are a helpful health assistant, designed to assist the user in identifying possible diseases and guiding them to the appropriate doctor based on their symptoms. 

        In the conversation:
        - You will ask one follow-up question based on the user's condition.
        - You will provide possible diseases based on information from Mayo Clinic.

        Current step: ${currentStep}

        If the user is in the 'COLLECT_USER_SYMPTOMS' phase, respond with:
        Collecting symptoms, asking follow-up question until collect all symptoms.
  
        If the user is in the 'SEARCH_POSSIBLE_DISEASE' phase, respond with:
        providing possible disease list based on Mayo Clinic.
        
        If the user is in the 'CONFIRM_DIAGNOSIS' phase, respond with:
        Confirming diagnosis, suggesting the next steps for treatment.
        `,
      },
    ];
  }

  if (!currentStep) {
    currentStep = STEPS.COLLECT_USER_SYMPTOMS
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
      model: "gpt-4o-mini",
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
    const result = handleToolCalls(response, type, data);
    type = result.type;
    data = result.data;
    if (result.step) {
      currentStep = result.step;
    }
  }


  // 获取 AI 的回复
  const aiMessage = response?.choices[0].message.content;

  // 将 AI 的回复添加到聊天记录中
  request.session.chatHistory.push({ role: "assistant", content: aiMessage });
  request.session.step = currentStep;
  return { aiMessage, type, data };
}
