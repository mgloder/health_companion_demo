import { zodResponseFormat } from "openai/helpers/zod";

import { createChatCompletion, doctorRankedByRelatedness, insuranceRankedByRelatedness } from "../utils/openai.js";
import { TOOLS, RESPONSE_FORMAT } from "../utils/healthAssistantUtil.js";
import doctors from "../data/dummy_medical_data.json" with { type: "json" };

const MAX_FOLLOW_UP_QUESTIONS = 2;

export const STEPS = {
  COLLECT_INFO: 1,
  GENERATE_POSSIBLE_DISEASES: 2,
  CONFIRMED_WITH_USER: 3,
  GENERATE_INSURANCE_COVERAGE: 4,
  DOCUMENT_Q_AND_A: 5,
  DOCTOR_RECOMMENDATION: 6,
  DOCTOR_Q_AND_A: 7,
  INSURANCE_RECOMMENDATION: 8,
};

export const MESSAGE_TYPES = Object.freeze({
  TEXT: "text",
  CONFIRM_POSSIBLE_DISEASE: "confirm_possible_disease",
  CONFIRM_INSURANCE_UPLOAD: "confirm_insurance_upload",
  CONFIRM_INSURANCE: "confirm_insurance",
  RECOMMEND_INSURANCE: "recommend_insurance",
  NEED_RECOMMEND_INSURANCE: "need_recommend_insurance",
  RECOMMEND_DOCTOR: "recommend_doctor",
  CONFIRM_DOCTOR: "confirm_doctor",
  PURCHASE_INSURANCE: "purchase_insurance",
});


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
      this.addToolChatMessage(toolCallId, `Ask follow up a question based on user's input`);
    } else {
      this.session.currentStep = STEPS.GENERATE_POSSIBLE_DISEASES;
      this.addToolChatMessage(toolCallId, `Output the single most likely disease based on ${JSON.stringify(this.getSymptoms())}`);
      response_format = zodResponseFormat(RESPONSE_FORMAT.CONFIRM_RESPONSE_FORMAT, "confirm_response_format");
    }
    const response = await createChatCompletion({
      messages: this.getChatHistory(),
      response_format,
    });
    this.addChatMessage(response.choices[0].message);
    return response.choices[0].message.content;
  }

  async handleConfirmDiagnosis(toolCallId, args) {
    this.session.currentStep = STEPS.CONFIRMED_WITH_USER;
    this.session.possibleDisease = args.possible_disease;

    this.addToolChatMessage(toolCallId, `回复 "好的，我明白了！为了方便我帮您查询，您能上传一下医疗保险的相关文档吗？我会根据您的症状，看看保险是否覆盖相关的疾病。请您稍等一下哦~"`);
    const response = await createChatCompletion({
      messages: this.getChatHistory(),
    });
    this.addChatMessage(response.choices[0].message);
    return response.choices[0].message.content;
  }

  async handleRejectDiagnosis(toolCallId, args) {
    this.session.currentStep = STEPS.COLLECT_INFO;
    this.session.askedQuestions = 0;

    this.addToolChatMessage(toolCallId, `根据信息 ${JSON.stringify(this.getSymptoms())} 重新收集症状的细节`);

    const response = await createChatCompletion({
      messages: this.getChatHistory(),
    });
    this.addChatMessage(response.choices[0].message);
    return response.choices[0].message.content;
  }

  async handleUploadedInsuranceCoverage(toolCallId, args) {
    this.session.currentStep = STEPS.GENERATE_INSURANCE_COVERAGE;
    const [ret] = await insuranceRankedByRelatedness(`收集有关保险信息，同时帮我找到与这些疾病有关的信息 ${this.session.possibleDisease}`, 1);
    const { content } = ret;
    const messages = [{
      role: "user",
      content: `Question: 对于每个疾病一句话总结是否在疾病中覆盖 疾病: ${this.session.possibleDisease}; Reference: ${content}`,
    }];

    const response = await createChatCompletion({
      messages: messages,
      response_format: zodResponseFormat(RESPONSE_FORMAT.INSURANCE_COVERAGE_RESPONSE, "insurance_coverage_response"),
    });

    return response.choices[0].message.content;
  }

  async handleNeedMoreDetail(toolCallId, args) {
    this.session.currentStep = STEPS.DOCUMENT_Q_AND_A;
    this.session.insuranceInfo = args?.insuranceInfo;
    this.addToolChatMessage(toolCallId, '回复 "好的，我明白了！您有什么关于医疗保险相关的问题都可以问我哦～。我会根据您的症状，看看保险是否覆盖相关的疾病"');

    const response = await createChatCompletion({
      messages: this.getChatHistory(),
    });

    // TODO: check response, if response contains "Target Information, e.g. coverage, location ,etc", then return with promotion message

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
      if (!filteredDoctor || filteredDoctor.length === 0) {
        filteredDoctor = doctors;
      }
    }
    this.addToolRecommendMessage(toolCallId, `根据用户的提供的疾病:${this.session.possibleDisease} 和症状: ${JSON.stringify(this.session.symptoms)}, 地址:${args.city} 偏好: ${JSON.stringify(args)}. 推荐从以下: ${JSON.stringify(filteredDoctor)} 按地理位置 和 reviews 评分排名查找出最合适的三个医生。以用户的语言作为回复`);

    const response = await createChatCompletion({
      messages: this.session.recommendDoctorHistory,
      response_format: zodResponseFormat(RESPONSE_FORMAT.RECOMMEND_DOCTOR, "recommend_doctor"),
    });

    this.addRecommendMessage(response.choices[0].message);
    console.log(this.session.recommendDoctorHistory);
    return response.choices[0].message.content;
  }

  handleNeedRecommendInsurance(toolCallId, args) {
    this.session.currentStep = STEPS.INSURANCE_RECOMMENDATION;
    return '为了更好地为您推荐合适的医生，请告诉我您的偏好，例如：医生的专业领域、性别、语言、就诊方式（线上或线下）等，我会根据您的需求为您匹配最合适的医生。'
  }

  handleWantToPurchaseInsurance(toolCallId, args) {
    return '您好！为了更好地为您提供服务，想请问您更倾向于哪种购买方式呢？我们提供线上和线下两种选择：\n' +
      '\n' +
      '线上购买方便快捷，您可以随时随地进行咨询和办理，我们的专业顾问也会全程在线为您解答疑问；如果您更喜欢面对面交流，我们也可以为您安排线下服务，在您方便的时间和地点详细沟通。'
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

    if (this.getCurrentStep() === STEPS.DOCTOR_Q_AND_A) {
      tools.push(TOOLS.USER_NEED_RECOMMEND_INSURANCE);
    }

    if (this.getCurrentStep() === STEPS.INSURANCE_RECOMMENDATION) {
      tools.push(TOOLS.USER_WANT_TO_PURCHASE_INSURANCE);
    }

    return tools;
  }
}


export const checkDoctorsInCoverage = async (doctors) => {
  const responses = await Promise.all(doctors.map(async ({ doctor, specialty }) => {
    const rets = await doctorRankedByRelatedness(`find ${doctor} in ${specialty}`, 3);
    const reference = rets.map(ret => ret.content).join('\n');
    const response = await createChatCompletion({
      messages: [{
        role: "user",
        content: `Question: Could you confirm if the doctor ${doctor} is mentioned in the following reference?; Reference: ${reference}`
      }],
      response_format: zodResponseFormat(RESPONSE_FORMAT.DOCTOR_COVERAGE, 'doctor_coverage')
    });
    return JSON.parse(response.choices[0].message.content);
  }));
  return responses.map(({ doctor, coverage }) => ({ doctor, coverage: coverage === 'Y'}));
};
