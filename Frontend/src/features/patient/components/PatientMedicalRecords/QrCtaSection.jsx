import { motion } from 'framer-motion';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import { RiRocketLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

const QrCtaSection = ({ qrImage }) => {
  const navigate = useNavigate();
  return (
    <div className="w-full lg:flex-1 flex flex-col items-center text-center gap-8 max-w-2xl mx-auto py-6 sm:py-10">
      <div className="flex flex-col items-center gap-6">
        <h3 className="text-[24px] md:text-[28px] font-bold text-black-main-text dark:text-[#E2E8F0] flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <motion.img
            src={qrImage}
            alt="QR Icon"
            className="w-20 h-20 object-contain shrink-0"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          All your medical files are ready!
        </h3>

        <div className="flex flex-col gap-2 items-center">
          <p className="text-[17px] text-gray-text-dim2 leading-relaxed">
            Your reports are now organized.
          </p>
          <p className="text-[17px] text-gray-text-dim2 leading-relaxed font-medium">
            Generate your personal QR code to access them anytime.
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/patient/qr')}
        className="group relative cursor-pointer flex items-center justify-center gap-3 w-full max-w-[320px] sm:w-[248px] h-[72px] rounded-full px-8 text-[15px] font-bold text-white shadow-[0px_14px_28px_rgba(24,77,255,0.22)] overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, #1F2AE0 0%, #F5002B 100%)',
        }}
      >
        <span className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_18%_40%,rgba(255,255,255,0.35),transparent_45%)]" aria-hidden="true" />

        <motion.div
          className="relative z-10"
          variants={{
            tap: {
              x: 100,
              y: -100,
              opacity: 0,
              transition: { duration: 0.8, ease: 'easeIn' },
            },
          }}
          whileTap="tap"
        >
          <RiRocketLine className="text-[28px]" />
        </motion.div>

        <span className="relative z-10 tracking-[0.01em]">Generate QR Code</span>

        <motion.span
          className="relative z-10"
          animate={{ x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <HiOutlineArrowRight className="text-[26px]" />
        </motion.span>
      </motion.button>
    </div>
  );
};

export default QrCtaSection;
