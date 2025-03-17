import { zodResponseFormat } from "openai/helpers/zod";

import { createChatCompletion, insuranceRankedByRelatedness } from "../utils/openai.js";
import { TOOLS, RESPONSE_FORMAT } from "../utils/healthAssistantUtilEN.js";
import doctors from "../data/dummy_medical_data.json" with { type: "json" };
import { STEPS } from "./chatManager.js";

const MAX_FOLLOW_UP_QUESTIONS = 2;

export class ChatManagerEN {
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
    return "Do you have health insurance? I can help you analyze your policy terms and recommend suitable doctors.";
  }

  async handleRejectDiagnosis(toolCallId, args) {
    this.session.currentStep = STEPS.COLLECT_INFO;
    this.session.askedQuestions = 0;

    this.addToolChatMessage(toolCallId, `Based on the information ${JSON.stringify(this.getSymptoms())}, let's re-collect the details of the symptoms.`);

    const response = await createChatCompletion({
      messages: this.getChatHistory(),
    });
    this.addChatMessage(response.choices[0].message);
    return response.choices[0].message.content;
  }

  async handleUploadedInsuranceCoverage(toolCallId, args) {
    this.session.currentStep = STEPS.GENERATE_INSURANCE_COVERAGE;
    const [ret] = await insuranceRankedByRelatedness(`Collecting insurance information and also helping me find relevant information regarding these diseases: ${this.session.possibleDisease}.`, 1);
    const { content } = ret;
    const messages = [{
      role: "user",
      content: `Question: A one-sentence summary of whether each disease is covered. Disease: ${this.session.possibleDisease}; Reference: ${content}.`,
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
    this.addToolChatMessage(toolCallId, 'Reply "Okay, I understand! Feel free to ask me any questions about health insurance. Based on your symptoms, I will check if the insurance covers the relevant diseases."');

    const response = await createChatCompletion({
      messages: this.getChatHistory(),
    });

    // TODO: check response, if response contains "Target Information, e.g. coverage, location ,etc", then return with promotion message

    this.addChatMessage(response.choices[0].message);
    return response.choices[0].message.content;
  }

  handleNeedRecommendDoctor(toolCallId, args) {
    this.session.currentStep = STEPS.DOCTOR_RECOMMENDATION;
    return 'To better recommend the most suitable doctor for you, please let me know your preferences, such as the doctor’s specialty, gender, language, consultation method (online or offline), etc. I will match the best doctor for your needs.'
  }

  async handlePreferDoctor(toolCallId, args) {
    let filteredDoctor = doctors;
    if (args.city) {
      filteredDoctor = doctors.hospitals.filter(doctor => doctor.address.city === args.city);
      if (!filteredDoctor || filteredDoctor.length === 0) {
        filteredDoctor = doctors;
      }
    }
    this.addToolRecommendMessage(toolCallId, `Based on the disease ${this.session.possibleDisease} and symptoms: ${JSON.stringify(this.session.symptoms)}, location: ${args.city}, and preferences: ${JSON.stringify(args)}, I will recommend the top three doctors based on geographic location and reviews.`);

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
    return 'To better recommend the most suitable doctor for you, please tell me your preferences, such as the doctor’s specialty, gender, language, consultation method (online or offline), etc. I will match the best doctor for your needs.'
  }

  handleWantToPurchaseInsurance(toolCallId, args) {
    return `Okay! To better serve you, may I ask which purchasing method you prefer? We offer both online and offline options:
* Online purchasing is fast and convenient, allowing you to consult and handle everything anytime, anywhere. Our professional advisors will be available online to answer any questions you may have.
* If you prefer face-to-face communication, we can also arrange offline services at a time and location that suits you, where we can discuss in detail.
`
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
