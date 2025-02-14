import OpenAI from "openai";
import { createActor, waitFor } from "xstate";
import { healthAssistantMachine, tools } from "./healthAssistantMachine.js";

function handleToolCalls(toolCalls, assistantActor) {
  for (const toolCall of toolCalls) {
    const { id: toolCallId, function: { name, arguments: args } } = toolCall;
    console.log("Tool call arguments:", args);
    const eventData = JSON.parse(args);

    if (name === "collect_user_symptoms") {
      assistantActor.send({ type: "COLLECT_SYMPTOMS", data: { toolCallId, ...eventData } });
    } else if (name === "confirm_diagnosis") {
      console.log("confirm_diagnosis called");
      assistantActor.send({ type: "confirmDiagnosis", data: { toolCallId, ...eventData } });
    }
  }
}

export async function handler(request, dispatcher) {
  const { message } = request.body;
  const { session } = request;

  if (!session.chatHistory) {
    session.chatHistory = [
      {
        role: "developer",
        content: `You are a helpful health assistant, designed to assist the user in identifying possible diseases and guiding them to the appropriate doctor based on their symptoms.
       `,
      },
    ];
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    fetch: async (url, options) => {
      try {
        const response = await fetch(url, { ...options, dispatcher });
        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }
        return response;
      } catch (error) {
        console.error("OpenAI API fetch error:", {
          url,
          error: error.message,
          stack: error.stack,
        });
        throw new Error(`Failed to connect to OpenAI API: ${error.message}`);
      }
    },
  });
  session.chatHistory.push({ role: "user", content: message });

  const assistantActor = createActor(healthAssistantMachine, {
    input: {
      askedQuestion: session?.askedQuestion || 0,
      symptoms: {
        primary_symptoms: session.symptoms?.primary_symptoms,
        other_symptoms: session.symptoms?.other_symptoms,
        duration: session.symptoms?.duration,
        medication: session.symptoms?.medication,
      },
      openai,
      session,
    },
  });
  assistantActor.start();

  let response;
  try {
    response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: session.chatHistory,
      tools,
      tool_choice: "auto",
    });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }

  let type = "text";
  let data = null;
  let toolMessage = "";

  if (response?.choices[0].message.tool_calls) {
    session.chatHistory.push(response?.choices[0].message);
    handleToolCalls(response.choices[0].message.tool_calls, assistantActor);
    // 等待 actor 达到特定状态
    try {
      const finalState = await waitFor(assistantActor, (state) => state.matches("success") || state.matches("failed"), {
        timeout: 10000,
      });
      // 在达到期望状态后执行的逻辑
      console.log('Actor reached the desired state:', finalState.value);
      toolMessage = finalState.context.session.chatHistory.at(-1).content;
    } catch (error) {
      // 处理超时或其他错误
      console.error("Error waiting for actor to reach desired state:", error);
    }
  }

  // 最终返回 AI 回复（优先使用 chatMessage，否则使用工具返回的消息）
  const chatMessage = response?.choices[0].message.content || toolMessage || "";
  session.chatHistory.push({ role: "assistant", content: chatMessage });
  return { aiMessage: chatMessage, type, data };
}
