import marryProfile from "../assets/marry-profile.svg";
import { formatChatTime } from "../utils/utils.js";

function renderPdfItem(pdfUrl, content) {
  return (
    <div
      className="flex items-center bg-gray-50 rounded-lg p-3 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => window.open(pdfUrl, "_blank")}
    >
      <div className="bg-red-500 p-2 rounded">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
             stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900">{content}</p>
        <p className="text-xs text-gray-500">PDF</p>
      </div>
    </div>
  );
}

function renderRecommendationItem(data) {
  return (
    <div>
      <p className="font-light">我為你挑了三家公司產品以供对比：</p>
      <div className="flex flex-col gap-2.5 mt-2.5 w-full transform translate-x-4 translate-y-2">
        {
          data.map((item, index) => {
            return (
              <div key={index} className="px-3 py-1 bg-[#3660F91A] rounded-2xl">
                <div className="flex justify-between items-end">
                  <div>
                    <img />
                    <span className="text-sm font-bold text-sis-purple">{item.insuranceCompany}</span>
                  </div>
                  <div>
                    <span>HK$</span>
                    <span>1500</span>
                  </div>
                </div>
                <ul className="mt-2.5 text-xs leading-[18px]">
                  <li>屬於市面上較多人撰擇的公司品牌</li>
                  <li>12月有镯家75折優惠</li>
                </ul>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

export default function ChatMessage({ isUser, content, timestamp, type = "text", pdfUrl, data }) {
  const renderContent = () => {
    if (type === "pdf") {
      return renderPdfItem(pdfUrl, content);
    }
    if (type === "recommendation") {
      return renderRecommendationItem(data);
    }
    if (type === "form") {
      return (<div><p>OK!請麻烦填寫资料👇</p></div>);
    }
    return <p>{content}</p>;
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <img
          src={marryProfile}
          alt="Advisor"
          className="w-8 h-8 rounded-full mr-2 self-end"
        />
      )}
      <div
        className={`max-w-[75%] rounded-2xl p-3 ${
          isUser
            ? "bg-sis-blue text-white rounded-br-none"
            : "bg-white shadow-md rounded-bl-none"
        }`}
      >
        {renderContent()}
      </div>
    </div>
  );
}
