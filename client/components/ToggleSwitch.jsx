import { useState } from "react";

function ToggleSwitch() {
  const [isYes, setIsYes] = useState(true);

  return (
    <div
      className="inline-flex items-center bg-white rounded-full p-1 h-6 cursor-pointer"
      onClick={() => setIsYes(!isYes)}
    >
      <div
        className={`flex-1 text-center px-2 rounded-full text-sm ${
          isYes ? "bg-sis-blue text-white" : "text-[#979797]"
        }`}
      >
        Yes
      </div>
      <div
        className={`flex-1 text-center px-2 rounded-full text-sm ${
          !isYes ? "bg-sis-blue text-white" : "text-[#979797]"
        }`}
      >
        No
      </div>
    </div>
  );
}

export default ToggleSwitch;
