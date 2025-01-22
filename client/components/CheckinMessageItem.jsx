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
    console.error('请求出错:', error);
    return null;
  }
}

function getSummaryOrDefault(summary) {
  const defaultSummary = `今天我和 Marry 进行了本周的健身 Check-In。虽然 Marry 这周的运动量没有达到我们设定的目标，总共只完成了90分钟，未能完成150分钟的计划。我们讨论了原因，主要是因为工作忙碌影响了运动时间。接下来的一周，我们决定保持原定的计划，不做调整。尽管工作繁忙，我鼓励 Marry 下周尝试抽出更多时间来锻炼。我相信你能做到，Marry，继续加油！💪🏻🌟`;
  const summaryStr = summary ? summary : defaultSummary;
  let lines;
  try {
    lines = summaryStr.split("\n");
  } catch (error) {
    console.error(error);
    lines = defaultSummary.split("\n");
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
  const { data: exercises } = useSWR(
    exercisePlan?.summary ? ["/api/parse-exercise", JSON.stringify({ summary: exercisePlan.summary })] : null,
    postFetcher,
    {
      shouldRetryOnError: false,
      refreshInterval: 0,
    }
  );

  const { data: summaryObj } = useSWR(
    chatLog ? ["/api/summary", JSON.stringify({ summary: chatLog })] : null,
    postFetcher,
    {
      shouldRetryOnError: false,
      refreshInterval: 0,
    }
  );

  return (
    <div className="mt-2 px-2 pb-8 rounded-2xl bg-gradient-to-r from-[#F2F2F2B8] to-[#D8E4FF67]">
      <div className="relative flex items-center justify-between py-6">
        <div>
          <img className="inline-block" src={noteIcon} alt="note" sizes="31" />
          <span className="ml-2.5 leading-[31px] text-sis-blue">Check in Notes</span>
        </div>
        <button className="rounded-full p-2 -mt-4 bg-gradient-to-br to-sis-blue from-sis-blue-420">
          <X size={20} className="text-white z-10" />
        </button>
        <img
          src={linerShape}
          className="absolute right-0 top-0 h-full w-full z-0"
          style={{ objectFit: "cover" }}
          alt="background liner"
        />
      </div>
      <div className="rounded-3xl bg-sis-white-50 p-5 text-sm text-sis-purple">
        {getSummaryOrDefault(summaryObj?.summary)}
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
          <ExercisePanel data={exercises} />
          <LifeStylePanel data={exercisePlan?.lifeStyle} />
        </div>
      </div>
    </div>
  );
}
