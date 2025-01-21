import PhoneCallIcon from "./PhoneCallIcon.jsx";
import pictureIcon from "../assets/picture.svg";

export default function FooterInput() {
  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 py-2 bg-white">
      <div className="flex items-center gap-2">
        <button className="bg-sis-cyan-60 rounded-full p-4">
          <PhoneCallIcon className="text-sis-blue fill-current" width={18} height={18} />
        </button>
        <div className="flex flex-1 items-center bg-sis-cyan-60 rounded-full px-4 py-2 h-14">
          <input
            type="text"
            placeholder="Ask me anything ..."
            className="flex-1 focus:outline-none mr-2 bg-sis-cyan-60"
          />
          <button className="ml-auto h-5 w-6">
            <img src={pictureIcon} alt="select picture" />
          </button>
        </div>
      </div>
    </div>
  );
}
