import { handleChat, handleDoctorQA, handleDoctorRecommendation,  handleInsuranceQA, handleInsuranceRecommendation } from "../services/handlers/index.js";
import { ChatManagerEN } from "../services/chatManagerEN.js";
import { STEPS } from "../services/chatManager.js";

export function registerChatENRoutes(server) {
  server.post("/api/chat-en", async (request, reply) => {
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
  const chatManager = new ChatManagerEN({ session });

  if (session.currentStep === STEPS.DOCUMENT_Q_AND_A) {
    return await handleInsuranceQA(session, message, chatManager);
  }

  if (session.currentStep === STEPS.DOCTOR_RECOMMENDATION) {
    return await handleDoctorRecommendation(session, message, chatManager, true);
  }

  if (session.currentStep === STEPS.DOCTOR_Q_AND_A) {
    return await handleDoctorQA(session, message, chatManager, true);
  }

  if (session.currentStep === STEPS.INSURANCE_RECOMMENDATION) {
    return await handleInsuranceRecommendation(session, message, chatManager);
  }

  return await handleChat(session, message, chatManager);
}

