import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FooterInput from "../components/FooterInput.jsx";
import ChevronLeftIcon from "../components/ChevronLeftIcon.jsx";
import marryProfile from "../assets/marry-profile.svg";

function Header() {
  return (
    <div className="flex items-center px-8 py-3 bg-gradient-to-r from-[#F2F2F2B8] to-[#D8E4FF67]">
      <Link to="/">
        <ChevronLeftIcon className="inline-block" width={13} height={31} fill={"currentColor"} />
      </Link>
      <img
        src={marryProfile}
        alt="Profile"
        className="ml-2 w-8 h-8 rounded-full"
      />
      <h1 className="ml-3.5 text-xl font-medium">Insurance Advisor</h1>
    </div>
  );
}

export default function InsuranceChat() {
  const [chatLog, setChatLog] = useState(null);

  useEffect(() => {
    const chatLog = sessionStorage.getItem("insuranceChatLog");
    setChatLog(chatLog);
  }, []);

  return (
    <div className="flex flex-col min-h-screen h-screen bg-gray-50">
      <Header />

      <div className="flex-1 overflow-scroll px-8">
        {/* Chat messages will go here */}
      </div>

      <FooterInput />
    </div>
  );
} 