import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FooterInput from "../components/FooterInput.jsx";
import ChevronLeftIcon from "../components/ChevronLeftIcon.jsx";
import marryProfile from "../assets/marry-profile.svg";
import coffeeProfile from "../assets/avatar/coffee.svg";
import michaelProfile from "../assets/avatar/michael.svg";
import masterProfile from "../assets/avatar/master.svg";
import zhongyuanProfile from "../assets/avatar/zhongyuan.svg";
import pdfFile from "../assets/files/form_example.pdf";

// Add coach profiles data with last messages
const coachProfiles = [
  {
    id: 1,
    name: "Coffee",
    image: coffeeProfile,
    role: "Health Coach",
    lastMessage: "加油啊！你一定得ga",
    timestamp: "2:18 PM"
  },
  {
    id: 2,
    name: "Michael",
    image: michaelProfile,
    role: "Actuary",
    lastMessage: "第一次裝修應該考慮...",
    timestamp: "1:45 PM"
  },
  {
    id: 3,
    name: "Master Seven",
    image: masterProfile,
    role: "Today's fortune",
    lastMessage: "2025年的西曆三月和...",
    timestamp: "11:30 AM"
  },
  {
    id: 4,
    name: "中原小美",
    image: zhongyuanProfile,
    role: "Real Estate Consultant",
    lastMessage: "可以參考以下在藍田區...",
    timestamp: "11:30 AM"
  },
];

function ProfileSlider({ isOpen, onClose }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Glass background overlay */}
      <div
        className="absolute inset-0 bg-black/5 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slider content */}
      <div className="relative w-3/4 h-full bg-white/80 backdrop-blur-md shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Choose Your Advisor</h2>

          {/* Coach profiles list */}
          <div className="space-y-4">
            {coachProfiles.map((coach) => (
              <div
                key={coach.id}
                className="flex items-start p-4 rounded-lg hover:bg-white/50 transition-colors cursor-pointer"
              >
                <img
                  src={coach.image}
                  alt={coach.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="ml-4 flex-1">
                  <h3 className="font-medium">{coach.name}</h3>
                  <p className="text-sm text-gray-600">{coach.role}</p>
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500">{coach.timestamp}</span>
                    <p className="text-gray-700 mt-1 line-clamp-2">{coach.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Click area to close */}
      <div
        className="w-1/4 h-full"
        onClick={onClose}
      />
    </div>
  );
}

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

function ChatMessage({ isUser, content, timestamp, type = 'text', pdfUrl }) {
  const renderContent = () => {
    if (type === 'pdf') {
      return (
        <div
          className="flex items-center bg-gray-50 rounded-lg p-3 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => window.open(pdfUrl, '_blank')}
        >
          <div className="bg-red-500 p-2 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{content}</p>
            <p className="text-xs text-gray-500">PDF</p>
          </div>
        </div>
      );
    }
    return <p>{content}</p>;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <img
          src={marryProfile}
          alt="Advisor"
          className="w-8 h-8 rounded-full mr-2 self-end"
        />
      )}
      <div
        className={`max-w-[70%] rounded-2xl p-3 ${
          isUser 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-white shadow-md rounded-bl-none'
        }`}
      >
        {renderContent()}
        <span className={`text-xs mt-1 block ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {timestamp}
        </span>
      </div>
    </div>
  );
}

const DEFAULT_MESSAGE = [
  {
    id: 1,
    isUser: false,
    content: "form_example.pdf",
    type: 'pdf',
    pdfUrl: pdfFile,
    timestamp: "2:20 PM"
  },
  {
    id: 2,
    isUser: false,
    content: "Here's our latest insurance plan overview.",
    timestamp: "2:20 PM"
  }
];

export default function InsuranceChat() {
  const [chatLog, setChatLog] = useState(DEFAULT_MESSAGE);
  const [isSliderOpen, setIsSliderOpen] = useState(false);

 useEffect(() => {
    const storedChat = sessionStorage.getItem("insuranceChatLog");
    if (storedChat) {
      setChatLog([...chatLog, ...JSON.parse(storedChat)]);
    }
  }, []);

  const handleSendMessage = (message) => {
    const newMessage = {
      sender: 'user',
      id: chatLog.length + 1,
      isUser: true,
      content: message,
      type: 'text',
      timestamp: "2:20 PM"
    };
    setChatLog([...chatLog, newMessage]);
    sessionStorage.setItem("insuranceChatLog", JSON.stringify([...chatLog, newMessage]));
  };

  return (
    <div className="flex flex-col min-h-screen h-screen bg-gray-50">
      <Header onProfileClick={() => setIsSliderOpen(true)} />

      <div className="flex-1 overflow-scroll px-8 py-4 max-h-[calc(100vh-7rem)]">
        {chatLog.map(message => (
          <ChatMessage
            key={message.id}
            isUser={message.isUser}
            content={message.content}
            timestamp={message.timestamp}
            type={message.type}
            pdfUrl={message.pdfUrl}
          />
        ))}
      </div>

      <FooterInput onSendMessage={handleSendMessage} />

      {/* Profile Slider */}
      <ProfileSlider
        isOpen={isSliderOpen}
        onClose={() => setIsSliderOpen(false)}
      />
    </div>
  );
}
