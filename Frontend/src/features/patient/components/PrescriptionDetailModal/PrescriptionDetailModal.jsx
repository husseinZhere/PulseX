import React, { useState, useRef } from 'react';
import { 
  HiOutlineXMark, HiOutlineArrowUpTray, HiOutlineExclamationTriangle, 
  HiOutlineCalendar, HiOutlineUser, HiOutlineBeaker 
} from "react-icons/hi2";
import { TbStethoscope, TbCapsule, TbClipboardText } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";

const PrescriptionDetailModal = ({ data, onClose }) => {
  const [uploads, setUploads] = useState({});
  const fileInputRefs = useRef({});

  // استخراج اسم المستخدم من بياناتك المسجلة
  const patientName = "Nouran Omar Hammad"; 

  if (!data) return null;

  const handleFileUpload = (e, testId) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setUploads(prev => ({ ...prev, [testId]: previewUrl }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }} animate={{ y: 0 }}
        className="bg-white dark:bg-[#111827] rounded-[24px] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Blue Header ── */}
        <div className="relative p-6 text-white" style={{ background: 'linear-gradient(135deg, #333CF5 0%, #155dfc 100%)' }}>
          <button
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white dark:bg-[#111827]/30 flex items-center justify-center transition-colors"
            onClick={onClose}
          >
            <HiOutlineXMark className="text-white text-lg" />
          </button>
          <div className="flex flex-wrap gap-6">
            {/* Doctor */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#111827]/20 flex items-center justify-center shrink-0">
                <TbStethoscope className="text-white text-lg" />
              </div>
              <div>
                <span className="text-[11px] text-white/70 uppercase tracking-wide">Prescribed by</span>
                <h4 className="text-[14px] font-bold mt-0.5">{data.doc}</h4>
                <p className="text-[12px] text-white/70">{data.spec}</p>
              </div>
            </div>
            {/* Patient */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#111827]/20 flex items-center justify-center shrink-0">
                <HiOutlineUser className="text-white text-lg" />
              </div>
              <div>
                <span className="text-[11px] text-white/70 uppercase tracking-wide">Patient</span>
                <h4 className="text-[14px] font-bold mt-0.5">{patientName}</h4>
                <p className="text-[12px] text-white/70">ID: PX-2024-7891</p>
              </div>
            </div>
            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#111827]/20 flex items-center justify-center shrink-0">
                <HiOutlineCalendar className="text-white text-lg" />
              </div>
              <div>
                <span className="text-[11px] text-white/70 uppercase tracking-wide">Date Issued</span>
                <h4 className="text-[14px] font-bold mt-0.5">{data.date}</h4>
                <p className="text-[12px] text-white/70">2:30 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-6">

          {/* Medications */}
          <section>
            <div className="flex items-center gap-2 text-[13px] font-bold text-purple-700 bg-purple-50 rounded-xl px-4 py-2.5 mb-4">
              <TbCapsule className="text-[16px]" /> <span>Prescribed Medications</span>
            </div>
            <div className="flex flex-col gap-3">
              {data.medications.map((med, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-[14px] border border-gray-100 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-[13px] font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h5 className="text-[13px] font-bold text-black-main-text dark:text-[#E2E8F0]">{med.name}</h5>
                    <p className="text-[12px] text-gray-500 mt-0.5">Dosage: {med.dose}</p>
                    <div className="flex gap-4 mt-2">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Frequency</span>
                        <strong className="block text-[12px] text-black-main-text dark:text-[#E2E8F0]">{med.freq}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Duration</span>
                        <strong className="block text-[12px] text-black-main-text dark:text-[#E2E8F0]">{med.dur}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Amber alert */}
            <div className="flex items-start gap-3 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <HiOutlineExclamationTriangle className="text-amber-500 text-[18px] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[12px] font-bold text-amber-800">Important Instructions</strong>
                <p className="text-[12px] text-amber-700 mt-0.5">Take all medications as prescribed. Do not stop without consulting your doctor.</p>
              </div>
            </div>
          </section>

          {/* Lab & Radiology */}
          <section>
            <div className="flex items-center gap-2 text-[13px] font-bold text-green-700 bg-green-50 rounded-xl px-4 py-2.5 mb-4">
              <HiOutlineBeaker className="text-[16px]" /> <span>Lab & Radiology Requests</span>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { id: 't1', name: 'Complete Blood Count (CBC)', note: 'Fasting required - 8-12 hours' },
                { id: 't2', name: 'Lipid Profile', note: 'Fasting required' },
                { id: 't3', name: 'Chest X-Ray', note: '' }
              ].map((test, i) => (
                <div key={test.id} className="rounded-[14px] border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="flex items-center gap-4 p-4 bg-gray-50">
                    <div className="w-7 h-7 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-[12px] font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h6 className="text-[13px] font-semibold text-black-main-text dark:text-[#E2E8F0]">{test.name}</h6>
                      {test.note && <p className="text-[11px] text-gray-500 mt-0.5"><strong>Note:</strong> {test.note}</p>}
                    </div>
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-main hover:bg-[#2830d4] text-white text-[12px] font-semibold transition-colors shrink-0"
                      onClick={() => fileInputRefs.current[test.id].click()}
                    >
                      <HiOutlineArrowUpTray className="text-[14px]" /> Upload Result
                    </button>
                    <input
                      type="file" hidden accept="image/*"
                      ref={el => fileInputRefs.current[test.id] = el}
                      onChange={(e) => handleFileUpload(e, test.id)}
                    />
                  </div>
                  <AnimatePresence>
                    {uploads[test.id] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3"
                      >
                        <img src={uploads[test.id]} alt="Result Preview" className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                          <span className="text-[11px] font-semibold text-green-700">✓ File attached successfully</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>

          {/* Clinical Notes */}
          <section>
            <div className="flex items-center gap-2 text-[13px] font-bold text-orange-700 bg-orange-50 rounded-xl px-4 py-2.5 mb-4">
              <TbClipboardText className="text-[16px]" /> <span>Clinical Notes & Instructions</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-[14px] border border-gray-100 dark:border-gray-800">
              <p className="text-[13px] text-black-main-text dark:text-[#E2E8F0] leading-relaxed">
                Patient presents with mild upper respiratory infection. Continue current medications as prescribed. Ensure adequate rest and hydration.
              </p>
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PrescriptionDetailModal;