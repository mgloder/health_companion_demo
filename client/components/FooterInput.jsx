import { useState } from 'react';

import PhoneCallIcon from "./PhoneCallIcon.jsx";
import pictureIcon from "../assets/picture.svg";

export default function FooterInput({ onSendMessage }) {
  const [message, setMessage] = useState('');

  const handleSend = (e) => {
    if (e.key === 'Enter' && message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 pl-5 pr-4 py-1 bg-white z-10">
      <div className="flex items-center gap-2">
        <button className="bg-sis-cyan-60 rounded-full p-3">
          <PhoneCallIcon className="text-sis-blue fill-current" width={18} height={18} />
        </button>
        <div className="flex-grow bg-sis-cyan-60 rounded-full px-4 py-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask me anything ..."
              enterKeyHint="send"
              className="focus:outline-none bg-sis-cyan-60 w-full"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleSend}
            />
            <button className="ml-auto">
              <img src={pictureIcon} alt="select picture" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
