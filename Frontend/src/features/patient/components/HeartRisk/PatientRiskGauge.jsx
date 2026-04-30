import React from 'react';
import { LuTriangleAlert } from "react-icons/lu";

const PatientRiskGauge = ({ percentage = 84 }) => {
  const rotationAngle = (percentage / 100) * 180;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[200px] h-[100px]">
        <div className="absolute inset-0 rounded-t-full border-[16px] border-gray-100 dark:border-gray-800 border-b-0"></div>
        <div
          className="absolute inset-0 origin-bottom rounded-t-full border-[16px] border-[#E7000B] border-b-0 transition-transform duration-700"
          style={{ transform: `rotate(${rotationAngle}deg)` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[28px] font-extrabold text-black-main-text dark:text-[#E2E8F0]">{percentage}%</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LuTriangleAlert className="text-[#F0B100] text-xl" />
        <span className="text-[14px] font-bold text-[#F0B100]">High Risk</span>
      </div>
    </div>
  );
};

export default PatientRiskGauge;
