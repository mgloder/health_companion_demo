import { PhoneCall } from "react-feather";
import endCall from "../assets/end-call.svg";

export default function Chat() {
  return (
    <div className="h-screen relative bg-gradient-to-b from-blue-400 to-violet-200">
      <div className="text-white text-4xl absolute left-[15%] top-1/4">
        <h1>Hello Marry,</h1>
        <h1>Let's check in.</h1>
      </div>
      <div className="absolute left-1/2 top-[70%] flex items-center -translate-x-1/2 -translate-y-1/2">
        <PhoneCall className="inline-block -ml-3" />
        <span className="ml-2">00:01:35</span>
      </div>
      <div className="absolute left-1/2 top-3/4 -translate-x-1/2">
        <img className="w-16" src={endCall} />
      </div>
    </div>
  )
}
