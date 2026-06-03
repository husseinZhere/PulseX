import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiStar, HiOutlineStar } from 'react-icons/hi2';
import { MdOutlineSchedule } from 'react-icons/md';

/**
 * PatientRatingModal
 *
 * Props:
 *  isOpen      – boolean
 *  onClose     – () => void   (X / Maybe Later)
 *  onSubmit    – (rating, feedback) => void
 *  doctor      – { name, specialty, img, appointmentDate }
 */
const PatientRatingModal = ({ isOpen, onClose, onSubmit, doctor }) => {
  const [rating,   setRating]   = useState(0);
  const [hovered,  setHovered]  = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [imgErr,   setImgErr]   = useState(false);

  const doctorName = doctor?.name        ?? '';
  const doctorImg  = doctor?.img         ?? '';
  const apptDate   = doctor?.appointmentDate ?? '';

  React.useEffect(() => { setImgErr(false); }, [doctorImg]);

  const handleSubmit = () => {
    if (!rating) return;
    setSubmitted(true);
    setTimeout(() => {
      onSubmit?.(rating, feedback);
      // reset for next use
      setRating(0);
      setHovered(0);
      setFeedback('');
      setSubmitted(false);
      onClose?.();
    }, 1400);
  };

  const handleClose = () => {
    setRating(0);
    setHovered(0);
    setFeedback('');
    setSubmitted(false);
    onClose?.();
  };

  const active = hovered || rating;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-white dark:bg-[#111827] rounded-[20px] sm:rounded-[24px] shadow-2xl w-full max-w-[92vw] sm:max-w-sm md:max-w-md p-4 sm:p-5 md:p-6 flex flex-col items-center gap-2.5 sm:gap-3 md:gap-4 relative"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 30,  scale: 0.96 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              aria-label="Close rating modal"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 transition-colors"
              onClick={handleClose}
            >
              <HiXMark className="text-sm sm:text-base" />
            </button>

            {/* Doctor avatar */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full ring-4 ring-[#EEF2FF] overflow-hidden shrink-0">
              {doctorImg && !imgErr ? (
                <img
                  src={doctorImg}
                  alt={doctorName}
                  className="w-full h-full object-cover"
                  onError={() => setImgErr(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#333CF5] to-[#9810fa] flex items-center justify-center text-white text-[22px] font-bold">
                  {(doctorName || 'D')[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="text-center">
              <h2 className="text-[15px] sm:text-[16px] md:text-[18px] font-bold text-black-main-text dark:text-[#E2E8F0]">How was your visit?</h2>
              <p className="text-[11px] sm:text-[12px] md:text-[13px] text-gray-500 mt-0.5">Rate your experience with {doctorName}</p>
            </div>

            {/* Appointment info pill */}
            <div className="flex items-center gap-2 sm:gap-3 bg-blue-50 dark:bg-[#1e1b4b]/40 border border-blue-100 dark:border-[#4338ca]/30 rounded-xl sm:rounded-[14px] px-3 sm:px-4 py-2 sm:py-2.5 w-full">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-main flex items-center justify-center shrink-0">
                <MdOutlineSchedule className="text-white text-sm sm:text-base" />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-400">Recent Appointment</p>
                <p className="text-[11px] sm:text-[12px] font-semibold text-black-main-text dark:text-[#E2E8F0]">{apptDate}</p>
              </div>
            </div>

            {/* Star rating */}
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 w-full">
              <p className="text-[11px] sm:text-[12px] font-semibold text-[#364153] dark:text-gray-300">Rate your experience</p>
              <div className="flex items-center gap-0.5 sm:gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
                    className="p-0.5 sm:p-1 transition-transform hover:scale-110"
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(n)}
                  >
                    {n <= active
                      ? <HiStar className="text-2xl sm:text-xl text-[#F0B100]" />
                      : <HiOutlineStar className="text-2xl sm:text-xl text-gray-300" />
                    }
                  </button>
                ))}
              </div>
              <p className="text-[11px] sm:text-[12px] text-gray-400 h-4">
                {!rating ? 'Select a rating' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </p>
            </div>

            {/* Feedback textarea */}
            <div className="flex flex-col gap-1 sm:gap-1.5 w-full">
              <label className="text-[11px] sm:text-[12px] font-semibold text-[#364153] dark:text-gray-300">
                Share your feedback <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                className="w-full bg-[#f9fafb] dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-[12px] sm:text-[13px] text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none resize-none focus:border-brand-main transition-colors"
                rows={3}
                placeholder={`Tell us about your experience with ${doctorName}...`}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500">Your feedback helps us improve our services</p>
            </div>

            {/* Submit */}
            <button
              className={`w-full rounded-xl py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-bold flex items-center justify-center gap-2 transition-colors ${
                submitted ? 'bg-green-500 text-white' :
                rating > 0 ? 'bg-brand-main hover:bg-[#2830d4] text-white' :
                'bg-gray-100 dark:bg-[#1E293B] text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }`}
              onClick={handleSubmit}
              disabled={!rating || submitted}
            >
              {submitted ? (
                <>
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Review Submitted!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                  Submit Review
                </>
              )}
            </button>

            {/* Maybe later */}
            <button
              className="text-[11px] sm:text-[13px] text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-colors pb-0.5"
              onClick={handleClose}
            >
              Maybe Later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PatientRatingModal;
