import React from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineXCircle } from "react-icons/hi2";
import { useNavigate } from 'react-router-dom';

const PatientCriticalAlert = () => {
  const navigate = useNavigate();

  return (
    <div className="w-16 bg-white dark:bg-[#111827] rounded-[22px] border border-red-100 shadow-sm p-6 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <HiOutlineXCircle className="text-[#E7000B] text-4xl" />
      </div>
      <h2 className="text-[16px] font-bold text-black-main-text dark:text-[#E2E8F0]">Critical Alert: Medical Consultation Recommended</h2>
      <p className="text-[13px] text-gray-500 leading-relaxed max-w-md">
        Based on our AI analysis of your uploaded X-rays, we have detected indicators that require immediate medical attention. Your health is our priority; we have curated a list of top cardiologists available on PulseX to help you right now.
      </p>
      <button
        className="bg-[#E7000B] hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors text-[13px]"
        onClick={() => navigate('/patient/doctors')}
      >
        Find Doctors <HiOutlineMagnifyingGlass className="text-lg" />
      </button>
    </div>
  );
};

export default PatientCriticalAlert;
