
const MAX_FOLLOW_UP_QUESTIONS = 3;

const COLLECT_USER_SYMPTOMS = {
  type: "function",
  function: {
    name: "collect_user_symptoms",
    parameters: {
      type: "object",
      properties: {
        symptoms: { type: "string", description: "主要病症" },
        others: { type: "string", description: "关于症状的其他信息" },
      },
      required: ["primary_symptoms"],
    },
    description: "收集用户提供的症状相关信息",
  },
};

const USER_CONFIRM_DIAGNOSIS = {
  type: "function",
  function: {
    name: "user_confirm_diagnosis",
    description: "用户确认病情与 AI 描述一致",
  },
};

const USER_REJECT_DIAGNOSIS = {
  type: "function",
  function: {
    name: "user_reject_diagnosis",
    description: "用户确认病情与 AI 描述不一致",
  },
};

export const STEPS = {
  COLLECT_INFO: 1,
  GENERATE_POSSIBLE_DISEASES: 2,
  CONFIRMED_WITH_USER: 3,
};


export class ChatManager {
  constructor({ session }) {
    this.session = session;
  }

  getChatHistory() {
    return this.session.chatHistory;
  }

  getSymptoms() {
    return this.session.symptoms || [];
  }

  getAskedQuestions() {
    return this.session.askedQuestions || 0;
  }

  getCurrentStep() {
    return this.session.currentStep;
  }

  addToolChatMessage(toolCallId, content) {
    this.session.chatHistory.push({
      role: "assistant",
      content: null,
      tool_calls: [{
        id: toolCallId,
        type: "function",
        function: { name: "collect_info", arguments: JSON.stringify({ message: content }) }
      }]
    });
  }

  addChatMessage(message) {
    this.session.chatHistory.push(message);
  }

  getTools() {
    // Return your tools configuration
  }
}
