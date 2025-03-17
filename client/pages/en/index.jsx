import { useEffect, useState } from "react";
import { RefreshCw } from "react-feather";
import marryProfile from "../../assets/avatar/michael.svg";
import ChatMessage from "../../components/ENChatMessage.jsx";
import ChatFooterInput from "../../components/ChatFooterInput.jsx";

const WELCOME_MESSAGE = {
  id: 1,
  isUser: false,
  content: "Hello! I am your health assistant, Michael. If you are feeling unwell, please tell me your specific symptoms. I can help analyze your condition and recommend a suitable doctor.",
  data: null,
  type: "text",
  timestamp: new Date().toISOString(),
};

function Header({ onProfileClick, setChatLog }) {
  return (
    <div className="flex items-center px-8 py-3 bg-gradient-to-r from-[#F2F2F2B8] to-[#D8E4FF67]">
      <img
        src={marryProfile}
        alt="Profile"
        className="ml-2 w-8 h-8 rounded-full cursor-pointer"
        onClick={onProfileClick}
      />
      <h1 className="ml-3.5 text-xl font-medium">AI Health Assistant</h1>
      <button
        className="ml-auto"
        onClick={() => {
          sessionStorage.clear();
          fetch("/clear-cookie", {
            method: "GET",
            credentials: "include",
          });
          setChatLog([WELCOME_MESSAGE]);
        }}
      >
        <RefreshCw />
      </button>
    </div>
  );
}

export default function InsuranceChat() {
  const [chatLog, setChatLog] = useState([WELCOME_MESSAGE]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  useEffect(() => {
    const storedChat = sessionStorage.getItem("insuranceChatLog");
    if (storedChat) {
      setChatLog([...JSON.parse(storedChat)]);
    }
  }, []);

  useEffect(() => {
    const lastChatLog = chatLog.at(-1);
    if (lastChatLog && lastChatLog.isUser) {
      console.log(lastChatLog);
      try {
        fetch("/api/chat-en", {
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
            type: uploadFile ? "upload-file" : type,
            timestamp: new Date().toISOString(),
          };
          if (type === "recommend_doctor") {
            setTimeout(() => {
              setChatLog(prev => {
                if (prev.length === newMessage.id) {
                  return [
                    ...prev,
                    {
                      id: prev.length + 1,
                      isUser: false,
                      content: "I noticed that your current Bupa policy may have room for improvement in terms of surgical coverage. To better meet your medical needs, I suggest considering a voluntary health insurance plan to enhance your overall protection. I have some great options available—would you be interested in learning more?",
                      timestamp: new Date().toISOString(),
                      type: "recommend_insurance_client",
                    },
                  ];
                }
                return prev;
              });
            }, 5000);
          }
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
    let newMessage = {
      id: chatLog.length + 1,
      isUser: true,
      content: message,
      type: "hidden",
      timestamp: new Date().toISOString(),
    };
    console.log(message);
    if (message === "purchase_online") {
      newMessage = {
        id: chatLog.length + 1,
        isUser: false,
        content: "",
        type: "purchase_success",
        timestamp: new Date().toISOString(),
      };
    }
    setChatLog([...chatLog, newMessage]);
    sessionStorage.setItem("insuranceChatLog", JSON.stringify([...chatLog, newMessage]));
  };

  return (
    <div className="flex flex-col min-h-screen h-screen bg-gray-50">
      <Header onProfileClick={() => setIsSliderOpen(true)} setChatLog={setChatLog} />

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

      <ChatFooterInput onSendMessage={handleSendMessage} />
    </div>
  );
}
