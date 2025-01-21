import { X } from "react-feather";
import noteIcon from "../assets/note.svg";
import linerShape from "../assets/liner-shape.svg";
import ExercisePanel from "./ExercisePanel.jsx";
import LifeStylePanel from "./LifeStylePanel.jsx";

export default function CheckinMessageItem() {
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
        <p>I spoke with Marry today. She is doing very well,exceeding her exercise goals and staying healthy
          overall! 💪</p>
        <p>We will continue to focus on her goal to achieve a healthier lifestyle in 6 months.</p>
        <p>🎯 I am super excited for Marry and she has been an inspiration!😆</p>
      </div>

      <div className="mt-4">
        <div className="flex items-center text-sm">
          <span className="bg-gradient-to-r from-sis-blue to-sis-blue-420 text-sis-lime px-3 py-1 rounded-full z-10">Goal</span>
          <div className="flex-1 rounded-r-xl bg-gradient-to-r from-[#D9E2F545] to-[#CFDEFF8F] -ml-2 pr-3 py-1 text-right ">
            <span className="text-sis-blue">Lose 5 kg in 2025</span>
          </div>
        </div>

        <div className="inline-block mt-3 text-sm bg-gradient-to-r from-sis-blue to-sis-blue-420 rounded-full px-3 py-1">
          <span className="text-sis-lime">Weekly Plan</span>
        </div>

        <div className="mt-3">
          <ExercisePanel />
          <LifeStylePanel />
        </div>
      </div>
    </div>
  );
}
