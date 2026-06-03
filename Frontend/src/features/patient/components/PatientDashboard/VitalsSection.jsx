import { useNavigate } from 'react-router-dom';
import { FaHeartPulse } from 'react-icons/fa6';
import { LuShieldPlus, LuCircleAlert, LuArrowRight } from 'react-icons/lu';
import StatCard from './StatCard';

const bloodPressureIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <g clipPath="url(#clip0_3006_14147)">
      <path d="M12.84 0.450089C12.7493 0.309742 12.625 0.194346 12.4782 0.114443C12.3315 0.0345395 12.1671 -0.00732422 12 -0.00732422C11.8329 -0.00732422 11.6685 0.0345395 11.5218 0.114443C11.375 0.194346 11.2507 0.309742 11.16 0.450089C11.09 0.560089 4 11.7301 4 16.0001C4 18.1218 4.84285 20.1567 6.34315 21.6569C7.84344 23.1572 9.87827 24.0001 12 24.0001C14.1217 24.0001 16.1566 23.1572 17.6569 21.6569C19.1571 20.1567 20 18.1218 20 16.0001C20 11.7401 12.91 0.560089 12.84 0.450089ZM12 21.2401C10.6102 21.2375 9.27784 20.6849 8.29413 19.703C7.31042 18.7212 6.75528 17.3899 6.75 16.0001C6.75 15.8012 6.82902 15.6104 6.96967 15.4698C7.11032 15.3291 7.30109 15.2501 7.5 15.2501C7.69891 15.2501 7.88968 15.3291 8.03033 15.4698C8.17098 15.6104 8.25 15.8012 8.25 16.0001C8.25527 16.9921 8.65237 17.9418 9.35478 18.6424C10.0572 19.3429 11.008 19.7375 12 19.7401C12.1989 19.7401 12.3897 19.8191 12.5303 19.9598C12.671 20.1004 12.75 20.2912 12.75 20.4901C12.75 20.689 12.671 20.8798 12.5303 21.0204C12.3897 21.1611 12.1989 21.2401 12 21.2401Z" className="fill-black-main-text" />
    </g>
    <defs>
      <clipPath id="clip0_3006_14147">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const bloodSugarIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <g clipPath="url(#clip0_3006_14155)">
      <path d="M17.3549 20.1311L19.9709 19.9851L20.1239 17.3701L15.1459 12.3921L12.3789 15.1541L17.3549 20.1311Z" className="fill-black-main-text" />
      <path d="M10.2365 1.60711L8.68345 3.16011L6.66745 1.14411C6.31038 0.758794 5.87926 0.449466 5.39987 0.234631C4.92048 0.0197958 4.40268 -0.0961311 3.87745 -0.106214C3.35223 -0.116297 2.83036 -0.0203286 2.34308 0.175949C1.8558 0.372227 1.41312 0.664781 1.04153 1.03611C0.669931 1.40743 0.377056 1.8499 0.180426 2.33704C-0.0162052 2.82418 -0.112552 3.34597 -0.102849 3.87121C-0.093147 4.39644 0.0224047 4.91432 0.236892 5.39387C0.45138 5.87341 0.760396 6.30476 1.14545 6.66211L1.14745 6.66411L3.16445 8.68011L1.61145 10.2331L3.57845 12.2001L5.24145 10.5361L16.7735 22.0671L20.4265 21.8601L22.5625 23.9961L24.0125 22.5461L21.8765 20.4101L22.0835 16.7571L10.5525 5.22611L12.2165 3.56211L10.2365 1.60711ZM20.5365 20.5551L17.2705 20.7411L6.15845 9.62911L9.61145 6.17611L20.7235 17.2881L20.5365 20.5551Z" className="fill-black-main-text" />
    </g>
    <defs>
      <clipPath id="clip0_3006_14155">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const displayValue = (value, fallback = '--') => {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
};

const VitalsSection = ({ vitals }) => {
  const navigate = useNavigate();
  const heartRateValue = displayValue(vitals?.heartRate?.value);
  const bloodPressureValue = vitals?.bloodPressure?.display || '--/--';
  const bloodSugarValue = displayValue(vitals?.bloodSugar?.value);
  const bloodCountValue = displayValue(vitals?.bloodCount?.value);
  const cholesterolValue = displayValue(vitals?.cholesterol?.value);

  // When every vital is still empty, the patient hasn't entered their health
  // data yet — point them to the Update Health Data page so they know where to go.
  const hasAnyVital =
    bloodPressureValue !== '--/--' ||
    [heartRateValue, bloodSugarValue, bloodCountValue, cholesterolValue].some((v) => v !== '--');

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {!hasAnyVital && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3.5">
          <div className="flex items-start sm:items-center gap-3">
            <LuCircleAlert className="text-amber-500 dark:text-amber-400 text-[22px] shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-[14px] font-bold text-amber-800 dark:text-amber-300">No health data yet</p>
              <p className="text-[13px] text-amber-700/90 dark:text-amber-200/80">
                Add your vitals so we can track your heart health and personalize your dashboard.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/patient/update-health')}
            className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[13px] font-bold px-5 py-2.5 transition-colors cursor-pointer"
          >
            Update Health Data <LuArrowRight className="text-[15px]" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
      <StatCard
        label="Heart Rate"
        value={heartRateValue}
        unit={vitals?.heartRate?.unit || 'bpm'}
        status={vitals?.heartRate?.status || 'No Data'}
        isHeartRate
      />
      <StatCard
        label="Blood Pressure"
        value={bloodPressureValue}
        unit={vitals?.bloodPressure?.unit || 'mmHg'}
        status={vitals?.bloodPressure?.status || 'No Data'}
        icon={bloodPressureIcon}
      />
      <StatCard
        label="Blood Sugar"
        value={bloodSugarValue}
        unit={vitals?.bloodSugar?.unit || 'mg/dl'}
        status={vitals?.bloodSugar?.status || 'No Data'}
        icon={bloodSugarIcon}
      />
      <StatCard
        label="Cholesterol"
        value={cholesterolValue}
        unit={vitals?.cholesterol?.unit || 'mg/dL'}
        status={vitals?.cholesterol?.status || 'No Data'}
        icon={<LuShieldPlus size={24} />}
      />
      <StatCard
        label="Blood Count"
        value={bloodCountValue}
        unit={vitals?.bloodCount?.unit || '%'}
        status={vitals?.bloodCount?.status || 'No Data'}
        icon={<FaHeartPulse size={24} />}
      />
      </div>
    </div>
  );
};

export default VitalsSection;
