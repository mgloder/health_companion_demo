import { CheckCircle, XCircle } from "react-feather";
import Markdown from "react-markdown";

import ToggleSwitch from "./ToggleSwitch.jsx";

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
  "友邦": aia,
  "保柏": bupa,
  "富卫": fwd,
};

const mockInsurance = [{
  insuranceCompany: "友邦",
  insuranceProductName: "AIA Voluntary Health Insurance Flexi Scheme",
  advantages: [
    "提供全球保障，覆盖广泛的健康、寿险和意外险",
    "强大的理赔网络，客户能够快速获得赔付",
  ],
}, {
  insuranceCompany: "保柏",
  insuranceProductName: "Bupa MyFlexi VHIS Plan",
  advantages: [
    "整合式医疗保健服务，全球覆盖与直付网络",
    "高端医疗服务，投保限制宽松，续保稳定",
  ],
}, {
  insuranceCompany: "富卫",
  insuranceProductName: "vCare Medical Plan",
  advantages: [
    "覆盖广泛，提供全面的住院和门诊保障",
    "灵活的保障计划，可根据个人需求定制。",
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
      <p className="text-[15px] font-light leading-6">我为你挑了三家公司产品以供对比：</p>
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
                  {/*<div className="text-sis-purple">*/}
                  {/*  {item.insuranceDiscountPrice && (*/}
                  {/*    <s className="mr-1 opacity-45 text-[10px] leading-5">官铜：HK${item.insuranceDiscountPrice}</s>)*/}
                  {/*  }*/}
                  {/*  <span className="text-[10px] leading-5">HK$</span>*/}
                  {/*  <span className="text-sm">1500</span>*/}
                  {/*</div>*/}
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
    <div>
      <p className="text-sm mb-2">{data.sympathy_message}</p>
      <b className="text-base text-sis-purple">{data.disease}</b>
      {
        <ul className="text-sis-purple ml-2 mt-1 text-sm leading-[18px] list-disc list-inside">
          <li>{data.description}</li>
          <li>参考链接：<a href={data.reference_link}>WebMD</a></li>
        </ul>
      }
      <p className="mt-2 text-[15px] leading-6">{data.recommendation}</p>
      <div className="mt-0.5 float-right">
        {
          isClicked ?
            <>
              <div
                className="flex justify-center items-center gap-1 rounded-[1.25rem] bg-[#DCE5FE] text-sm w-20 leading-8 text-sis-blue">
                {isConfirmed ? <CheckCircle className="text-sis-blue" size={17} /> :
                  <XCircle className="text-sis-blue" size={17} />}
                {isConfirmed ? "明白" : "还有疑问 ?"}
              </div>
            </> :
            <>
              <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm w-12 leading-8 text-sis-blue"
                      onClick={() => {
                        setIsClicked(true);
                        setIsConfirmed(true);
                        onAction("我确认与前面所提到的病情一致");
                      }}>明白
              </button>
              <button className="rounded-[1.25rem] bg-[#DCE5FE] ml-1 text-sm w-20 leading-8 text-sis-blue"
                      onClick={() => {
                        setIsClicked(true);
                        setIsConfirmed(false);
                        onAction("我否认与前面所提到的病情一致");
                      }}> 还有疑问 ?
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
                className="flex justify-center items-center gap-1 rounded-[1.25rem] bg-[#DCE5FE] text-sm w-20 leading-8 text-sis-blue">
                {isConfirmed ? <CheckCircle className="text-sis-blue" size={17} /> :
                  <XCircle className="text-sis-blue" size={17} />}
                {isConfirmed ? "已上传" : "已取消"}
              </div>
            </> :
            <>
              <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm w-12 leading-8 text-sis-blue"
                      onClick={() => {
                        setIsClicked(true);
                        setIsConfirmed(true);
                        onAction("我已上传相关的医疗保险文档");
                      }}>上传
              </button>
              <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm ml-1 w-12 leading-8 text-sis-blue"
                      onClick={() => {
                        setIsClicked(true);
                        setIsConfirmed(false);
                        onAction("我已取消上传相关的医疗保险文档");
                      }}>取消
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
        className="text-sm mb-2">{`您购买的保险来自 保柏（亚洲）有限公司，合同编号为 ${data.insurance_contract_number}，保障期为 ${data.coverage_start_date} 至 ${data.coverage_end_date}。`}</p>
      <p className="text-[15px] leading-6 mb-2">这是我根据医疗保单查找的信息</p>
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
            <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm w-36 leading-8 text-sis-blue"
                    onClick={() => {
                      setIsConfirmed(true);
                      !isConfirmed && onAction("我想要询问更多相关信息");
                    }}>
              {isConfirmed && <CheckCircle className="inline-block text-sis-blue mr-1" size={17} />}
              询问更多相关信息
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
            <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm w-24 leading-8 text-sis-blue"
                    onClick={() => {
                      setIsConfirmed(true);
                      !isConfirmed && onAction("我想要推荐医生");
                    }}>
              {isConfirmed && <CheckCircle className="inline-block text-sis-blue mr-1" size={17} />}
              推荐医生
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
      <p className="text-[15px] leading-6 mb-1">这边帮您推荐了一下医生：</p>
      {
        <ul className="text-sis-purple ml-2 mt-1 text-sm leading-[18px] list-disc list-inside">
          {data.doctors.map((item, index) => {
            return (<li className="mb-1" key={index}>
              <b className="text-base">{item.doctor}</b>
              <img className="inline-block ml-1 mb-0.5" src={item.coverage ? insurance : shield} alt="coverage"
                   width={18} height={18} />
              <br />
              <p className="mt-1 ml-4 text-xs text-black">科室：{item.specialty}</p>
              <p className="mt-1 ml-4 text-xs text-black">地址：{item.address}</p>
              <p className="mt-1 ml-4 text-xs text-black">工作时间：{item.opening_hours}</p>
              <p className="mt-1 ml-4 text-xs text-black">工作经验：{item.experience}</p>
              <p className="mt-1 ml-4 text-xs text-black">评价：{item.summary}</p>
              <div className="flex flex-col mt-1">
                {selectedDoctor === item.doctor ? (
                  <div
                    className="flex justify-center items-center gap-1 rounded-[1.25rem] bg-[#DCE5FE] text-sm w-20 leading-6 text-sis-blue self-end">
                    <CheckCircle className="text-sis-blue" size={17} />
                    已预约
                  </div>
                ) : !selectedDoctor && (
                  <button
                    className="rounded-[1.25rem] self-end bg-[#DCE5FE] text-sm w-14 leading-6 text-sis-blue"
                    onClick={() => {
                      setSelectedDoctor(item.doctor);
                      // onAction(`我想要预约${item.doctor}`);
                    }}
                  >
                    预约
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
        {`${data.doctor_name} 目前不在您的保险网络内。为了更好地保障您的就医选择，我可以为您介绍一些覆盖更广的保险方案，这样您未来就诊时会有更多选择。`}
        <div className="mt-2 float-right">
          {
            <>
              <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm w-24 leading-8 text-sis-blue"
                      onClick={() => {
                        setIsConfirmed(true);
                        !isConfirmed && onAction("你能推荐下适合我的保险么？不需要收集任何偏好和其他信息");
                      }}>
                {isConfirmed && <CheckCircle className="inline-block text-sis-blue mr-1" size={17} />}
                推荐保险
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
            <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm w-24 leading-8 text-sis-blue"
                    onClick={() => {
                      setIsConfirmed(true);
                      !isConfirmed && onAction("你能推荐下适合我的保险么？不需要收集任何偏好和其他信息");
                    }}>
              {isConfirmed && <CheckCircle className="inline-block text-sis-blue mr-1" size={17} />}
              推荐保险
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
      <p className="text-[15px] leading-6">{content}</p>
      <div className="mt-0.5 float-right">
        {
          isClicked ?
            <>
              <div
                className="flex justify-center items-center gap-1 rounded-[1.25rem] bg-[#DCE5FE] text-sm w-20 leading-8 text-sis-blue">
                <CheckCircle className="text-sis-blue" size={17} />
                {isConfirmed ? "线上" : "线下"}
              </div>
            </> :
            <>
              <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm w-12 leading-8 text-sis-blue"
                      onClick={() => {
                        setIsClicked(true);
                        setIsConfirmed(true);
                        onAction("purchase_online");
                      }}>线上
              </button>
              <button className="rounded-[1.25rem] bg-[#DCE5FE] text-sm ml-1 w-12 leading-8 text-sis-blue"
                      onClick={() => {
                        setIsClicked(true);
                        setIsConfirmed(false);
                      }}>线下
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
          <div className="py-4 mr-4">
            <div className="ml-4 mb-2">
              <div className="inline-block w-6 h-6 rounded-full bg-black">
                <img className="mt-0.5 ml-1" src={greenCheck} sizes={26} height={26} width={26} />
              </div>
              <span className="ml-2 text-base font-bold">恭喜你！</span>
            </div>
            <p className="ml-12 text-sm font-light">您的健康保险保单已成功申请！您可以在账户页面查看保单详情。</p>
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
      {type === "form" && renderFormItem(data)}
      {type === "recommend_insurance" && renderRecommendInsurance(data, onAction)}
    </>
  );
}
