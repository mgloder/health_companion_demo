import { PhoneCall } from "react-feather";
import endCall from "../assets/end-call.svg";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function Chat() {
  const [dataChannel, setDataChannel] = useState(null);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);

  useEffect(() => {
    const startSession = async () => {
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
      }
    };

    startSession();

    // 清理函数：组件卸载时关闭会话
    return () => {
      if (dataChannel) {
        dataChannel.close();
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      setDataChannel(null);
      peerConnection.current = null;
    };
  }, []);

  return (
    <div className="h-screen relative bg-gradient-to-b from-blue-400 to-violet-200">
      <div className="text-white text-4xl absolute left-[15%] top-1/4">
        <h1>Hello Marry,</h1>
        <h1>Let&apos;s check in.</h1>
      </div>
      <div className="absolute left-1/2 top-[70%] flex items-center -translate-x-1/2 -translate-y-1/2">
        <PhoneCall className="inline-block -ml-3" />
        <span className="ml-2">00:01:35</span>
      </div>
      <div className="absolute left-1/2 top-3/4 -translate-x-1/2">
        <Link to="/message">
          <img alt="end call" className="w-16" src={endCall} />
        </Link>
      </div>
    </div>
  )
}
