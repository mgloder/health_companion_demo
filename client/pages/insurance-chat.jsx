import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FooterInput from "../components/FooterInput.jsx";
import ChevronLeftIcon from "../components/ChevronLeftIcon.jsx";
import marryProfile from "../assets/marry-profile.svg";
import ChatMessage from "../components/ChatMessage.jsx";

function Header({ onProfileClick }) {
  return (
    <div className="flex items-center px-8 py-3 bg-gradient-to-r from-[#F2F2F2B8] to-[#D8E4FF67]">
      <Link to="/">
        <ChevronLeftIcon className="inline-block" width={13} height={31} fill={"currentColor"} />
      </Link>
      <img
        src={marryProfile}
        alt="Profile"
        className="ml-2 w-8 h-8 rounded-full cursor-pointer"
        onClick={onProfileClick}
      />
      <h1 className="ml-3.5 text-xl font-medium">Insurance Advisor</h1>
    </div>
  );
}

export default function InsuranceChat() {
  const [chatLog, setChatLog] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  useEffect(() => {
    const storedChat = sessionStorage.getItem("insuranceChatLog");
    if (storedChat) {
      setChatLog([...chatLog, ...JSON.parse(storedChat)]);
    }
  }, []);

  useEffect(() => {
    const lastChatLog = chatLog.at(-1);
    if (lastChatLog && lastChatLog.isUser) {
      try {
        fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cookie": document.cookie,
          },
          credentials: "include",
          body: JSON.stringify({
            message: lastChatLog.content,
          }),
        }).then((resp) =>
          resp.json(),
        ).then((respObj) => {
          const { type, message, data, uploadFile } = respObj;
          const newMessage = {
            id: chatLog.length + 1,
            isUser: false,
            content: message,
            data,
            type: uploadFile ? 'upload-file' : type,
            timestamp: new Date().toISOString(),
          };
          setChatLog([...chatLog, newMessage]);
          sessionStorage.setItem("insuranceChatLog", JSON.stringify([...chatLog, newMessage]));
        });
      } catch (error) {
        console.error("Error sending message to agent:", error);
      }
    }
  }, [chatLog]);

  const handleSendMessage = (message) => {
    const newMessage = {
      id: chatLog.length + 1,
      isUser: true,
      content: message,
      type: "text",
      timestamp: new Date().toISOString(),
    };
    setChatLog([...chatLog, newMessage]);
    sessionStorage.setItem("insuranceChatLog", JSON.stringify([...chatLog, newMessage]));
  };

  const handleMessageAction = (message) => {
    const newMessage = {
      id: chatLog.length + 1,
      isUser: true,
      content: message,
      type: "hidden",
      timestamp: new Date().toISOString(),
    };
    setChatLog([...chatLog, newMessage]);
    sessionStorage.setItem("insuranceChatLog", JSON.stringify([...chatLog, newMessage]));
  };

  return (
    <div className="flex flex-col min-h-screen h-screen bg-gray-50">
      <Header onProfileClick={() => setIsSliderOpen(true)} />

      <div className="flex-1 overflow-scroll px-4 py-4 max-h-[calc(100vh-12rem)]">
        {chatLog.map(message => (
          <ChatMessage
            key={message.id}
            isUser={message.isUser}
            content={message.content}
            timestamp={message.timestamp}
            type={message.type}
            pdfUrl={message.pdfUrl}
            data={message.data}
            onAction={handleMessageAction}
          />
        ))}
      </div>

      <FooterInput onSendMessage={handleSendMessage} />
    </div>
  );
}
