import { MAX_FOLLOW_UP_QUESTIONS, MESSAGE_TYPES, STEPS } from "../services/chatManager.js";
import { createChatCompletion } from "../utils/openai.js";

export function registerActionRoutes(server) {
  server.post("/api/action", async (request, reply) => {
    try {
      const result = await handler(request);
      return result;
    } catch (error) {
      request.log.error({
        msg: "Action chat completion failed",
        error: error.message,
        stack: error.stack,
      });

      reply.code(500).send({
        success: false,
        error: "Failed to process actiono request",
        details: error.message,
      });
    }
  });
}

export async function handler(request) {
  const { session } = request;

  console.log('currentStep: ', session.currentStep);

  if (session.currentStep === STEPS.COLLECT_INFO) {
    const messages = [...session.chatHistory];
    const userMessageCount = messages.filter(m => m.role === "user").length;
    console.log('userMessageCount: ', userMessageCount);

    if (userMessageCount > MAX_FOLLOW_UP_QUESTIONS) {
      messages.push({
        role: "developer",
        content: `Determine if the user needs medical attention and provide health advice with a warm and supportive tone to show care and encouragement. Ensure responses are in the same language as the user’s input.`,
      });

      console.log(messages);
      const response = await createChatCompletion({
        messages,
        temperature: 1.3
      });

      return { type: MESSAGE_TYPES.CONFIRM_DOCTOR, data: response, message: response?.choices[0].message.content };
    }

    return {};
  }

  return { type: MESSAGE_TYPES.NONE, message: ''};
}

