import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineArrowsPointingOut, HiOutlineMicrophone, HiOutlineSpeakerWave } from 'react-icons/hi2';
import { MdCallEnd, MdClose, MdMicOff, MdVolumeOff } from 'react-icons/md';

const FloatingCallWindow = ({ doctor, duration, isMuted, onToggleMute, isSpeakerOn, onToggleSpeaker, onExpand, onEndCall }) => {
  return (
    <motion.div 
      drag
      dragConstraints={{ left: 0, right: 300, top: 0, bottom: 500 }}
      className="fixed bottom-6 right-6 z-70 w-80 bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-blue-100 overflow-hidden cursor-move font-['Inter']"
    >
      <div className="relative aspect-video bg-gray-900">
        <img src={doctor.img} className="w-full h-full object-cover opacity-80" alt="" />
        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-white dark:bg-[#111827] rounded-full animate-ping" /> {duration}
        </div>
        <button 
           onClick={onEndCall}
           className="absolute top-3 right-3 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center"
        >
          <MdClose size={18} />
        </button>
        <div className="absolute bottom-3 left-3">
            <h4 className="text-white text-[12px] font-bold">{doctor.name}</h4>
            <p className="text-white/70 text-[10px]">Cardiology Consultation</p>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={onToggleMute}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${isMuted ? 'bg-red-500 text-white border-red-500' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-blue-50'}`}
          >
            {isMuted ? <MdMicOff size={18} /> : <HiOutlineMicrophone size={18} />}
          </button>
          <button
            onClick={onToggleSpeaker}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${isSpeakerOn ? 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-blue-50' : 'bg-red-500 text-white border-red-500'}`}
          >
            {isSpeakerOn ? <HiOutlineSpeakerWave size={18} /> : <MdVolumeOff size={18} />}
          </button>
        </div>
        
        <button 
          onClick={onExpand}
          className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
        >
          <HiOutlineArrowsPointingOut size={18} />
        </button>

        <button 
          onClick={onEndCall}
          className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-100 hover:bg-red-600 transition-all"
        >
          <MdCallEnd size={20} />
        </button>
      </div>
      
      <div className="px-4 pb-3 flex justify-center">
        <div className="flex items-center gap-1.5 text-green-600 text-[10px] font-bold">
           <div className="flex gap-0.5"><div className="w-0.5 h-2 bg-green-500 rounded-full" /><div className="w-0.5 h-2 bg-green-500 rounded-full" /></div>
           Excellent
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingCallWindow;