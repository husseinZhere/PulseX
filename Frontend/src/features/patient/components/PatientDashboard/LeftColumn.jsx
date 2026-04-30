import PatientWeeklyChart from './PatientWeeklyChart';
import SectionHeader from './SectionHeader';
import StarRating from './StarRating';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import { useState } from 'react';

const DoctorAvatar = ({ src, name }) => {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img
        src={src}
        className="w-12 h-12 rounded-xl object-cover shrink-0 transition-transform duration-300 group-hover:scale-105"
        alt={name || 'Doctor'}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#333CF5] to-[#9810fa] flex items-center justify-center text-white text-[16px] font-bold shrink-0 transition-transform duration-300 group-hover:scale-105">
      {(name || 'D')[0].toUpperCase()}
    </div>
  );
};

const ACCURACY_PERCENT = 90;

const LeftColumn = ({ navigate, doctors, weeklyData }) => {
  const hasDoctors = Array.isArray(doctors) && doctors.length > 0;

  return (
    <div className="flex flex-col gap-6 w-full xl:flex-1 min-w-0">
      <div className="bg-white dark:bg-[#111827] rounded-[32px] p-4 sm:p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] border border-zinc-200 dark:border-gray-700 min-h-[285px] transition-shadow duration-300 hover:shadow-[0px_8px_24px_rgba(0,0,0,0.12)] dark:hover:shadow-[0px_10px_24px_rgba(2,6,23,0.45)] w-full">
        <PatientWeeklyChart weeklyData={weeklyData} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="flex flex-col gap-4 w-full lg:w-[240px] shrink-0">
          <div onClick={() => navigate('/patient/qr')} className="bg-[#9CA3AF] dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#334155] border border-transparent dark:border-gray-700 rounded-3xl px-6 py-5 shadow-sm flex justify-between items-start cursor-pointer transition-all duration-300 hover:brightness-95 hover:-translate-y-0.5 w-full">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <g clipPath="url(#clip0_3006_14170)">
                  <path d="M22.6808 2.3278C21.7508 0.527805 15.6008 0.299805 12.0008 0.299805C8.40078 0.299805 2.25078 0.527805 1.32078 2.3278C0.390781 3.2278 0.300781 8.0278 0.300781 11.9998C0.300781 15.9718 0.390781 20.7718 1.32078 21.6718C2.25078 23.4718 8.40078 23.6998 12.0008 23.6998C15.6008 23.6998 21.7508 23.4718 22.6808 21.6718C23.6108 20.7718 23.7008 15.9718 23.7008 11.9998C23.7008 8.0278 23.6108 3.2278 22.6808 2.3278Z" fill="#FFE236" stroke="#231F20" strokeWidth="0.6" strokeMiterlimit="10" />
                  <path d="M19.3924 5.3039C18.7504 4.0619 14.4844 3.8999 12.0004 3.8999C9.51639 3.8999 5.25039 4.0619 4.60839 5.3039C3.96639 5.9279 3.90039 9.2459 3.90039 11.9999C3.90039 14.7539 3.96639 18.0719 4.60839 18.6959C5.25039 19.9379 9.51639 20.0999 12.0004 20.0999C14.4844 20.0999 18.7504 19.9379 19.3924 18.6959C20.0344 18.0959 20.1004 14.7539 20.1004 11.9999C20.1004 9.2459 20.0344 5.9279 19.3924 5.3039Z" fill="white" stroke="#231F20" strokeWidth="0.6" strokeMiterlimit="10" />
                  <path d="M10.0439 6.91161C9.89989 6.63561 8.95189 6.59961 8.39989 6.59961C7.84789 6.59961 6.89989 6.63561 6.75589 6.91161C6.60365 7.39193 6.55058 7.89816 6.59989 8.39961C6.55058 8.90106 6.60365 9.40729 6.75589 9.88761C6.89989 10.1636 7.84789 10.1996 8.39989 10.1996C8.95189 10.1996 9.89989 10.1636 10.0439 9.88761C10.1961 9.40729 10.2492 8.90106 10.1999 8.39961C10.2492 7.89816 10.1961 7.39193 10.0439 6.91161ZM10.0439 14.1116C9.89989 13.8356 8.95189 13.7996 8.39989 13.7996C7.84789 13.7996 6.89989 13.8356 6.75589 14.1116C6.60365 14.5919 6.55058 15.0982 6.59989 15.5996C6.55058 16.1011 6.60365 16.6073 6.75589 17.0876C6.89989 17.3636 7.84789 17.3996 8.39989 17.3996C8.95189 17.3996 9.89989 17.3636 10.0439 17.0876C10.1961 16.6073 10.2492 16.1011 10.1999 15.5996C10.2492 15.0982 10.1961 14.5919 10.0439 14.1116ZM17.2439 6.91161C17.0999 6.63561 16.1519 6.59961 15.5999 6.59961C15.0479 6.59961 14.0999 6.63561 13.9559 6.91161C13.8037 7.39193 13.7506 7.89816 13.7999 8.39961C13.7506 8.90106 13.8037 9.40729 13.9559 9.88761C14.0999 10.1636 15.0479 10.1996 15.5999 10.1996C16.1519 10.1996 17.0999 10.1636 17.2439 9.88761C17.3961 9.40729 17.4492 8.90106 17.3999 8.39961C17.4492 7.89816 17.3961 7.39193 17.2439 6.91161Z" fill="white" stroke="#231F20" strokeWidth="0.6" strokeMiterlimit="10" />
                  <path d="M18.5645 2.48975C20.9645 3.04175 20.9645 3.04175 21.5105 5.18975" stroke="white" strokeWidth="0.6" strokeMiterlimit="10" strokeLinecap="round" />
                  <path d="M12.0005 6.59961C11.9165 8.39961 11.9165 10.1996 12.0005 11.9996H13.8005" stroke="#231F20" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6.60156 11.9998C7.79916 11.8978 9.00396 11.8978 10.2016 11.9998H6.60156Z" fill="white" />
                  <path d="M6.60156 11.9998C7.79916 11.8978 9.00396 11.8978 10.2016 11.9998M15.6016 13.7998H13.8016V15.5998M15.6016 11.9998C16.2005 11.9489 16.8026 11.9489 17.4016 11.9998C17.4616 12.5998 17.4616 14.9998 17.4016 15.5998H15.6016" stroke="#231F20" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12.0004 13.7998C11.9165 14.9983 11.9165 16.2013 12.0004 17.3998C13.7992 17.5018 15.6016 17.5018 17.4004 17.3998" stroke="#231F20" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <defs>
                  <clipPath id="clip0_3006_14170">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <div className="flex flex-col">
                <span className="text-white text-base font-medium font-['Roboto']">QR Code</span>
                <span className="text-white text-[11px] font-medium leading-tight mt-1">Quick access to<br />your medical records</span>
              </div>
            </div>
            <div className="size-6 bg-white dark:bg-[#0F172A] border border-transparent dark:border-gray-700 rounded-full flex items-center justify-center mt-1 shrink-0">
              <HiOutlineArrowRight size={12} className="text-[#1E1E1E] dark:text-gray-200 -rotate-45" />
            </div>
          </div>

          <div className="bg-gradient-to-b from-neutral-500 to-green-500 dark:from-emerald-800/80 dark:to-teal-700/70 border border-transparent dark:border-emerald-700/50 rounded-3xl px-4 py-3 shadow-sm flex items-start gap-2 transition-all duration-300 hover:-translate-y-0.5 w-full">
            <span className="text-xl mt-0.5 shrink-0">🧠</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-white text-sm font-medium font-['Roboto']">Ai Model: Active</span>
              <span className="text-white/80 text-[10px] font-normal leading-tight">(Heart risk analysis working fine)</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <div className="relative h-3 w-full bg-[rgba(0,0,0,0.12)] dark:bg-[#1E293B] rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 h-full  bg-gradient-to-b from-[#333CF5] to-[#070E92] rounded-full" style={{ width: `${ACCURACY_PERCENT}%` }} />
            </div>
            <div className="flex items-center gap-1.5 px-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9.1419 21.5854C7.46635 21.0866 5.9749 20.1604 4.79393 18.9333C5.2345 18.4111 5.5 17.7365 5.5 16.9998C5.5 15.343 4.15686 13.9998 2.5 13.9998C2.39977 13.9998 2.3007 14.0048 2.203 14.0144C2.0699 13.3636 2 12.6899 2 11.9998C2 10.9545 2.16039 9.94666 2.4579 8.99951C2.47191 8.99971 2.48594 8.99981 2.5 8.99981C4.15686 8.99981 5.5 7.65666 5.5 5.99981C5.5 5.52416 5.3893 5.07441 5.1923 4.67481C6.34875 3.59951 7.76025 2.79477 9.32605 2.36133C9.8222 3.33385 10.8334 3.99982 12 3.99982C13.1666 3.99982 14.1778 3.33385 14.674 2.36133C16.2397 2.79477 17.6512 3.59951 18.8077 4.67481C18.6107 5.07441 18.5 5.52416 18.5 5.99981C18.5 7.65666 19.8431 8.99981 21.5 8.99981C21.514 8.99981 21.5281 8.99971 21.5421 8.99951C21.8396 9.94666 22 10.9545 22 11.9998C22 12.6899 21.9301 13.3636 21.797 14.0144C21.6993 14.0048 21.6003 13.9998 21.5 13.9998C19.8431 13.9998 18.5 15.343 18.5 16.9998C18.5 17.7365 18.7655 18.4111 19.2061 18.9333C18.0251 20.1604 16.5336 21.0866 14.8581 21.5854C14.4714 20.3758 13.338 19.4998 12 19.4998C10.662 19.4998 9.5286 20.3758 9.1419 21.5854Z" fill="#333CF5" className="stroke-black-main-text dark:stroke-white" strokeWidth="2" strokeLinejoin="round" />
                <path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z" fill="#43CCF8" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <span className="text-black-main-text dark:text-[#E2E8F0] text-sm sm:text-base font-extrabold font-['Roboto']">With Accuracy: 90+%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-3xl p-4 sm:p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] border border-zinc-200 dark:border-gray-700 flex-1 transition-all duration-300 hover:shadow-[0px_8px_24px_rgba(0,0,0,0.12)] dark:hover:shadow-[0px_10px_24px_rgba(2,6,23,0.45)] w-full">
          <div className="flex flex-col gap-2 h-full">
            <SectionHeader title="Doctors List" onViewMore={() => navigate('/patient/doctors')} />
            <div className="flex flex-col gap-4 mt-1">
              {hasDoctors ? doctors.map((doc, i) => (
                <div key={doc.id ?? i}>
                  <div
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 group cursor-pointer w-full rounded-2xl px-2 py-2 -mx-2 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/65 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
                    onClick={() => doc.id && navigate(`/patient/doctor-profile/${doc.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if ((event.key === 'Enter' || event.key === ' ') && doc.id) {
                        navigate(`/patient/doctor-profile/${doc.id}`);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <DoctorAvatar src={doc.img} name={doc.name} />
                      <div className="flex flex-col sm:hidden">
                        <span className="text-sm font-medium font-['Roboto'] text-black-main-text dark:text-[#E2E8F0] break-words">{doc.name || 'Doctor'}</span>
                        <span className="text-xs font-normal font-['Roboto'] text-neutral-400 mt-0.5">{doc.loc || 'Unknown location'}</span>
                      </div>
                    </div>
                    <div className="flex items-start sm:items-center justify-between flex-1">
                      <div className="hidden sm:flex flex-col">
                        <span className="text-sm font-medium font-['Roboto'] text-black-main-text dark:text-[#E2E8F0] break-words">{doc.name || 'Doctor'}</span>
                        <span className="text-xs font-normal font-['Roboto'] text-gray-500 dark:text-gray-400 mt-0.5">{doc.loc || 'Unknown location'}</span>
                      </div>
                      <StarRating rating={doc.rating || 0} />
                    </div>
                  </div>
                  {i < doctors.length - 1 && <div className="border-t border-zinc-100 dark:border-gray-700 mt-4" />}
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 px-4 py-5">
                  <p className="text-sm text-slate-500 dark:text-slate-300 font-['Roboto']">
                    No doctors to show yet. Once doctors are available, you can reach them from here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftColumn;
