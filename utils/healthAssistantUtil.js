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
        possible_disease: {
          type: "string",
          description: "可能的疾病",
        },
      },
      required: ["possible_disease"],
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
    description: "用户想要了解更多保险赔付的详细信息",
    parameters: {
      type: "object",
      properties: {
        insuranceInfo: {
          type: "array",
          description: "用户关注的保险赔付详情",
          items: {
            type: "object",
            properties: {
              disease: {
                type: "string",
                description: "疾病名称",
              },
              covered: {
                type: "boolean",
                description: "保险是否覆盖该疾病",
              },
              coverage_ratio: {
                type: "string",
                description: "赔付比例，当未覆盖时为 0%",
              },
              coverage_times: {
                type: "integer",
                description: "该疾病的赔付次数限制，当未覆盖时为 0%",
              },
            },
            required: ["disease", "covered"],
          },
        },
      },
      required: ["details"],
    },
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
      additionalProperties: true,
    },
  },
};


const CONFIRM_RESPONSE_FORMAT = z.object({
  sympathy_message: z.string().describe('表达对用户病情的关心、理解和温暖的慰问，并以“可能患有以下疾病：”为结尾'),
  disease: z.string().describe('疾病名称'),
  description: z.string().describe('疾病的简要介绍'),
  reference_link: z.string().describe('参考链接，例如 WebMD 的相关页面'),
  recommendation: z.string().describe('针对该疾病的推荐信息'),
});

const INSURANCE_COVERAGE_RESPONSE = z.object({
  insurance_company: z.string().describe('保险公司名称'),
  insurance_contract_number: z.string().describe('保险编号'),
  coverage_start_date: z.string().describe('保险计划的保障开始日期，格式为YYYY-MM-DD'),
  coverage_end_date: z.string().describe('保险计划的保障结束日期，格式为YYYY-MM-DD'),
  summaries: z.array(z.object({
    disease: z.string().describe('疾病'),
    summary: z.string().describe('总结疾病是否在保险中覆盖，赔率是多少，有什么条件限制，不超过50个字'),
  })),
});

const RECOMMEND_DOCTOR = z.object({
  doctors: z.array(z.object({
    doctor: z.string().describe('医生姓名'),
    experience: z.string().describe('工作经验'),
    specialty: z.string().describe('科室'),
    address: z.string().describe('工作地址'),
    opening_hours: z.string().describe('营业时间'),
    summary: z.string().describe('用第三人称陈述病人对医生的评价，不超过50个字')
  })),
});

const DOCTOR_COVERAGE = z.object({
  doctor: z.string().describe('医生的姓名'),
  coverage: z.string().describe('该医生是否在保险覆盖范围内，返回 Y 或者 N')
});

const DOCTOR_Q_AND_A = z.object({
  answer: z.string(),
  doctor_name: z.string()
});


export const TOOLS = {
  COLLECT_USER_SYMPTOMS,
  USER_CONFIRM_DIAGNOSIS,
  USER_REJECT_DIAGNOSIS,
  USER_UPLOADED_INSURANCE_COVERAGE,
  USER_REJECT_UPLOAD,
  USER_NEED_MORE_DETAIL,
  USER_NEED_RECOMMEND_DOCTOR,
  USER_PREFER_DOCTOR,
}

export const RESPONSE_FORMAT = {
  CONFIRM_RESPONSE_FORMAT,
  INSURANCE_COVERAGE_RESPONSE,
  RECOMMEND_DOCTOR,
  DOCTOR_COVERAGE,
  DOCTOR_Q_AND_A
}
