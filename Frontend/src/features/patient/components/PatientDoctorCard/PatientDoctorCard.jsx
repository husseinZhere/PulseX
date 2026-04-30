import React from 'react';
import { HiOutlineLocationMarker, HiStar } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';

const PatientDoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-[#111827] rounded-[20px] border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col items-center gap-3 hover:shadow-md transition-shadow">
      <img src={doctor.img} alt={doctor.name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 dark:border-gray-800" />
      <h3 className="text-[14px] font-bold text-black-main-text dark:text-[#E2E8F0] text-center">{doctor.name}</h3>
      <div className="flex items-center gap-1 text-[12px] text-gray-500">
        <HiOutlineLocationMarker className="shrink-0" /> {doctor.loc}
      </div>
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <HiStar key={i} className={i < doctor.rate ? "text-yellow-400" : "text-gray-200"} />
        ))}
        <span className="text-[11px] text-gray-400 ml-1.5">({doctor.reviews} reviews)</span>
      </div>
      <div className="text-[13px] text-gray-500">
        <span className="font-bold text-[16px] text-black-main-text dark:text-[#E2E8F0]">${doctor.price}</span> / session
      </div>
      <button
        className="w-full bg-brand-main hover:bg-blue-700 text-white text-[13px] font-bold py-2.5 rounded-xl transition-colors"
        onClick={() => navigate(`/patient/doctor-profile/${doctor.id}`)}
      >
        Book Now
      </button>
    </div>
  );
};

export default PatientDoctorCard;
