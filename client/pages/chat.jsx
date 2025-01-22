import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSpring, animated, config } from "@react-spring/web";

import { chatEasing, formatTime } from "../utils/utils.js";
import VoiceBg from "../components/VoiceBg.jsx";
import PhoneCallIcon from "../components/PhoneCallIcon.jsx";

import callIcon from "../assets/call.svg";
import endCallIcon from "../assets/end-call.svg";

const CONNECTION_STATUS = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
};


const adjustExercisePlanDescription = `
Call this function when user want to adjust the current exercise plan. Support multiple exercises.
`;

const finalConfirmationDescription = `
Call this function when user confirm the final exercise plan or don't want to adjust the exercise plan
`;

const reviewCurrentPlan = {
  type: "session.update",
  session: {
    tools: [
      {
        type: "function",
        name: "adjust_exercise_plan",
        description: adjustExercisePlanDescription,
        parameters: {
          type: "object",
          strict: true,
          properties: {
            exercises: {
              type: "array",
              description: "List of exercises in the weekly plan",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Name of the exercise",
                  },
                  frequency: {
                    type: "number",
                    description: "How many times per week",
                  },
                  duration: {
                    type: "number",
                    description: "Duration per session",
                  },
                  notes: {
                    type: "string",
                    description: "Additional notes or requirements",
                    optional: true,
                  },
                },
                required: ["name", "frequency", "duration"],
              },
            },
          },
          required: ["exercises", "total_weekly_minutes"],
        },
      },
      {
        type: "function",
        name: "confirm_final_plan",
        description: finalConfirmationDescription,
        parameters: {
          type: "object",
          strict: true,
          properties: {
            confirmed_final_plan: {
              type: "string",
              description: "User confirm the final weekly exercise plan",
            },
            summary: {
              type: "string",
              description: "Summary of the final weekly exercise plan",
            },
          },
          required: ["confirmed_final_plan", "summary"],
        },
      },
    ],
    tool_choice: "auto",
  },
};


