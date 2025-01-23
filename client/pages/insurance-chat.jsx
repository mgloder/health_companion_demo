import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "react-feather";
import FooterInput from "../components/FooterInput.jsx";

export default function InsuranceChat() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center p-4 border-b">
        <Link to="/" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Insurance Advisor</h1>
          <p className="text-gray-600 text-sm">
            Ask me anything about tax-deductible insurance options
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Chat history will go here */}
      </div>

      <FooterInput />
    </div>
  );
} 