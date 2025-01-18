import { Link } from "react-router-dom";
import { ChevronRight } from "react-feather";

import PhoneCallIcon from "../components/PhoneCallIcon.jsx";
import FooterInput from "../components/FooterInput.jsx";
import ChevronRightIcon from "../components/ChevronRightIcon.jsx";

import marryProfileIcon from "../assets/marry-profile.svg";
import arrowsExchangeIcon from "../assets/arrows-exchange.svg";
import calendarIcon from "../assets/calendar.svg";
import rightArrowIcon from "../assets/right-arrow.svg";
import healthShieldIcon from "../assets/health-shield.svg";
import bookIcon from "../assets/book.svg";
import shopBagIcon from "../assets/shop-bag.svg";
import ExerciseChart from "../components/ExerciseChart.jsx";


function Header() {
  return (
    <div className="flex p-4 justify-between">
      <h1 className="text-4xl inline-block self-start">Sisyphus</h1>
      <Link to="/profile" className="self-end">
        <img className="inline-block size-10 rounded-full ring-2 ring-white"
             src={marryProfileIcon}
             alt="" />
      </Link>
    </div>
  );
}

function Switch() {
  return (
    <div className="relative flex p-4 justify-center gap-4">
      <div className="flex flex-1 justify-center items-center rounded-2xl shadow-lg h-16 bg-black text-white">
        <p className="text-4xl">315.7<span className="text-base font-light ml-2">hours</span></p>
      </div>
      <div className="absolute left-1/2 top-1/2 z-20 m-auto flex -translate-x-1/2 -translate-y-1/2 transform">
        <div
          className="inline-flex rounded-full bg-white p-1">
          <div
            className="inline-flex rounded-full border border-solid bg-lime-300 p-2">
            <img alt="exchage" src={arrowsExchangeIcon} />
          </div>
        </div>
      </div>
      <div className="flex flex-1 justify-center items-center rounded-2xl shadow-lg h-16 bg-black text-white">
        <p className="text-4xl">69.00<span className="text-base font-light ml-2">mbc</span></p>
      </div>
    </div>
  );
}

function ExercisePanel({ className }) {
  return (
    <div className={className}>
      <div className="pl-6 pr-2 pt-2">
        <div className="flex justify-between items-center">
          <p className="text-sis-blue">NO.<span className="text-xl">5</span><span className="text-sis-gray pl-2">Among Friends</span>
            <ChevronRight className="inline-block h-4 w-4 pl-1" />
          </p>
          <img className="inline-block" src={calendarIcon} alt="calendar" sizes={28} />
        </div>
        <ExerciseChart />
      </div>
      <div className="flex justify-between items-end text-xl mt-1 text-sis-blue leading-8">
        <div className="grow bg-gradient-to-r from-sis-blue-100 rounded-2xl px-4">9.2 <span
          className="text-base font-light">hours</span></div>
        <div className="grow-0 inline-block">
          <span className="text-base font-light mr-2">mbc earned</span>
          <div className="inline-block w-16 rounded-2xl bg-sis-blue-300 text-sis-purple text-center">
            <span className="mr-1">+</span>8.2
          </div>
        </div>
      </div>
    </div>
  );
}

function Checkin() {
  return (
    <Link to="/chat">
      <div
        className="flex items-center bg-gradient-to-r from-sis-cyan-150 to-sis-cyan-200 rounded-full h-16 overflow-hidden mr-3.5 pr-2">
        <div className="rounded-full border border-solid border-sis-blue p-1 -ml-2">
          <div
            className="rounded-full border-solid border-2 border-sky-50 p-2 bg-gradient-to-r from-sky-400">
            <PhoneCallIcon className="text-blue-600 fill-current" width={18} height={18} />
          </div>
        </div>
        <span className="text-lg font-bold text-sis-purple ml-1">Let&apos;s do a health checkin!</span>
        <div className="ml-auto mr-2">
          <ChevronRightIcon className="inline-block text-gray-100" width={13} height={31} fill={"currentColor"} />
          <ChevronRightIcon className="inline-block text-white -translate-x-[4px]" width={13} height={31}
                            fill={"currentColor"} />
        </div>
      </div>
    </Link>
  );
}

function RecommendItem({ icon, text }) {
  return (
    <div
      className="flex items-center bg-gradient-to-r from-sis-cyan-50 to-sis-cyan-100 rounded-full mt-4 mr-8 min-h-12">
      <div className="rounded-full p-1 ml-2 mr-2 h-7 w-7 bg-black">
        <img src={icon} alt="text" />
      </div>
      <p className="max-w-52 text-sis-black-400">{text}</p>
      <div className="inline-block ml-auto mr-2 rounded-full bg-white p-2">
        <img src={rightArrowIcon} alt="click" />
      </div>
    </div>
  );
}

export default function Index() {
  return (
    <>
      <Header />
      <Switch />
      <ExercisePanel className="mt-2 mx-6 bg-sis-cyan-110 rounded-t-2xl rounded-b-[20px] " />
      <div className="mt-12 px-12">
        <Checkin />
        <RecommendItem
          icon={healthShieldIcon}
          text={"Eating tips for the Winter"}
        />
        <RecommendItem
          icon={bookIcon}
          text={"Exercise at office desk ?"}
        />
        <RecommendItem
          icon={shopBagIcon}
          text={"See latest offers for tax-deductible insurance"}
        />
      </div>
      <FooterInput />
    </>
  );
}
