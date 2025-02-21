import { z } from "zod";

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
    parameters: {
      type: "object",
      properties: {
        possible_diseases: {
          type: "array",
          items: {
            type: "string",
            description: "可能的疾病",
          },
        },
      },
      required: ["possible_diseases"],
    },
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

const USER_NEED_MORE_DETAIL = {
  type: "function",
  function: {
    name: "user_need_more_detail",
    description: "用户想要了解更多信息",
  },
};

const USER_NEED_RECOMMEND_DOCTOR = {
  type: "function",
  function: {
    name: "user_need_recommend_doctor",
    description: "用户想要推荐合适的医生",
  },
};

const USER_PREFER_DOCTOR = {
  type: "function",
  function: {
    name: "user_prefer_doctor",
    description: "收集用户对医生的偏好和所在城市",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "用户所在城市",
        },
        preferences: {
          type: "array",
          items: {
            type: "string",
            description: "用户对医生的偏好，如专科、经验等",
          },
        },
      },
      required: ["city"],
    },
  },
};


const CONFIRM_RESPONSE_FORMAT =  z.object({
  diseases: z.array(z.string()),
  recommendation: z.string(),
});

const INSURANCE_COVERAGE_RESPONSE = z.object({
  summaries: z.array(z.object({
    disease: z.string().describe('疾病'),
    summary: z.string().describe('一句话总结疾病是否在保险中覆盖，赔率是多少'),
  })),
});

const RECOMMEND_DOCTOR = z.object({
  doctors: z.array(z.object({
    doctor: z.string().describe('医生姓名'),
    experience: z.string().describe('工作经验'),
    specialty: z.string().describe('科室'),
    summary: z.string().describe('用中文一句话总结病人对医生的评价')
  })),
});

export const TOOLS = {
  COLLECT_USER_SYMPTOMS,
  USER_CONFIRM_DIAGNOSIS,
  USER_REJECT_DIAGNOSIS,
  USER_UPLOADED_INSURANCE_COVERAGE,
  USER_REJECT_UPLOAD,
  USER_NEED_MORE_DETAIL,
  USER_NEED_RECOMMEND_DOCTOR,
  USER_PREFER_DOCTOR
}

export const RESPONSE_FORMAT = {
  CONFIRM_RESPONSE_FORMAT,
  INSURANCE_COVERAGE_RESPONSE,
  RECOMMEND_DOCTOR
}
