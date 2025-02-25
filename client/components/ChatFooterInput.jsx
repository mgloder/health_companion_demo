import { useState, useRef } from "react";

import PhoneCallIcon from "./PhoneCallIcon.jsx";
import keyboardIcon from "../assets/keyboard.svg";
import voiceIcon from "../assets/voice-message.svg";
import pictureIcon from "../assets/picture.svg";

export default function ChatFooterInput({ onSendMessage }) {
  const [message, setMessage] = useState("");
  const [isTalk, setIsTalk] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);


  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const handleSend = (e) => {
    if (e.key === "Enter" && message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const startRecording = async (target) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, 'audio.webm');

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      setMessage(data.text);
      setIsTalk(false);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      alert("Error processing audio");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 pl-5 pr-4 py-1 bg-white z-10">
      <div className="flex items-center gap-2">
        <button className="bg-sis-cyan-60 rounded-full p-3">
          <PhoneCallIcon className="text-sis-blue fill-current" width={18} height={18} />
        </button>
        <div className="flex-grow bg-sis-cyan-60 rounded-full px-4 py-2">
          <div className="flex items-center gap-2">
            {isTalk ?
              <button className="bg-sis-cyan-60 w-full text-gray-500"
                      onClick={isRecording ? stopRecording : () => startRecording()}
                      disabled={isProcessing}>
                {isProcessing ? 'Transcribing...' : isRecording ? 'Recording now...' : 'Hold To Talk'}
              </button> :
              <input
                type="text"
                placeholder="Ask me anything ..."
                enterKeyHint="send"
                className="focus:outline-none bg-sis-cyan-60 w-full"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleSend}
              />
            }

            {isTalk ?
              <button className="ml-auto" onClick={() => setIsTalk(false)}>
                <img src={keyboardIcon} alt="use text input" sizes={12} />
              </button> :
              <button className="ml-auto" onClick={() => setIsTalk(true)}>
                <img src={voiceIcon} alt="use text input" sizes={12} />
              </button>
            }
            <button className="ml-auto">
              <img src={pictureIcon} alt="select picture" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
