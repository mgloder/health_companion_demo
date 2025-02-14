import { setup, fromPromise, assign } from "xstate";

const MAX_FOLLOW_UP_QUESTIONS = 2;

// 工具定义，与之前保持一致
export const tools = [
  {
    type: "function",
    function: {
      name: "collect_user_symptoms",
      parameters: {
        type: "object",
        properties: {
          primary_symptoms: { type: "string", description: "主要病症" },
          other_symptoms: { type: "string", description: "伴随病症" },
          medication: { type: "string", description: "正在服用的药物" },
          duration: { type: "string", description: "病症持续时间" },
        },
        required: ["primary_symptoms"],
        description: "收集用户提供的症状相关信息",
      },
    },
  },
  {
    type: "function",
    function: {
      name: "confirm_diagnosis",
      description: `当用户确认与 Agent 提供的疾病一致时`,
    },
  },
];

export const healthAssistantMachine = setup({
  actors: {
    askFollowUpQuestion: fromPromise(async ({ input }) => {
      console.log(input.session.chatHistory);
      const response = await input.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: input.session.chatHistory,
      });
      return response.choices[0].message;
    }),
    searchPossibleDisease: fromPromise(async ({ input }) => {
      console.log('searchPossibleDisease called event:', input.event);
      // if (input.session.chatHistory.at(-1).value === "") {
      //   console.log('searchPossibleDisease called');
      //   const diagnosisPrompt = `基于这些信息给出可能的疾病列表, 信息：primary_symptoms: ${context.primary_symptoms}`;
      //   const response = await input.openai.chat.completions.create({
      //     model: "gpt-4o-mini",
      //     messages: input.session.chatHistory,
      //   });
      //   return response.choices[0].message;
      // }
    }),
  },
  actions: {
    // 累加提问次数，并更新症状信息和聊天记录
    updateSymptoms: assign(({ context, event }) => {
      const symptoms = {
        primary_symptoms: event.data.primary_symptoms,
        other_symptoms: event.data.other_symptoms,
        duration: event.data.duration,
        medication: event.data.medication,
      };
      context.session.symptoms = symptoms;
      context.session.askedQuestion = context.askedQuestion + 1;
      context.session.chatHistory.push({
        role: "tool",
        tool_call_id: event.data.toolCallId,
        content: `进一步询问用户病症获得更多信息 primary_symptoms: ${symptoms.primary_symptoms}, other_symptoms: ${symptoms.other_symptoms}, duration: ${symptoms.duration}, medication: ${symptoms.medication}`,
      });

      console.log('askedQuestion: ', context.session.askedQuestion);

      return ({
        askedQuestion: context.session.askedQuestion,
        symptoms,
      });
    }),

    // 确认诊断时的动作
    confirmDiagnosisAction: ({ context, event}) => {
      if (event?.data && event.data.toolCallId) {
        console.log('confirmDiagnosisAction called', event.data.toolCallId);
        const diagnosisPrompt = `基于这些信息给出可能的疾病列表, 信息：primary_symptoms: ${context.primary_symptoms}`;
        context.session.chatHistory.push({
          role: "tool",
          tool_call_id: event.data.toolCallId,
          content: diagnosisPrompt
        });
      }
    },

    testSuccess: () => {
      console.log("Success called");
    }
  },
  guards: {
    isValid: ({ context }) => {
      console.log('isVaild: ', context.askedQuestion >= MAX_FOLLOW_UP_QUESTIONS);
      return context.askedQuestion >= MAX_FOLLOW_UP_QUESTIONS;
    },
  },
}).createMachine(
  {
    id: "healthAssistant",
    initial: "collectUserSymptoms",
    context: ({ input }) => ({
      askedQuestion: input.askedQuestion,
      symptoms: input.symptoms,
      openai: input.openai,
      session: input.session,
    }),
    states: {
      collectUserSymptoms: {
        on: {
          COLLECT_SYMPTOMS: {
            actions: "updateSymptoms",
            target: "askFollowUpQuestion",
          },
        },
      },
      askFollowUpQuestion: {
        invoke: {
          src: "askFollowUpQuestion",
          input: ({ context: { openai, session, symptoms } }) => ({ openai, session, symptoms }),
          onDone: [
            {
              guard: "isValid",
              target: "confirmDiagnosis",
              actions: ({ context, event }) => {
                context.session.chatHistory.push({
                  role: event.output.role,
                  content: event.output.content,
                });
              },
            },
            {
              target: "success",
              actions: ({ context, event }) => {
                context.session.chatHistory.push({
                  role: event.output.role,
                  content: event.output.content,
                });
              },
            }
          ],
          onError: {
            actions: () => console.log("askFollowUpQuestion error"),
          },
        },
      },
      confirmDiagnosis: {
        entry: "confirmDiagnosisAction",
        invoke: {
          src: "searchPossibleDisease",
          input: ({ context: { openai, session, symptoms, event } }) => ({ openai, session, symptoms, event }),
          onDone: {
            target: "success",
            actions: ({ context, event }) => {
              // context.session.chatHistory.push({
              //   role: event.output.role,
              //   content: event.output.content,
              // });
            },
          },
          onError: {
            target: "failed",
            actions: () => console.log("confirmDiagnosis error"),
          },
        },
      },
      success: {
        entry: 'testSuccess',
        type: "final",
      },
      failed: {
        type: "final",
      },
    },
  },
);
