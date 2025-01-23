import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FooterInput from "../components/FooterInput.jsx";
import ChevronLeftIcon from "../components/ChevronLeftIcon.jsx";
import marryProfile from "../assets/marry-profile.svg";

// Add coach profiles data with last messages
const coachProfiles = [
  { 
    id: 1, 
    name: "Marry", 
    image: marryProfile, 
    role: "Insurance Advisor",
    lastMessage: "I can help you find the best insurance plan for your needs",
    timestamp: "2:18 PM"
  },
  { 
    id: 2, 
    name: "John", 
    image: marryProfile, 
    role: "Health Insurance Expert",
    lastMessage: "Let's review your current health coverage",
    timestamp: "1:45 PM"
  },
  { 
    id: 3, 
    name: "Sarah", 
    image: marryProfile, 
    role: "Tax Consultant",
    lastMessage: "Here's how you can maximize your tax deductions",
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

export default function InsuranceChat() {
  const [chatLog, setChatLog] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  useEffect(() => {
    const chatLog = sessionStorage.getItem("insuranceChatLog");
    setChatLog(chatLog);
  }, []);

  return (
    <div className="flex flex-col min-h-screen h-screen bg-gray-50">
      <Header onProfileClick={() => setIsSliderOpen(true)} />

      <div className="flex-1 overflow-scroll px-8">
        {/* Chat messages will go here */}
      </div>

      <FooterInput />

      {/* Profile Slider */}
      <ProfileSlider 
        isOpen={isSliderOpen} 
        onClose={() => setIsSliderOpen(false)} 
      />
    </div>
  );
} 