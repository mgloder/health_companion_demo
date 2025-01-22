import { X } from "react-feather";
import noteIcon from "../assets/note.svg";
import linerShape from "../assets/liner-shape.svg";
import ExercisePanel from "./ExercisePanel.jsx";
import LifeStylePanel from "./LifeStylePanel.jsx";
import userProfile from "../assets/marry-profile.json";
import useSWR from "swr";

async function postFetcher([url, body]) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
    if (!response.ok) {
      throw new Error(`请求 ${url} status: ${response.status} 失败 `);
    }
    return response.json();
  } catch (error) {
    console.error("请求出错:", error);
    return null;
  }
}

function getSummaryOrDefault(summary) {
  let lines;
  try {
    lines = summary ? summary.split("\n") : [];
  } catch (error) {
    console.error(error);
    lines = [];
  }

  return lines.map((line, index) => (
    <p key={index}>{line}</p>
  ));
}

function getGoalText({ currentWeight, targetWeight, timeframe }) {
  if (targetWeight === currentWeight) {
    return `Maintain your current weight.`;
  } else if (targetWeight > currentWeight) {
    return `Gain ${targetWeight - currentWeight}kg of muscle in ${timeframe}.`;
  } else {
    return `Lose ${currentWeight - targetWeight}kg in ${timeframe}.`;
  }
}

export default function CheckinMessageItem({ chatLog, exercisePlan }) {
  let exercisesDetail;
  const { data: exercises, isLoading: isExercisesLoading } = useSWR(
    exercisePlan?.summary ? ["/api/parse-exercise", JSON.stringify({ summary: exercisePlan.summary })] : null,
    postFetcher,
    {
      shouldRetryOnError: false,
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const { data: summaryObj, isLoading: isSummaryLoading } = useSWR(
    chatLog ? ["/api/summary", JSON.stringify({ summary: chatLog })] : null,
    postFetcher,
    {
      shouldRetryOnError: false,
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  if (exercises) {
    exercisesDetail = exercises;
  } else if (exercisePlan?.exercises) {
    exercisesDetail = exercisePlan.exercises;
  }

  return (
    <div className="relative mt-2 px-2 pb-14 rounded-2xl bg-gradient-to-r from-[#F2F2F2B8] to-[#D8E4FF67]">
      <img
        src={linerShape}
        className="absolute right-0 top-0 h-20 w-full z-0"
        style={{ objectFit: "cover" }}
        alt="background liner"
      />
      <div className=" flex items-center justify-between py-6">
        <div>
          <img className="inline-block" src={noteIcon} alt="note" sizes="31" />
          <span className="ml-2.5 leading-[31px] text-sis-blue">Check in Notes</span>
        </div>
        <button className="rounded-full p-2 -mt-4 bg-gradient-to-br to-sis-blue from-sis-blue-420">
          <X size={20} className="text-white z-10" />
        </button>
      </div>

      <div className="rounded-3xl bg-sis-white-50 p-5 text-sm text-sis-purple min-h-40">
        {isSummaryLoading ?
          (<div role="status" className="max-w-sm animate-pulse">
            <div className="h-5 bg-sis-gray-100 rounded-full mb-2"></div>
            <div className="h-5 bg-sis-gray-100 rounded-full mb-2"></div>
            <div className="h-5 bg-sis-gray-100 rounded-full mb-2"></div>
            <div className="h-5 bg-sis-gray-100 rounded-full"></div>
          </div>) :
          getSummaryOrDefault(summaryObj?.summary)
        }
      </div>

      <div className="mt-4">
        <div className="flex items-center text-sm">
          <span
            className="bg-gradient-to-r from-sis-blue to-sis-blue-420 text-sis-lime px-3 py-1 rounded-full z-10">Goal</span>
          <div
            className="flex-1 rounded-r-xl bg-gradient-to-r from-[#D9E2F545] to-[#CFDEFF8F] -ml-2 pr-3 py-1 text-right ">
            <span className="text-sis-blue">{getGoalText(userProfile.user)}</span>
          </div>
        </div>

        <div
          className="inline-block mt-3 text-sm bg-gradient-to-r from-sis-blue to-sis-blue-420 rounded-full px-3 py-1">
          <span className="text-sis-lime">Weekly Plan</span>
        </div>

        <div className="mt-3">
          {isExercisesLoading ?
            (<div role="status" className="max-w-sm animate-pulse">
              <div className="h-5 bg-sis-gray-100 rounded-full mb-2"></div>
              <div className="h-5 bg-sis-gray-100 rounded-full mb-2"></div>
              <div className="h-5 bg-sis-gray-100 rounded-full mb-2"></div>
              <div className="h-5 bg-sis-gray-100 rounded-full"></div>
            </div>) :
            <ExercisePanel data={exercisesDetail} />
          }
          <LifeStylePanel data={exercisePlan?.lifeStyle} />
        </div>
      </div>


      <img
        src={linerShape}
        className="absolute right-0 bottom-0 h-14 w-full z-0"
        style={{ objectFit: "cover" }}
        alt="background liner"
      />

      <button
        className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 w-28 z-10 py-2 rounded-3xl bg-gradient-to-br from-[#6485FA] to-[#9DB2FF] text-white">
        Start!
      </button>
    </div>
  );
}
