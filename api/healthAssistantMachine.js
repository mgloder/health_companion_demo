import { createChatCompletion } from "../utils/openai.js";

const MAX_FOLLOW_UP_QUESTIONS = 3;

const COLLECT_USER_SYMPTOMS = {
  type: "function",
  function: {
    name: "collect_user_symptoms",
    parameters: {
      type: "object",
      properties: {
        symptoms: { type: "string", description: "用户描述的具体生理症状" },
        others: { type: "string", description: "用户提供的其他相关信息" },
      },
      required: ["primary_symptoms"],
    },
    description: "收集用户提供的症状及相关信息",
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

const USER_UPLOADED_INSURANCE_COVERAGE = {
  type: "function",
  function: {
    name: "user_uploaded_insurance_coverage",
    description: "用户确认了上传相关的医疗保险文档",
  },
};

const USER_REJECT_UPLOAD = {
  type: "function",
  function: {
    name: "user_reject_upload",
    description: "用户拒绝了上传相关的医疗保险文档",
  },
};

const CONFIRM_RESPONSE_FORMAT =  {
  "type": "json_schema",
    "json_schema": {
    "name": "health_assistant_response",
      "strict": true,
      "schema": {
      "type": "object",
        "properties": {
        "diseases": {
          "type": "array",
            "items": {
            "type": "string"
          }
        },
        "recommendation": {
          "type": "string"
        }
      },
      "required": ["diseases", "recommendation"],
        "additionalProperties": false
    }
  }
}

export const STEPS = {
  COLLECT_INFO: 1,
  GENERATE_POSSIBLE_DISEASES: 2,
  CONFIRMED_WITH_USER: 3,
  GENERATE_INSURANCE_COVERAGE: 4,
  DOCUMENT_Q_AND_A: 5,
  DOCTOR_RECOMMENDATION: 6,
  USER_CONFIRM_RECOMMENDATION: 7
};


export class ChatManager {
  constructor(context) {
    this.session = context.session;
  }

  async handleCollectInfo(toolCallId, args) {
    this.getSymptoms().push(args);
    this.session.symptoms = this.getSymptoms();
    this.session.askedQuestions = this.getAskedQuestions() + 1;
    let response_format;

    if (this.session.askedQuestions < MAX_FOLLOW_UP_QUESTIONS) {
      this.addToolChatMessage(toolCallId, `根据用户的症状去询问更细节的症状, 问题应该简洁`);
    } else {
      this.session.currentStep = STEPS.GENERATE_POSSIBLE_DISEASES;
      this.addToolChatMessage(toolCallId, `根据信息 ${JSON.stringify(this.getSymptoms())} 以列表的方式列出可能的疾病 请以纯文本的方式回复`);
      response_format = CONFIRM_RESPONSE_FORMAT;
    }
    const response = await createChatCompletion({
      model: "gpt-4o-mini",
      messages: this.getChatHistory(),
      response_format
    });
    this.addChatMessage(response.choices[0].message);
    return response.choices[0].message.content;
  }

  async handleConfirmDiagnosis(toolCallId, args) {
    this.session.currentStep = STEPS.CONFIRMED_WITH_USER;

    this.addToolChatMessage(toolCallId, `回复 "好的，我明白了！为了方便我帮您查询，您能上传一下医疗保险的相关文档吗？我会根据您的症状，看看保险是否覆盖相关的疾病。请您稍等一下哦~"`);
    const response = await createChatCompletion({
      model: "gpt-4o-mini",
      messages: this.getChatHistory(),
    });
    this.addChatMessage(response.choices[0].message);
    return response.choices[0].message.content;
  }

  async handleRejectDiagnosis(toolCallId, args) {
    // return collect_info step
    this.session.currentStep = STEPS.COLLECT_INFO;
    this.session.askedQuestions = 0;

    this.addToolChatMessage(toolCallId, `根据信息 ${JSON.stringify(this.getSymptoms())} 重新收集症状的细节`);

    const response = await createChatCompletion({
      model: "gpt-4o-mini",
      messages: this.getChatHistory(),
    });
    this.addChatMessage(response.choices[0].message);
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

    if (this.getCurrentStep() === STEPS.CONFIRMED_WITH_USER) {
      tools.push(USER_UPLOADED_INSURANCE_COVERAGE);
      tools.push(USER_REJECT_UPLOAD);
    }

    return tools;
  }
}
