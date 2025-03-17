import { z } from "zod";

const COLLECT_USER_SYMPTOMS = {
  type: "function",
  function: {
    name: "collect_user_symptoms",
    parameters: {
      type: "object",
      properties: {
        symptoms: { type: "string", description: "physical symptoms" },
        others: { type: "string", description: "others" },
      },
      required: ["symptoms"],
    },
    description: "Collect user symptoms exclude mental health issues.",
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
    description: "user wants to learn more details about insurance coverage.",
    parameters: {
      type: "object",
      properties: {
        insuranceInfo: {
          type: "array",
          description: "detailed insurance coverage information that user is interested in.",
          items: {
            type: "object",
            properties: {
              disease: {
                type: "string",
                description: "disease name",
              },
              covered: {
                type: "boolean",
                description: "whether the insurance covers this disease.",
              },
              coverage_ratio: {
                type: "string",
                description: "coverage percentage; if not covered, this will be 0%.",
              },
              coverage_times: {
                type: "integer",
                description: "limit on the number of claims for this disease; if not covered, this will be 0%.",
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
    description: "user wants to get a recommendation for a suitable doctor.",
  },
};

const USER_PREFER_DOCTOR = {
  type: "function",
  function: {
    name: "user_prefer_doctor",
    description: "collect the user's doctor preferences and current city.",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "The user's current city.",
        },
        preferences: {
          type: "array",
          items: {
            type: "string",
            description: "User preferences for the doctor, such as specialty, experience, etc.",
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
    description: "user wants to receive an insurance recommendation.",
    parameters: {
      type: "object",
      properties: {
        current_insurance: {
          type: "string",
          description: "The user's current insurance plan."
        },
        preferences: {
          type: "array",
          items: {
            type: "string",
            description: "User preferences for insurance, such as coverage, premium, etc."
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
    description: "The user wants to purchase health insurance.",
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
  insurance_company: z.string().describe('Name of the insurance company'),
  insurance_contract_number: z.string().describe('Insurance policy number'),
  coverage_start_date: z.string().describe('Start date of the insurance plan coverage, formatted as YYYY-MM-DD'),
  coverage_end_date: z.string().describe('End date of the insurance plan coverage, formatted as YYYY-MM-DD'),
  summaries: z.array(z.object({
    disease: z.string().describe('Disease'),
    summary: z.string().describe('A brief summary of insurance coverage: whether it is included, coverage ratio, and key limitations. Must be within 50 characters.'),
  })),
});

const RECOMMEND_DOCTOR = z.object({
  doctors: z.array(z.object({
    doctor: z.string().describe(`Doctor's name`),
    experience: z.string().describe('Years of experience'),
    specialty: z.string().describe('Medical specialty'),
    address: z.string().describe('Work address'),
    opening_hours: z.string().describe('Opening hours'),
    summary: z.string().describe('A third-person summary of patient reviews about the doctor, limited to 50 characters.')
  })),
});

const DOCTOR_COVERAGE = z.object({
  doctor: z.string().describe(`Doctor's name`),
  coverage: z.string().describe(`Whether the doctor is covered by insurance, returns 'Y' or 'N'`)
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
