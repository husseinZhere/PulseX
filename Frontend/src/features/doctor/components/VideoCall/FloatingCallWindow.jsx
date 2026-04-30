import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineArrowsPointingOut, HiOutlineMicrophone, HiOutlineSpeakerWave } from 'react-icons/hi2';
import { MdCallEnd, MdClose, MdMicOff, MdVolumeOff } from 'react-icons/md';

const FloatingCallWindow = ({
  doctor,
  duration,
  isMuted,
  onToggleMute,
  isSpeakerOn,
  onToggleSpeaker,
  onExpand,
  onEndCall,
}) => {
  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 300, top: 0, bottom: 500 }}
      className="fixed bottom-6 right-6 z-[70] w-80 cursor-move overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#111827]"
    >
      <div className="relative aspect-video bg-gray-900">
        <img src={doctor?.img} className="h-full w-full object-cover opacity-80" alt={doctor?.name || 'Participant'} />
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-lg bg-red-500 px-2 py-1 text-[11px] font-bold text-white">
          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
          {duration}
        </div>
        <button
          onClick={onEndCall}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 text-white"
        >
          <MdClose size={18} />
        </button>
        <div className="absolute bottom-3 left-3">
          <h4 className="text-[12px] font-bold text-white">{doctor?.name || 'Participant'}</h4>
          <p className="text-[10px] text-white/70">Consultation in progress</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 p-4">
        <div className="flex gap-2">
          <button
            onClick={onToggleMute}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
              isMuted ? 'border-red-500 bg-red-500 text-white' : 'border-gray-100 bg-gray-50 text-gray-600 hover:bg-blue-50'
            }`}
          >
            {isMuted ? <MdMicOff size={18} /> : <HiOutlineMicrophone size={18} />}
          </button>
          <button
            onClick={onToggleSpeaker}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
              isSpeakerOn ? 'border-gray-100 bg-gray-50 text-gray-600 hover:bg-blue-50' : 'border-red-500 bg-red-500 text-white'
            }`}
          >
            {isSpeakerOn ? <HiOutlineSpeakerWave size={18} /> : <MdVolumeOff size={18} />}
          </button>
        </div>

        <button
          onClick={onExpand}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100 transition-colors hover:bg-blue-700"
        >
          <HiOutlineArrowsPointingOut size={18} />
        </button>

        <button
          onClick={onEndCall}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white shadow-lg shadow-red-100 transition-colors hover:bg-red-600"
        >
          <MdCallEnd size={20} />
        </button>
      </div>

      <div className="flex justify-center px-4 pb-3">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600">
          <div className="flex gap-0.5">
            <div className="h-2 w-0.5 rounded-full bg-green-500" />
            <div className="h-2 w-0.5 rounded-full bg-green-500" />
          </div>
          Stable
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingCallWindow;
