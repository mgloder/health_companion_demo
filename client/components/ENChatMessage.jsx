import { CheckCircle, XCircle } from "react-feather";
import Markdown from "react-markdown";

import marryProfile from "../assets/avatar/michael.svg";
import aia from "../assets/aia.png";
import bupa from "../assets/bupa.png";
import fwd from "../assets/fwd.png";
import insurance from "../assets/insurance.png";
import shield from "../assets/shield.png";
import greenCheck from "../assets/green-check.png";
import { useState } from "react";
import UploadCard from "./UploadCard";


const imgMap = {
  "AIA Group": aia,
  "Bupa": bupa,
  "FWD Group": fwd,
};

const mockInsurance = [{
  insuranceCompany: "AIA Group",
  insuranceProductName: "AIA Voluntary Health Insurance Flexi Scheme",
  advantages: [
    "Provides global coverage, including comprehensive health, life, and accident insurance.",
    "A strong claims network that enables customers to receive reimbursements quickly.",
  ],
}, {
  insuranceCompany: "Bupa",
  insuranceProductName: "Bupa MyFlexi VHIS Plan",
  advantages: [
    "Integrated healthcare services with global coverage and a direct billing network.",
    "Premium medical services with relaxed underwriting requirements and stable renewals.",
  ],
}, {
  insuranceCompany: "FWD Group",
  insuranceProductName: "vCare Medical Plan",
  advantages: [
    "Extensive coverage, offering comprehensive inpatient and outpatient benefits.",
    "Flexible insurance plans that can be customized based on individual needs.",
  ],
}];

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
      <p className="text-[15px] font-light leading-6">I have selected three company products for you to compare:</p>
      <div className="flex flex-col gap-2.5 mt-2.5 w-full pb-1">
        {
          data.map((item, index) => {
            return (
              <div key={index} className="px-3 py-1 bg-[#3660F91A] backdrop-blur-md rounded-2xl w-[277px]">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <img className="inline-block rounded-full mt-1" src={imgMap[item.insuranceCompany]} sizes={26}
                         height={26} width={26} />
                    <div className="mt-2">
                      <p className="text-xs font-light text-sis-purple-300">{item.insuranceCompany}</p>
                      <p className="text-sm font-bold text-sis-purple">{item.insuranceProductName}</p>
                    </div>
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

function renderConfirmItem(data, onAction) {
  const [isClicked, setIsClicked] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  return (
    <div>
      <p className="text-sm mb-2">{data.sympathy_message}</p>
      <b className="text-base text-sis-purple">{data.disease}</b>
      {
        <ul className="text-sis-purple ml-2 mt-1 text-sm leading-[18px] list-disc list-inside">
          <li>{data.description}</li>
          <li>Reference link: <a href={data.reference_link}>WebMD</a></li>
        </ul>
      }
      <p className="mt-2 text-[15px] leading-6">{data.recommendation}</p>
      <div className="mt-0.5 float-right">
        {
          isClicked ?
            <>
              <div
                className="flex justify-center items-center gap-1 rounded-[1.25rem] bg-[#DCE5FE] text-sm w-32 leading-8 text-sis-blue">
                {isConfirmed ? <CheckCircle className="text-sis-blue" size={17} /> :
                  <XCircle className="text-sis-blue" size={17} />}
                {isConfirmed ? "Acknowledge" : "Need more help?"}
              </div>
            </> :
            <>
              <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm w-28 leading-8 text-sis-blue"
                      onClick={() => {
                        setIsClicked(true);
                        setIsConfirmed(true);
                        onAction("I confirm that it matches the previously mentioned condition.");
                      }}>Acknowledge
              </button>
              <button className="rounded-[1.25rem] bg-[#DCE5FE] ml-1 text-sm w-32 leading-8 text-sis-blue"
                      onClick={() => {
                        setIsClicked(true);
                        setIsConfirmed(false);
                        onAction("I deny that it matches the previously mentioned condition.");
                      }}>Need more help?
              </button>
            </>
        }
      </div>

    </div>
  );
}

function renderConfirmUploadItem(content, onAction) {
  const [isClicked, setIsClicked] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  return (
    <div className="">
      <div>
        <Markdown components={{
          p(props) {
            const { node, ...rest } = props;
            return <p className="text-[15px] leading-6 inline" {...rest} />;
          },
          ol(props) {
            const { node, ...rest } = props;
            return <ol className="my-2 list-decimal list-inside" {...rest} />;
          },
          li(props) {
            const { node, ...rest } = props;
            return <li className="mb-1 text-sis-purple" {...rest} />;
          },
        }}>{content}</Markdown>
      </div>
      <div className="mt-0.5 float-right">
        {
          isClicked ?
            <>
              <div
                className="flex justify-center items-center gap-1 rounded-[1.25rem] bg-[#DCE5FE] text-sm w-28 leading-8 text-sis-blue">
                {isConfirmed ? <CheckCircle className="text-sis-blue" size={17} /> :
                  <XCircle className="text-sis-blue" size={17} />}
                {isConfirmed ? "Uploaded" : "Canceled"}
              </div>
            </> :
            <>
              <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm w-16 leading-8 text-sis-blue"
                      onClick={() => {
                        setIsClicked(true);
                        setIsConfirmed(true);
                        onAction("I have uploaded the relevant health insurance documents.");
                      }}>Upload
              </button>
              <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm ml-1 w-16 leading-8 text-sis-blue"
                      onClick={() => {
                        setIsClicked(true);
                        setIsConfirmed(false);
                        onAction("I have canceled the upload of the relevant health insurance documents.");
                      }}>Cancel
              </button>
            </>
        }
      </div>

    </div>
  );
}

function renderConfirmInsurance(data, onAction) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  return (
    <div>
      <p
        className="text-sm mb-2">{`Your insurance is provided by Bupa (Asia) Limited, with contract number ${data.insurance_contract_number}. The coverage period is from ${data.coverage_start_date} to ${data.coverage_end_date}.`}</p>
      <p className="text-[15px] leading-6 mb-2">Here is the information I found based on your health insurance policy.</p>
      {
        <ul className="text-sis-purple ml-2 mt-1 leading-[18px] list-disc list-inside">
          {data.summaries.map((item, index) => {
            return (
              <li key={index} className="mb-1">
                <b>{item.disease}</b>
                <br />
                <p className="mt-1 ml-4 text-sm text-black">{item.summary}</p>
              </li>
            );
          })}
        </ul>
      }
      <div className="mt-0.5 float-right">
        {
          <>
            <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm w-44 leading-8 text-sis-blue"
                    onClick={() => {
                      setIsConfirmed(true);
                      !isConfirmed && onAction("I’d like to ask for more information.");
                    }}>
              {isConfirmed && <CheckCircle className="inline-block text-sis-blue mr-1" size={17} />}
              Ask for more details
            </button>
          </>
        }
      </div>

    </div>
  );
}

function renderConfirmDoctor(content, onAction) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  return (
    <div className="">
      <Markdown components={{
        p(props) {
          const { node, ...rest } = props;
          return <p className="text-[15px] leading-6 inline" {...rest} />;
        },
        ol(props) {
          const { node, ...rest } = props;
          return <ol className="my-2 list-decimal list-inside" {...rest} />;
        },
        li(props) {
          const { node, ...rest } = props;
          return <li className="mb-1 text-sis-purple text-sm" {...rest} />;
        },
      }}>{content}</Markdown>
      <div className="mt-2 float-right">
        {
          <>
            <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm w-64 leading-8 text-sis-blue"
                    onClick={() => {
                      setIsConfirmed(true);
                      !isConfirmed && onAction("I’d like to get a doctor recommendation. ");
                    }}>
              {isConfirmed && <CheckCircle className="inline-block text-sis-blue mr-1" size={17} />}
              Get a doctor recommendation
            </button>
          </>
        }
      </div>

    </div>
  );
}

function renderRecommendDoctor(data, onAction) {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  return (
    <div className="">
      <p className="text-[15px] leading-6 mb-1">Here are some doctor recommendations for you: </p>
      {
        <ul className="text-sis-purple ml-2 mt-1 text-sm leading-[18px] list-disc list-inside">
          {data.doctors.map((item, index) => {
            return (<li className="mb-1" key={index}>
              <b className="text-base">{item.doctor}</b>
              <img className="inline-block ml-1 mb-0.5" src={item.coverage ? insurance : shield} alt="coverage"
                   width={18} height={18} />
              <br />
              <p className="mt-1 ml-4 text-xs text-black">Specialty: {item.specialty}</p>
              <p className="mt-1 ml-4 text-xs text-black">Address: {item.address}</p>
              <p className="mt-1 ml-4 text-xs text-black">Opening Hours: {item.opening_hours}</p>
              <p className="mt-1 ml-4 text-xs text-black">Experience: {item.experience}</p>
              <p className="mt-1 ml-4 text-xs text-black">Review: {item.summary}</p>
              <div className="flex flex-col mt-1">
                {selectedDoctor === item.doctor ? (
                  <div
                    className="flex justify-center items-center gap-1 rounded-[1.25rem] bg-[#DCE5FE] text-sm w-28 leading-6 text-sis-blue self-end">
                    <CheckCircle className="text-sis-blue" size={17} />
                    Scheduled
                  </div>
                ) : !selectedDoctor && (
                  <button
                    className="rounded-[1.25rem] self-end bg-[#DCE5FE] text-sm w-28 leading-6 text-sis-blue"
                    onClick={() => {
                      setSelectedDoctor(item.doctor);
                      // onAction(`我想要预约${item.doctor}`);
                    }}
                  >
                    Appointment
                  </button>
                )}
              </div>
            </li>);
          })}
        </ul>
      }
    </div>
  );
}

function renderRecommendInsurance(data, onAction) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  if (!data) {
    return;
  }

  return (
    <div className={`flex justify-start mb-4`}>
      <img
        src={marryProfile}
        alt="Advisor"
        className="w-8 h-8 rounded-full mr-2 self-end"
      />
      <div
        className={`max-w-[75%] rounded-2xl p-3 bg-[#F0F1F9] shadow-md rounded-bl-none text-[15px] leading-6`}
      >
        {`${data.doctor_name} This provider is currently out of your insurance network. To ensure better coverage for your medical needs, I can introduce you to insurance plans with broader coverage, giving you more options for future medical visits.`}
        <div className="mt-2 float-right">
          {
            <>
              <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm w-60 leading-8 text-sis-blue"
                      onClick={() => {
                        setIsConfirmed(true);
                        !isConfirmed && onAction("Can you recommend an insurance plan for me? No need to collect any preferences or other information.");
                      }}>
                {isConfirmed && <CheckCircle className="inline-block text-sis-blue mr-1" size={17} />}
                Recommend an insurance plan
              </button>
            </>
          }
        </div>
      </div>
    </div>
  );
}

function renderRecommendInsuranceClient(content, onAction) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  return (
    <div>
      <p className="text-[15px] leading-6 mb-1">{content}</p>
      <div className="mt-2 float-right">
        {
          <>
            <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm w-60 leading-8 text-sis-blue"
                    onClick={() => {
                      setIsConfirmed(true);
                      !isConfirmed && onAction("Can you recommend an insurance plan for me? No need to collect any preferences or other information.");
                    }}>
              {isConfirmed && <CheckCircle className="inline-block text-sis-blue mr-1" size={17} />}
              Recommend an insurance plan
            </button>
          </>
        }
      </div>
    </div>
  );
}