export default function Chat() {
  const [styles, api] = useSpring(() => ({
    from: { y: "-100%" },
    config: {
      duration: 1000, easing: chatEasing(),
    },
  }));

  const [speakingTime, setSpeakingTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(CONNECTION_STATUS.DISCONNECTED);
  const [events, setEvents] = useState([]);
  const intervalRef = useRef(null); // 用于存储计时器的引用
  const chatLog = useRef({ agent: [], user: [] });
  const [dataChannel, setDataChannel] = useState(null);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);
  const [functionAdded, setFunctionAdded] = useState(false);
  const [functionCallOutput, setFunctionCallOutput] = useState(null);

  async function startSession() {
    try {
      setIsSessionActive(CONNECTION_STATUS.CONNECTING);

      const tokenResponse = await fetch("/token");
      if (!tokenResponse.ok) {
        throw new Error("Failed to get token");
      }

      const data = await tokenResponse.json();
      if (!data.client_secret?.value) {
        throw new Error("Invalid token response");
      }

      const EPHEMERAL_KEY = data.client_secret.value;

      // Request microphone permission first
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true })
        .catch(err => {
          throw new Error("Microphone access denied");
        });

      const pc = new RTCPeerConnection();

      audioElement.current = document.createElement("audio");
      audioElement.current.autoplay = true;
      pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

      // 添加本地音频轨道（麦克风输入）
      pc.addTrack(ms.getTracks()[0]);

      // 创建数据通道
      const dc = pc.createDataChannel("oai-events");
      setDataChannel(dc);

      // 创建 Offer 并设置本地描述
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 发送 Offer 到 OpenAI 服务器
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      // 设置远程描述（Answer）
      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

      // 保存 RTCPeerConnection 实例
      peerConnection.current = pc;

      console.debug("Session started successfully");
      intervalRef.current = setInterval(() => {
        setSpeakingTime((prevTime) => prevTime + 1);
      }, 1000);

    } catch (error) {
      console.error("Failed to start session:", error);
      setIsSessionActive(CONNECTION_STATUS.DISCONNECTED);
      // Show error to user
      alert(`Failed to start session: ${error.message}`);
    }
  }

  async function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(CONNECTION_STATUS.DISCONNECTED);
    setDataChannel(null);
    peerConnection.current = null;
  }

  useEffect(() => {
    // 清理函数：组件卸载时关闭会话
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    api.start({ y: "0%" });
  }, [api]);

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    if (dataChannel) {
      // Append new server events to the list
      dataChannel.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);

        if (event.type === "response.audio_transcript.done") {
          chatLog.current.agent = [...chatLog.current.agent, event.transcript];
          sessionStorage.setItem("chatLog", JSON.stringify(chatLog.current));
        }

        if (event.type === "conversation.item.input_audio_transcription.completed") {
          chatLog.current.user = [...chatLog.current.user, event.transcript];
          sessionStorage.setItem("chatLog", JSON.stringify(chatLog.current));
        }

        console.log("📥 Incoming Event:", {
          type: event.type,
          timestamp: new Date().toISOString(),
          data: event,
        });
        setEvents((prev) => [event, ...prev]);
      });

      // Log when data channel opens
      dataChannel.addEventListener("open", () => {
        console.log("🔌 Data Channel Opened:", new Date().toISOString());
        setIsSessionActive(CONNECTION_STATUS.CONNECTING);
        setEvents([]);
      });

      // Log when data channel closes
      dataChannel.addEventListener("close", () => {
        console.log("🔌 Data Channel Closed:", new Date().toISOString());
      });

      // Log any errors
      dataChannel.addEventListener("error", (error) => {
        console.error("❌ Data Channel Error:", {
          error,
          timestamp: new Date().toISOString(),
        });
      });
    }
  }, [dataChannel]);

  // Update connection status when function is added
  useEffect(() => {
    if (functionAdded && isSessionActive === CONNECTION_STATUS.CONNECTING) {
      setIsSessionActive(CONNECTION_STATUS.CONNECTED);
    }
  }, [functionAdded, isSessionActive]);

  // Handle function registration
  useEffect(() => {
    if (!functionAdded && events.length === 1 && events[0].type === "session.created") {
      dataChannel?.send(JSON.stringify(reviewCurrentPlan));
      setFunctionAdded(true);
    }
  }, [events, functionAdded, dataChannel]);

  // Handle initial response creation after function is added
  useEffect(() => {
    if (functionAdded && dataChannel && events.length === 3) {  // Only when events array has just the initial session.created event
      const event = {
        type: "response.create",
        response: {
          modalities: ["audio", "text"],
          temperature: 0.6,
          instructions: `
            和用户打招呼，并询问是否准备好开始每周的checkin，然后等待用户的回答
          `,
        },
      };
      dataChannel.send(JSON.stringify(event));
    }
  }, [functionAdded, dataChannel, events]);  // Added events to dependencies

  // Add useEffect for handling function registration
  useEffect(() => {
    if (!events || events.length === 0) return;

    const mostRecentEvent = events[0];
    if (
      mostRecentEvent.type === "response.done" &&
      mostRecentEvent.response.output
    ) {
      mostRecentEvent.response.output.forEach((output) => {
        if (
          output.type === "function_call" &&
          output.name === "adjust_exercise_plan"
        ) {
          const planData = JSON.parse(output.arguments);
          console.log("🏋️ Exercise Plan Adjustment:", {
            exercises: planData.exercises,
            totalMinutes: planData.total_weekly_minutes,
            timestamp: new Date().toISOString(),
          });

          // Cache the adjustment
          const adjustment = {
            timestamp: new Date().toISOString(),
            ...planData,
          };
          sessionStorage.setItem("lastExerciseAdjustment", JSON.stringify(adjustment));

          // Send final confirmation step
          setTimeout(() => {
            dataChannel?.send(JSON.stringify({
              type: "response.create",
              response: {
                instructions: `
                  和用户确认最终新的健身计划
                `,
              },
            }));
          }, 500);
        }

        if (
          output.type === "function_call" &&
          output.name === "confirm_final_plan"
        ) {
          console.log("✅ Final Plan Confirmation:", {
            confirmation: output.arguments,
          });

          // Cache the confirmation
          const confirmation = {
            timestamp: new Date().toISOString(),
            ...JSON.parse(output.arguments),
          };
          sessionStorage.setItem("lastPlanConfirmation", JSON.stringify(confirmation));

          // Send the final confirmation tool
          try {
            setTimeout(() => {
              dataChannel?.send(JSON.stringify({
                type: "response.create",
                response: {
                  instructions: `
                  鼓励用户坚持健身并感谢用户的配合，之后结束通话
                `,
                },
              }));

              // Create an AudioContext to analyze the stream
              const audioContext = new AudioContext();
              const source = audioContext.createMediaStreamSource(audioElement.current.srcObject);
              const analyser = audioContext.createAnalyser();
              analyser.fftSize = 256;
              source.connect(analyser);

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              let silenceStart = null;
              const SILENCE_THRESHOLD = 10; // Adjust this value based on testing
              const SILENCE_DURATION = 2000; // 2 seconds of silence

              const checkAudioLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

                if (average < SILENCE_THRESHOLD) {
                  if (!silenceStart) {
                    silenceStart = Date.now();
                  } else if (Date.now() - silenceStart > SILENCE_DURATION) {
                    console.log("🔚 Detected end of speech, closing session");
                    audioContext.close();
                    stopSession();
                    window.location.href = "/message";
                    return;
                  }
                } else {
                  silenceStart = null;
                }

                requestAnimationFrame(checkAudioLevel);
              };

              checkAudioLevel();

              console.log("🎧 Audio monitoring started");

            }, 500);
          } catch (e) {
            console.error(e);
          }
        }
      });
    }
  }, [events, functionAdded, dataChannel]);

  // Reset function state when session ends
  useEffect(() => {
    if (isSessionActive === CONNECTION_STATUS.DISCONNECTED) {
      setFunctionAdded(false);
      setFunctionCallOutput(null);
    }
  }, [isSessionActive]);

  return (
    <animated.div style={styles}>
      <div className="h-screen relative bg-gradient-to-b from-blue-400 to-violet-200">
        <div className="text-white text-4xl absolute left-[15%] top-1/4">
          <h1>Hello Marry,</h1>
          <h1>Let&apos;s check in.</h1>
        </div>
        <div className="absolute top-[20%]">
          <VoiceBg className="w-full" />
        </div>
        <div
          className="absolute left-1/2 top-[70%] -translate-x-1/2 -translate-y-1/2 flex justify-center w-20 flex-wrap">
          {isSessionActive === CONNECTION_STATUS.CONNECTED && (
            <>
              <div className="flex items-center ">
                <img alt="call icon" className="inline-block" src={callIcon} />
                <span className="ml-2">{formatTime(speakingTime)}</span>
              </div>
              <button className="mt-14" onClick={stopSession}>
                <Link to="/message">
                  <img alt="end call" className="w-16" src={endCallIcon} />
                </Link>
              </button>
            </>
          )}
          {isSessionActive === CONNECTION_STATUS.CONNECTING && (
            <div className="w-16">
              <div className="text-white text-xl">
                Calling
                <span className="animate-blink-1">.</span>
                <span className="animate-blink-2">.</span>
                <span className="animate-blink-3">.</span>
              </div>
              <button className="mt-8">
                <Link to="/">
                  <img alt="end call" className="w-16" src={endCallIcon} />
                </Link>
                <div className="mt-2">Decline</div>
              </button>
            </div>
          )}
          {isSessionActive === CONNECTION_STATUS.DISCONNECTED && (
            <>
              <button className="mt-16 rounded-full p-5 bg-green-600" onClick={startSession}>
                <PhoneCallIcon className="text-black fill-current" width={24} height={24} />
              </button>
              <div className="mt-2">Accept</div>
            </>
          )}
        </div>
      </div>
    </animated.div>
  );
}
