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
      required: ["symptoms"],
    },
    description: "收集用户提供的症状及相关信息，心理问题除外",
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
          description: "possible disease",
        },
      },
      required: ["possible_disease"],
    },
    description: "User confirms accuracy of system diagnosis",
  },
};

const USER_REJECT_DIAGNOSIS = {
  type: "function",
  function: {
    name: "user_reject_diagnosis",
    description: "User reports inaccuracy in system diagnosis",
  },
};

const USER_UPLOADED_INSURANCE_COVERAGE = {
  type: "function",
  function: {
    name: "user_uploaded_insurance_coverage",
    description: "User confirms health insurance documents uploaded",
  },
};

const USER_REJECT_UPLOAD = {
  type: "function",
  function: {
    name: "user_reject_upload",
    description: "User declines to upload health insurance documents",
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

const USER_NEED_RECOMMEND_INSURANCE = {
  type: "function",
  function: {
    name: "user_need_recommend_insurance",
    description: "用户想要推荐保险",
    parameters: {
      type: "object",
      properties: {
        current_insurance: {
          type: "string",
          description: "用户当前的保险方案"
        },
        preferences: {
          type: "array",
          items: {
            type: "string",
            description: "用户对保险的偏好，如覆盖范围、保费等"
          }
        }
      },
      required: ["current_insurance"]
    }
  }
};

const USER_WANT_TO_PURCHASE_INSURANCE = {
  type: "function",
  function: {
    name: "user_want_to_purchase_insurance",
    description: "用户想要购买医疗保险",
  }
};




const CONFIRM_RESPONSE_FORMAT = z.object({
  sympathy_message: z.string().describe('Warm empathetic message ending with "Possible diagnosis:"'),
  disease: z.string().describe('disease name'),
  description: z.string().describe('Concise medical overview of the condition'),
  reference_link: z.string().describe('Authoritative medical reference link (e.g. WebMD)'),
  recommendation: z.string().describe('Targeted professional medical advice'),
});

const INSURANCE_COVERAGE_RESPONSE = z.object({
  insurance_company: z.string().describe('保险公司名称'),
  insurance_contract_number: z.string().describe('保险编号'),
  coverage_start_date: z.string().describe('保险计划的保障开始日期，格式为YYYY-MM-DD'),
  coverage_end_date: z.string().describe('保险计划的保障结束日期，格式为YYYY-MM-DD'),
  summaries: z.array(z.object({
    disease: z.string().describe('疾病'),
    summary: z.string().describe('总结说明保险覆盖情况：是否包含、赔付比例、主要限制条件。需要在50个字以内'),
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
  USER_NEED_RECOMMEND_INSURANCE,
  USER_WANT_TO_PURCHASE_INSURANCE,
}

export const RESPONSE_FORMAT = {
  CONFIRM_RESPONSE_FORMAT,
  INSURANCE_COVERAGE_RESPONSE,
  RECOMMEND_DOCTOR,
  DOCTOR_COVERAGE,
  DOCTOR_Q_AND_A
}
