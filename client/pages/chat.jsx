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
  const [dataChannel, setDataChannel] = useState(null);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);

  async function startSession() {
    try {
      const tokenResponse = await fetch("/token");
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      const pc = new RTCPeerConnection();

      audioElement.current = document.createElement("audio");
      audioElement.current.autoplay = true;
      pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

      // 添加本地音频轨道（麦克风输入）
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
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
    } catch (error) {
      console.error("启动会话失败:", error);
    } finally {
      setIsSessionActive(CONNECTION_STATUS.CONNECTING);
      intervalRef.current = setInterval(() => {
        setSpeakingTime((prevTime) => prevTime + 1); // 每秒增加 1
      }, 1000);
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
        setEvents((prev) => {
          console.log("Event: ", e.data);
          return [JSON.parse(e.data), ...prev];
        });
      });

      // Set session active when the data channel is opened
      dataChannel.addEventListener("open", () => {
        setIsSessionActive(CONNECTION_STATUS.CONNECTED);
        setEvents([]);
      });
    }
  }, [dataChannel]);

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
