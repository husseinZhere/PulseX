import { LuFileText, LuFolder } from 'react-icons/lu';

const tagClass = (type) => (type === 'Radiology' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#DBEAFE] text-[#1D4ED8]');

const PatientRecordsSection = ({ patient }) => {
  const records = Array.isArray(patient.records) ? patient.records : [];

  return (
    <section className="mt-6 overflow-hidden rounded-[16px] border-[0.8px] border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827] shadow-[0_4px_12px_rgba(0,0,0,0.12)]" aria-labelledby="records-title">
      <div className="flex items-center gap-3 border-b-[0.8px] border-[#E5E7EB] dark:border-gray-700 px-6 py-6">
        <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-[14px] bg-[#DBEAFE]">
          <LuFileText className="text-[20px] text-[#3B82F6]" />
        </div>
        <h2 id="records-title" className="text-[16px] font-bold text-[#101828] dark:text-[#E2E8F0]">Medical Records</h2>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-[48px]">
          <div className="mb-6 flex shrink-0 h-[80px] w-[80px] items-center justify-center rounded-[16px] bg-[#EFF6FF] dark:bg-[#1E293B]">
            <LuFolder className="text-[40px] text-[#3B82F6]" strokeWidth="1.5" />
          </div>
          <h3 className="mb-2 text-center text-[20px] font-bold text-[#101828] dark:text-[#E2E8F0]">No Medical Records Found</h3>
          <p className="text-center text-[16px] text-[#4A5565] dark:text-gray-300 tracking-wide">This patient doesn't have any medical records uploaded yet.</p>
        </div>
      ) : (
        <div className="p-4">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_0.7fr] px-2 pb-3 text-[12px] font-semibold text-[#6B7280]">
            <span>File Name</span><span>Type</span><span>Upload Date</span><span>Action</span>
          </div>
          {records.map((record) => (
            <article key={record.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_0.7fr] items-center gap-2 border-t border-[#F1F5F9] px-2 py-3 text-[14px]">
              <span className="font-semibold text-black-main-text dark:text-[#E2E8F0]">{record.fileName}</span>
              <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${tagClass(record.type)}`}>{record.type}</span>
              <span className="text-[#6B7280]">{record.uploadDate}</span>
              {record.filePath ? (
                <a
                  href={record.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="text-left font-semibold text-[#333CF5]"
                >
                  View
                </a>
              ) : (
                <span className="text-left font-semibold text-[#94A3B8]">N/A</span>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default PatientRecordsSection;
