import { CheckCircle, XCircle } from "react-feather";

import ToggleSwitch from "./ToggleSwitch.jsx";

import marryProfile from "../assets/marry-profile.svg";
import axa from "../assets/axa.png";
import bluecross from "../assets/bluecross.png";
import hongleong from "../assets/hongleong.png";
import { useState } from "react";
import UploadCard from './UploadCard';


const imgMap = {
  "安盛": axa,
  "蓝十字": bluecross,
  "Hong Leong 豐隆": hongleong,
};

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
    <div className="">
      <p className="text-[15px] font-light">我為你挑了三家公司產品以供对比：</p>
      <div className="flex flex-col gap-2.5 mt-2.5 w-full">
        {
          data.map((item, index) => {
            return (
              <div key={index} className="px-3 py-1 bg-[#3660F91A] backdrop-blur-md rounded-2xl w-[277px]">
                <div className="flex justify-between items-end">
                  <div className="flex items-end gap-1">
                    <img className="inline-block" src={imgMap[item.insuranceCompany]} sizes={26} />
                    <span className="text-sm font-bold text-sis-purple">{item.insuranceCompany}</span>
                  </div>
                  <div className="text-sis-purple">
                    {item.insuranceDiscountPrice && (
                      <s className="mr-1 opacity-45 text-[10px] leading-5">官铜：HK${item.insuranceDiscountPrice}</s>)
                    }
                    <span className="text-[10px] leading-5">HK$</span>
                    <span className="text-sm">1500</span>
                  </div>
                </div>
                {
                  item.advantages && (
                    <ul className="text-sis-purple mt-2.5 text-xs leading-[18px] list-disc list-inside">
                      {item.advantages.map((item, index) => {
                        return (<li key={index}>{item}</li>);
                      })}
                    </ul>)
                }

              </div>
            );
          })
        }
      </div>
    </div>
  );
}

function renderFormItem(data) {
  const [isSubmit, setIsSubmit] = useState(false);

  return (
    <div className="mb-4 w-full px-6 py-5 rounded-[1.25rem] bg-gradient-to-r from-[#F2F2F2B8] to-[#D8E4FF67]">
      <div className="mb-2">
        <div className="text-xs text-sis-blue">莱主姓名：</div>
        <div className="relative mt-1">
          <input className="w-full text-sm leading-8 px-3 pr-10 rounded-[1.25rem] bg-white maxlength" multiple={false}
                 maxLength={10} value={"Marry Wang"} />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <CheckCircle className="text-[#6EB806]" size={25} />
          </div>
        </div>
      </div>

      <div className="mb-2">
        <div className="text-xs text-sis-blue">莱主身分證號瑪：</div>
        <div className="relative mt-1">
          <input className="w-full text-sm leading-8 px-3 pr-10 rounded-[1.25rem] bg-white maxlength" multiple={false}
                 maxLength={10} />
        </div>
      </div>

      <div className="mb-2">
        <div className="text-xs text-sis-blue">地址：</div>
        <div className="relative mt-1">
          <input className="w-full text-sm leading-8 px-3 pr-10 rounded-[1.25rem] bg-white maxlength" multiple={false}
                 maxLength={10} />
        </div>
      </div>

      <div className="mb-2">
        <div className="text-xs text-sis-blue">装修公司：</div>
        <div className="relative mt-1">
          <input className="w-full text-sm leading-8 px-3 pr-10 rounded-[1.25rem] bg-white maxlength" multiple={false}
                 maxLength={10} value={"豐澤裝修工程公司"} />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <CheckCircle className="text-[#6EB806]" size={25} />
          </div>
        </div>
      </div>

      <div className="mb-2">
        <div className="text-xs text-sis-blue">装修工程總費用：</div>
        <div className="relative mt-1">
          <input className="w-full text-sm leading-8 px-3 pr-10 rounded-[1.25rem] bg-white maxlength" multiple={false}
                 maxLength={10} value={"HK$ 980,000"} />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <CheckCircle className="text-[#6EB806]" size={25} />
          </div>
        </div>
      </div>

      <div className="mb-2">
        <div className="inline-block text-xs text-sis-blue">是否牽涉棚架工程：</div>
        <ToggleSwitch />
      </div>

      <div className="mb-4">
        <div className="text-xs text-sis-blue">棚架工程費用：</div>
        <div className="relative mt-1">
          <input className="w-full text-sm leading-8 px-3 pr-10 rounded-[1.25rem] bg-white maxlength" multiple={false}
                 maxLength={10} value={"HK$ 15,000"} />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <CheckCircle className="text-[#6EB806]" size={25} />
          </div>
        </div>
      </div>

      <button
        className="w-full rounded-[1.25rem] bg-gradient-to-r from-sis-blue to-sis-blue-420 text-sm leading-8 text-white"
        onClick={() => setIsSubmit(!isSubmit)}
      >
        {isSubmit ? "已提交" : "提交"}
      </button>
    </div>
  )
    ;
}

function renderConfirmItem(data, onAction) {
  const [isClicked, setIsClicked] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  return (
    <div className="">
      <p className="text-[15px]">可能有以下疾病</p>
      {
        <ul className="text-sis-purple ml-2 mt-1 text-sm leading-[18px] list-disc list-inside">
          {data.diseases.map((item, index) => {
            return (<li key={index}>{item}</li>);
          })}
        </ul>
      }
      <p className="mt-2 text-[15px]">{data.recommendation}</p>
      <div className="mt-0.5 float-right">
        {
          isClicked ?
            <>
              <div
                className="flex justify-center items-center gap-1 rounded-[1.25rem] bg-[#DCE5FE] text-sm w-20 leading-8 text-sis-blue">
                { isConfirmed ? <CheckCircle className="text-sis-blue" size={17} /> : <XCircle className="text-sis-blue" size={17} />}
                { isConfirmed ? "已确认" : "已否认" }
              </div>
            </> :
            <>
              <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm w-12 leading-8 text-sis-blue"
                      onClick={() => {
                        setIsClicked(true);
                        setIsConfirmed(true);
                        onAction("我确认与前面所提到的病情一致");
                      }}>确认
              </button>
              <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm w-12 leading-8 text-sis-blue"
                      onClick={() => {
                        setIsClicked(true);
                        setIsConfirmed(false);
                        onAction("我否认与前面所提到的病情一致");
                      }}>否
              </button>
            </>
        }
      </div>

    </div>
  );
}

export default function ChatMessage({ isUser, content, timestamp, type = "text", pdfUrl, data, onAction }) {
  if (type === "hidden") {
    return <></>;
  }
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

    if (type === "confirm") {
      return renderConfirmItem(data, onAction);
    }

    if (type === "upload-file") {
      return (
        <div className="flex flex-col gap-3">
          <p className="text-gray-800">{content}</p>
          <UploadCard onUpload={(files) => onAction('upload-files', files)} />
        </div>
      );
    }

    return <p className="text-[15px]">{content}</p>;
  };

  return (
    <>
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
              : "bg-[#F0F1F9] shadow-md rounded-bl-none"
          }`}
        >
          {renderContent()}
        </div>
      </div>
      {type === "form" && renderFormItem(data)}
    </>
  );
}
