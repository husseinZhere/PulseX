import {
  HiOutlineCalendar,
  HiOutlineClock,
} from 'react-icons/hi2';
import { resolveFileUrl } from '../../../../utils/api';

const PrescriptionDetailHeader = ({ data, onDownload }) => {
  const doctorAvatar = resolveFileUrl(data?.doctorAvatar || '') || `https://ui-avatars.com/api/?name=${encodeURIComponent(data?.doc || 'Doctor')}&background=EEF2FF&color=334155`;
  const patientAvatar = resolveFileUrl(data?.patientAvatar || '') || `https://ui-avatars.com/api/?name=${encodeURIComponent(data?.patientName || 'Patient')}&background=E2E8F0&color=334155`;

  return (
    <header
      className="px-8 py-7 w-full"
      style={{ background: 'linear-gradient(90deg, #155DFC 0%, #1447E6 100%)' }}
    >
      <h2 className="sr-only">Prescription summary</h2>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <section className="flex items-center gap-3 text-white" aria-label="Prescribing doctor">
          <div className="w-11 h-11 bg-white dark:bg-[#111827]/20 rounded-2xl flex items-center justify-center text-brand-main dark:text-white text-[22px] shrink-0 overflow-hidden">
            <img
              src={doctorAvatar}
              alt={data.doc}
              className="w-full h-full object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data?.doc || 'Doctor')}&background=EEF2FF&color=334155`;
              }}
            />
          </div>
          <div>
            <span className="text-[14px] opacity-80 block">Prescribed by</span>
            <p className="text-[18px] font-bold m-0 leading-tight">{data.doc}</p>
            <p className="text-[14px] opacity-80 m-0">{data.spec}</p>
          </div>
        </section>

        <section className="flex items-center gap-3 text-white" aria-label="Patient">
          <div className="w-11 h-11 bg-white dark:bg-[#111827]/20 rounded-2xl flex items-center justify-center text-brand-main dark:text-white text-[22px] shrink-0 overflow-hidden">
            <img
              src={patientAvatar}
              alt={data.patientName}
              className="w-full h-full object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data?.patientName || 'Patient')}&background=E2E8F0&color=334155`;
              }}
            />
          </div>
          <div>
            <span className="text-[14px] opacity-80 block">Patient</span>
            <p className="text-[18px] font-bold m-0 leading-tight">{data.patientName}</p>
            <p className="text-[14px] opacity-80 m-0">ID: {data.patientID}</p>
          </div>
        </section>

        <section className="flex items-center gap-3 text-white" aria-label="Date issued">
          <div className="w-11 h-11 bg-white dark:bg-[#111827]/20 rounded-2xl flex items-center justify-center text-brand-main dark:text-white text-[22px] shrink-0">
            <HiOutlineCalendar aria-label="Calendar" />
          </div>
          <div>
            <span className="text-[14px] opacity-80 block">Date Issued</span>
            <p className="text-[18px] font-bold m-0 leading-tight">{data.date}</p>
            <p className="text-[14px] opacity-80 m-0 flex items-center gap-1">
              <HiOutlineClock className="text-[14px]" aria-label="Time" /> {data.time}
            </p>
          </div>
        </section>

        {onDownload && (
          <section className="mt-4 sm:mt-0 sm:ml-auto">
             <button
                onClick={async () => {
                  try {
                    await onDownload(data);
                  } catch (err) {
                    alert('Download failed: ' + (err.message || err));
                    console.error('PDF Error:', err);
                  }
                }}
                className="flex items-center gap-2 bg-white text-brand-main px-5 py-2.5 rounded-xl font-bold text-[14px] cursor-pointer border-none shadow-sm hover:shadow-md transition-all active:scale-95"
             >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download PDF
             </button>
          </section>
        )}
      </div>
    </header>
  );
};

export default PrescriptionDetailHeader;
