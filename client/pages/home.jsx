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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 17" aria-hidden="true"
                 className="h-4 w-4 text-black">
              <path fill="currentColor" fill-rule="evenodd"
                    d="M11.726 1.273l2.387 2.394H.667V5h13.446l-2.386 2.393.94.94 4-4-4-4-.94.94zM.666 12.333l4 4 .94-.94L3.22 13h13.447v-1.333H3.22l2.386-2.394-.94-.94-4 4z"
                    clip-rule="evenodd"></path>
            </svg>
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
        <p className="text-sky-600">NO.<span className="text-xl">5</span><span className="text-gray-400 pl-2">Among Friends</span>
          <ChevronRight className="inline-block h-4 w-4 pl-1" />
        </p>
        <Calendar className="inline-block h-4 w-4" />
      </div>
      <Bar options={options} data={data} />
      <div className="flex justify-between items-end text-xl mt-1 -mx-2 text-sky-600 leading-8">
        <div className="grow bg-gradient-to-r from-sky-200 rounded-2xl px-4">9.2 <span
          className="text-base font-light">hours</span></div>
        <div className="grow-0 inline-block">
          <span className="text-base font-light mr-2">mbc earned</span>
          <div className="inline-block w-16 rounded-2xl bg-sky-100 text-indigo-700 text-center">+8.2</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <div className="flex p-4 justify-between">
        <h1 className="text-4xl inline-block self-start">Sisyphus</h1>
        <Link to="/profile" className="self-end">
          <img className="inline-block size-10 rounded-full ring-2 ring-white"
               src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
               alt="" />
        </Link>
      </div>
      <Switch />
      <ExercisePanel className="mt-1 px-12" />
      <div className="mt-12 px-12">
        <Link to="/chat">
          <div
            className="flex justify-between items-center bg-gradient-to-l from-sky-200 rounded-full h-16 overflow-hidden">
            <div className="rounded-full border-solid p-1 -ml-2">
              <div
                className="rounded-full border-solid border-8 border-sky-50 p-1 bg-gradient-to-r from-sky-400">
                <PhoneCall className="text-blue-600" />
              </div>
            </div>
            <b className="text-lg font-bold text-indigo-700">Let's do a health checkin!</b>
            <ChevronRight className="inline-block ml-1 text-gray-200" />
            <ChevronRight className="inline-block -ml-4 text-white" />
          </div>
        </Link>
        <div
          className="flex items-center justify-between bg-gradient-to-l from-sky-100 rounded-full h-12 mt-4 mr-8">
          <div className="rounded-full p-1 mr-2 bg-black">
            <Shield className="text-lime-300" />
          </div>
          <p className="text-base">Eating tips for the Winter</p>
          <ArrowRight className="inline-block -ml-4 text-blue-600" />
        </div>
        <div
          className="flex items-center bg-gradient-to-l from-sky-100 rounded-full h-12 mt-4 mr-8">
          <div className="rounded-full p-1 mr-2 bg-black">
            <Columns className="text-fuchsia-300" />
          </div>
          <p className="text-base">exercise at office desk ?</p>
          <ArrowRight className="inline-block text-blue-600" />
        </div>
        <div
          className="flex items-center bg-gradient-to-l from-sky-100 rounded-full h-12 mt-4 mr-8">
          <div className="rounded-full p-1 mr-2 bg-black">
            <Briefcase className="text-lime-300" />
          </div>
          <p className="text-base">See latest offers for tax-deductible insurance</p>
          <ArrowRight className="inline-block text-blue-600" />
        </div>
      </div>
    </>
  );
}
