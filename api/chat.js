import { ChatManager, STEPS } from "../services/chatManager.js";
import { handleChat, handleDoctorQA, handleDoctorRecommendation,  handleInsuranceQA, handleInsuranceRecommendation } from "../services/handlers/index.js";

export function registerChatRoutes(server) {
  server.post("/api/chat", async (request, reply) => {
    try {
      const result = await handler(request);
      return result;
    } catch (error) {
      request.log.error({
        msg: "Chat completion failed",
        error: error.message,
        stack: error.stack,
      });

      reply.code(500).send({
        success: false,
        error: "Failed to process chat request",
        details: error.message,
      });
    }
  });
}

export async function handler(request) {
  const { message } = request.body;
  const { session } = request;
  const chatManager = new ChatManager({ session });

  if (session.currentStep === STEPS.DOCUMENT_Q_AND_A) {
    return await handleInsuranceQA(session, message, chatManager);
  }

  if (session.currentStep === STEPS.DOCTOR_RECOMMENDATION) {
    return await handleDoctorRecommendation(session, message, chatManager);
  }

  if (session.currentStep === STEPS.DOCTOR_Q_AND_A) {
    return await handleDoctorQA(session, message, chatManager);
  }

  if (session.currentStep === STEPS.INSURANCE_RECOMMENDATION) {
    return await handleInsuranceRecommendation(session, message, chatManager);
  }

  return await handleChat(session, message, chatManager);
}

