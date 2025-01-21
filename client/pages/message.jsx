import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import FooterInput from "../components/FooterInput.jsx";
import CheckinMessageItem from "../components/CheckinMessageItem.jsx";


import marryProfile from "../assets/marry-profile.svg";
import ChevronLeftIcon from "../components/ChevronLeftIcon.jsx";

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
      <h1 className="ml-3.5 text-xl font-medium">SisChat</h1>
    </div>
  );
}

export default function Message() {
  const [exercisePlan, setExercisePlan] = useState(null);
  const [chatLog, setChatLog] = useState(null);

  // 在组件加载时获取 localStorage 的值
  useEffect(() => {
    const chatLog = localStorage.getItem("agentChatLog");
    let exercisesPlanStr = null;

    if (localStorage.getItem("lastExerciseAdjustment")) {
      exercisesPlanStr = localStorage.getItem("lastExerciseAdjustment");
    } else if (localStorage.getItem("lastPlanConfirmation")) {
      exercisesPlanStr = localStorage.getItem("lastPlanConfirmation");
    }

    setChatLog(chatLog)
    setExercisePlan(JSON.parse(exercisesPlanStr));
  }, [])

  return (
    <div className="flex flex-col min-h-screen h-screen bg-gray-50">

      <Header />

      <div className="flex-1 overflow-scroll px-8">
        <CheckinMessageItem chatLog={chatLog} exercisePlan={exercisePlan}/>
      </div>
      <FooterInput />
    </div>
  );
}