function renderPurchaseInsurance(content, onAction) {
  const [isClicked, setIsClicked] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  return (
    <div className="">
      <Markdown components={{
        p(props) {
          const { node, ...rest } = props;
          return <p className="text-[15px] leading-6 inline" {...rest} />;
        },
        ul(props) {
          const { node, ...rest } = props;
          return <ul className="my-2 list-disc list-inside" {...rest} />;
        },
        li(props) {
          const { node, ...rest } = props;
          return <li className="mb-1 text-sis-purple text-sm" {...rest} />;
        },
      }}>{content}</Markdown>
      <div className="mt-0.5 float-right">
        {
          isClicked ?
            <>
              <div
                className="flex justify-center items-center gap-1 rounded-[1.25rem] bg-[#DCE5FE] text-sm w-20 leading-8 text-sis-blue">
                <CheckCircle className="text-sis-blue" size={17} />
                {isConfirmed ? "Online" : "Offline"}
              </div>
            </> :
            <>
              <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm w-16 leading-8 text-sis-blue"
                      onClick={() => {
                        setIsClicked(true);
                        setIsConfirmed(true);
                        onAction("purchase_online");
                      }}>Online
              </button>
              <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm ml-1 w-16 leading-8 text-sis-blue"
                      onClick={() => {
                        setIsClicked(true);
                        setIsConfirmed(false);
                      }}>Offline
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

  if (type === "purchase_success") {
    return (
      <>
        <div className="mt-8 w-80 rounded-3xl bg-lime-400 m-auto">
          <div className="py-4 mr-2">
            <div className="ml-4 mb-2">
              <div className="inline-block w-6 h-6 rounded-full bg-black">
                <img className="mt-0.5 ml-1" src={greenCheck} sizes={26} height={26} width={26} />
              </div>
              <span className="ml-2 text-base font-bold">Congratulations!</span>
            </div>
            <p className="ml-12 text-sm font-light">Your policy has been approved! You may review your policy in “Account” any time.</p>
          </div>
        </div>
      </>);
  }

  const renderContent = () => {
    if (type === "pdf") {
      return renderPdfItem(pdfUrl, content);
    }
    if (type === "need_recommend_insurance") {
      return renderRecommendationItem(mockInsurance);
    }
    if (type === "form") {
      return (<div><p>OK!請麻烦填寫资料👇</p></div>);
    }

    if (type === "confirm_possible_disease") {
      return renderConfirmItem(data, onAction);
    }

    if (type === "confirm_insurance_upload") {
      return renderConfirmUploadItem(content, onAction);
    }

    if (type === "confirm_insurance") {
      return renderConfirmInsurance(data, onAction);
    }

    if (type === "confirm_doctor") {
      return renderConfirmDoctor(content, onAction);
    }

    if (type === "recommend_doctor") {
      return renderRecommendDoctor(data, onAction);
    }

    if (type === "purchase_insurance") {
      return renderPurchaseInsurance(content, onAction);
    }

    if (type === "recommend_insurance_client") {
      return renderRecommendInsuranceClient(content, onAction);
    }

    if (type === "upload-file") {
      return (
        <div className="flex flex-col gap-3">
          <p className="text-gray-800">{content}</p>
          <UploadCard onUpload={(files) => onAction("upload-files", files)} />
        </div>
      );
    }

    return <Markdown components={{
      p(props) {
        const { node, ...rest } = props;
        return <p className="text-[15px] leading-6 inline" {...rest} />;
      },
      ul(props) {
        const { node, ...rest } = props;
        return <ul className="my-2 list-decimal list-inside" {...rest} />;
      },
      li(props) {
        const { node, ...rest } = props;
        return <li className="mb-1 text-sis-purple text-sm" {...rest} />;
      },
    }}>{content}</Markdown>;
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
      {type === "recommend_insurance" && renderRecommendInsurance(data, onAction)}
    </>
  );
}
