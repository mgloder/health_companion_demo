import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Calendar, ChevronRight, Columns, PhoneCall, Shield } from "react-feather";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import marryProfileIcon from "../assets/marry-profile.svg";
import arrowsExchangeIcon from "../assets/arrows-exchange.svg";
import calendarIcon from "../assets/calendar.svg";
import rightArrowIcon from "../assets/right-arrow.svg";
import healthShieldIcon from "../assets/health-shield.svg";
import bookIcon from "../assets/book.svg";
import shopBagIcon from "../assets/shop-bag.svg";
import callIcon from "../assets/call.svg";
import PhoneCallIcon from "../components/PhoneCallIcon.jsx";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  },
};

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const data = {
  labels,
  datasets: [
    {
      label: "Dataset 1",
      data: [0.5, 1.0, 1.2, 1.5, 1.7, 1.9, 2.0],
      backgroundColor: "background: linear-gradient(blue, pink);",
    },
  ],
};

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
      <div className="flex justify-between items-center">
        <p className="text-sis-blue">NO.<span className="text-xl">5</span><span className="text-sis-gray pl-2">Among Friends</span>
          <ChevronRight className="inline-block h-4 w-4 pl-1" />
        </p>
        <img className="inline-block" src={calendarIcon} alt="calendar" sizes={28} />
      </div>
      <Bar options={options} data={data} />
      <div className="flex justify-between items-end text-xl mt-1 -mx-2 text-sis-blue leading-8">
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
        className="flex items-center bg-gradient-to-r from-sis-cyan-150 to-sis-cyan-200 rounded-full h-16 overflow-hidden">
        <div className="rounded-full border border-solid border-sis-blue p-1 -ml-2">
          <div
            className="rounded-full border-solid border-2 border-sky-50 p-2 bg-gradient-to-r from-sky-400">
            <PhoneCallIcon className="text-blue-600 fill-current" width={18} height={18} />
          </div>
        </div>
        <span className="text-lg font-bold text-sis-purple ml-1">Let&apos;s do a health checkin!</span>
        <div className="ml-auto mr-2">
          <ChevronRight className="inline-block ml-1 text-gray-200" />
          <ChevronRight className="inline-block -ml-4 text-white" />
        </div>
      </div>
    </Link>
  );
}

function RecommendItem({ icon, text }) {
  return (
    <div
      className="flex items-center bg-gradient-to-r from-sis-cyan-50 to-sis-cyan-100 rounded-full mt-4 mr-8 min-h-12">
      <div className="rounded-full p-1 mr-2 h-7 w-7 bg-black">
        <img src={icon} alt="text" />
      </div>
      <p className="max-w-52">{text}</p>
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
      <ExercisePanel className="mt-1 px-12" />
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
    </>
  );
}
