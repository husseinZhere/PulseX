import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiStar, HiOutlineStar } from 'react-icons/hi2';

const DoctorRatingModal = ({ isOpen, onClose, onSubmit, patient }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const patientName = patient?.name ?? 'Patient';
  const patientImg =
    patient?.img ??
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80';

  const handleSubmit = () => {
    if (!rating) return;
    setSubmitted(true);
    setTimeout(() => {
      onSubmit?.(rating, feedback);
      setRating(0);
      setHovered(0);
      setFeedback('');
      setSubmitted(false);
      onClose?.();
    }, 1200);
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
          className="cursor-pointer fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={handleClose}
        >
          <motion.div
            className="cursor-pointer bg-white dark:bg-[#111827] rounded-[20px] sm:rounded-[24px] shadow-2xl dark:shadow-none w-full max-w-[92vw] sm:max-w-sm md:max-w-md p-4 sm:p-5 md:p-6 flex flex-col items-center gap-3 relative"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Close rating modal"
              className="cursor-pointer absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              onClick={handleClose}
            >
              <HiXMark className="text-sm sm:text-base" />
            </button>

            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full ring-4 ring-[#EEF2FF] overflow-hidden shrink-0">
              <img
                src={patientImg}
                alt={patientName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center">
              <h2 className="text-[15px] sm:text-[16px] md:text-[18px] font-bold text-black-main-text dark:text-[#E2E8F0]">
                Rate Patient Communication
              </h2>
              <p className="text-[11px] sm:text-[12px] md:text-[13px] text-gray-500 mt-0.5">
                Share your consultation feedback for {patientName}
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    aria-label={`Rate ${n} stars`}
                    className="cursor-pointer p-1 transition-transform hover:scale-110"
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(n)}
                  >
                    {n <= active ? (
                      <HiStar className="text-3xl text-[#F0B100]" />
                    ) : (
                      <HiOutlineStar className="text-3xl text-gray-300" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[12px] text-gray-400 h-4">
                {!rating ? 'Select rating' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </p>
            </div>

            <textarea
              className="w-full bg-[#f9fafb] dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-[13px] text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 outline-none text-[#111827] dark:text-gray-100 resize-none focus:border-brand-main transition-colors"
              rows={3}
              placeholder="Add optional medical communication notes..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            <button
              className={`cursor-pointer w-full rounded-xl py-3 text-[13px] font-bold flex items-center justify-center gap-2 transition-colors ${
                submitted
                  ? 'bg-green-500 text-white'
                  : rating > 0
                  ? 'bg-brand-main hover:bg-[#2830d4] text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              onClick={handleSubmit}
              disabled={!rating || submitted}
            >
              {submitted ? 'Saved Successfully' : 'Submit Review'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DoctorRatingModal;
