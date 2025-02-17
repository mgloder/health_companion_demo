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
  constructor(context) {
    this.openai = context.openai;
    this.session = context.session;
  }

  async handleCollectInfo(toolCallId, args) {
    this.getSymptoms().push(args);
    this.session.symptoms = this.getSymptoms();
    this.session.askedQuestions = this.getAskedQuestions() + 1;

    if (this.session.askedQuestions < MAX_FOLLOW_UP_QUESTIONS) {
      this.addToolChatMessage(toolCallId, `请根据用户的输入信息，提问更具提的问题`);
    } else {
      this.session.currentStep = STEPS.GENERATE_POSSIBLE_DISEASES;
      this.addToolChatMessage(toolCallId, `根据信息 ${JSON.stringify(this.getSymptoms())} 以列表的方式列出可能的疾病`);
    }
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: this.getChatHistory(),
    });
    this.addChatMessage(response.choices[0].message);
    console.log(this.getChatHistory());
    return response.choices[0].message.content;
  }

  async handleConfirmDiagnosis(toolCallId, args) {
    this.session.currentStep = STEPS.CONFIRMED_WITH_USER;

    this.addToolChatMessage(toolCallId, `根据信息 ${JSON.stringify(this.getSymptoms())} 推荐挂号的科室`);
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: this.getChatHistory(),
    });
    this.addChatMessage(response.choices[0].message);
    console.log(this.getChatHistory());
    return response.choices[0].message.content;
  }

  async handleRejectDiagnosis(toolCallId, args) {
    this.addToolChatMessage(toolCallId, `根据信息 ${JSON.stringify(this.getSymptoms())} 以列表的方式列出可能的疾病`);

    console.log(this.getChatHistory());
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: this.getChatHistory(),
    });
    this.addChatMessage(response.choices[0].message);
    console.log(this.getChatHistory());
    return response.choices[0].message.content;
  }

  addChatMessage(message) {
    this.session.chatHistory.push(message);
  }

  addToolChatMessage(toolCallId, content) {
    this.session.chatHistory.push({
      role: "tool",
      tool_call_id: toolCallId,
      content,
    });
  }

  getSymptoms() {
    return this.session.symptoms || [];
  }

  getChatHistory() {
    return this.session.chatHistory || [];
  }

  getAskedQuestions() {
    return this.session.askedQuestions || 0;
  }

  getCurrentStep() {
    return this.session.currentStep || STEPS.COLLECT_INFO;
  }

  getTools() {
    let tools = [];
    if (this.getCurrentStep() === STEPS.COLLECT_INFO) {
      tools.push(COLLECT_USER_SYMPTOMS);
    }
    if (this.getCurrentStep() === STEPS.GENERATE_POSSIBLE_DISEASES) {
      tools.push(USER_CONFIRM_DIAGNOSIS);
      tools.push(USER_REJECT_DIAGNOSIS);
    }
    return tools;
  }
}
