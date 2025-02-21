import { zodResponseFormat } from "openai/helpers/zod";

import { createChatCompletion, stringsRankedByRelatedness } from "../utils/openai.js";
import { TOOLS, RESPONSE_FORMAT } from "../utils/healthAssistantUtil.js";
import doctors from "../data/dummy_medical_data.json" with { type: "json" };

const MAX_FOLLOW_UP_QUESTIONS = 3;

export const STEPS = {
  COLLECT_INFO: 1,
  GENERATE_POSSIBLE_DISEASES: 2,
  CONFIRMED_WITH_USER: 3,
  GENERATE_INSURANCE_COVERAGE: 4,
  DOCUMENT_Q_AND_A: 5,
  DOCTOR_RECOMMENDATION: 6,
  USER_CONFIRM_RECOMMENDATION: 7,
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
      this.addToolChatMessage(toolCallId, `根据信息 ${JSON.stringify(this.getSymptoms())} 以列表的方式列出最有可能的三种疾病 请以纯文本的方式回复`);
      response_format = zodResponseFormat(RESPONSE_FORMAT.CONFIRM_RESPONSE_FORMAT, 'confirm_response_format');
    }
    const response = await createChatCompletion({
      model: "gpt-4o-mini",
      messages: this.getChatHistory(),
      response_format,
    });
    this.addChatMessage(response.choices[0].message);
    return response.choices[0].message.content;
  }

  async handleConfirmDiagnosis(toolCallId, args) {
    this.session.currentStep = STEPS.CONFIRMED_WITH_USER;
    this.session.possibleDiseases = args.possible_diseases;

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

  async handleUploadedInsuranceCoverage(toolCallId, args) {
    this.session.currentStep = STEPS.GENERATE_INSURANCE_COVERAGE;
    const [ret] = await stringsRankedByRelatedness(`帮我找到与这些疾病有关的信息 ${this.session.possibleDiseases}`, 1);
    const { content } = ret;
    const messages = [{
      role: "user",
      content: `Question: 对于每个疾病一句话总结是否在疾病中覆盖 疾病: ${this.session.possibleDiseases}; Reference: ${content}`,
    }];

    const response = await createChatCompletion({
      messages: messages,
      response_format: zodResponseFormat(RESPONSE_FORMAT.INSURANCE_COVERAGE_RESPONSE, 'insurance_coverage_response'),
    });

    return response.choices[0].message.content;
  }

  async handleNeedMoreDetail(toolCallId, args) {
    this.session.currentStep = STEPS.DOCUMENT_Q_AND_A;
    this.addToolChatMessage(toolCallId, '回复 "好的，我明白了！您有什么关于医疗保险相关的问题都可以问我哦～。我会根据您的症状，看看保险是否覆盖相关的疾病"');

    const response = await createChatCompletion({
      model: "gpt-4o-mini",
      messages: this.getChatHistory(),
    });

    this.addChatMessage(response.choices[0].message);
    return response.choices[0].message.content;
  }

  handleNeedRecommendDoctor(toolCallId, args) {
    this.session.currentStep = STEPS.DOCTOR_RECOMMENDATION;
    return '为了更好地为您推荐合适的医生，请告诉我您的偏好，例如：医生的专业领域、性别、语言、就诊方式（线上或线下）等，我会根据您的需求为您匹配最合适的医生。'
  }

  async handlePreferDoctor(toolCallId, args) {
    let filteredDoctor = doctors;
    if (args.city) {
      filteredDoctor = doctors.hospitals.filter(doctor => doctor.address.city === args.city);
    }
    this.addToolRecommendMessage(toolCallId, `根据用户的提供的疾病:${this.session.possibleDiseases}, 偏好 ${JSON.stringify(args)}. 推荐从以下: ${JSON.stringify(filteredDoctor)} 按 reviews 评分排名查找出最合适的三个医生`);

    const response = await createChatCompletion({
      model: "gpt-4o-mini",
      messages: this.session.recommendDoctorHistory,
    });

    this.addRecommendMessage(response.choices[0].message);
    console.log(this.session.recommendDoctorHistory);
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

  addRecommendMessage(message) {
    this.session.recommendDoctorHistory.push(message);
  }

  addToolRecommendMessage(toolCallId, content) {
    this.session.recommendDoctorHistory.push({
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
      tools.push(TOOLS.COLLECT_USER_SYMPTOMS);
    }
    if (this.getCurrentStep() === STEPS.GENERATE_POSSIBLE_DISEASES) {
      tools.push(TOOLS.USER_CONFIRM_DIAGNOSIS);
      tools.push(TOOLS.USER_REJECT_DIAGNOSIS);
    }

    if (this.getCurrentStep() === STEPS.CONFIRMED_WITH_USER) {
      tools.push(TOOLS.USER_UPLOADED_INSURANCE_COVERAGE);
      tools.push(TOOLS.USER_REJECT_UPLOAD);
    }

    if (this.getCurrentStep() === STEPS.GENERATE_INSURANCE_COVERAGE) {
      tools.push(TOOLS.USER_NEED_MORE_DETAIL);
    }

    if (this.getCurrentStep() === STEPS.DOCUMENT_Q_AND_A) {
      tools.push(TOOLS.USER_NEED_RECOMMEND_DOCTOR);
    }

    if (this.getCurrentStep() === STEPS.DOCTOR_RECOMMENDATION) {
      tools.push(TOOLS.USER_PREFER_DOCTOR);
    }

    return tools;
  }
}
