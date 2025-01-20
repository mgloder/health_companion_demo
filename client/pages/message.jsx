import { Link } from "react-router-dom";

import FooterInput from "../components/FooterInput.jsx";
import CheckinMessageItem from "../components/CheckinMessageItem.jsx";


import marryProfile from "../assets/marry-profile.svg";
import ChevronLeftIcon from "../components/ChevronLeftIcon.jsx";

function Header() {
  return (
    <div className="flex items-center px-8 py-3 bg-gradient-to-r from-[#F2F2F2B8] to-[#D8E4FF67]">
      <Link to="/" className="bg-white">
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
  return (
    <div className="flex flex-col min-h-screen h-screen bg-gray-50">

      <Header />

      <div className="flex-1 overflow-scroll px-8">
        <CheckinMessageItem />
        <div className="bg-white rounded-2xl p-6 relative">
          <button className="w-full bg-blue-500 text-white rounded-full py-3 mt-6">
            Start !
          </button>
        </div>
      </div>
      <FooterInput />
    </div>
  );
}
