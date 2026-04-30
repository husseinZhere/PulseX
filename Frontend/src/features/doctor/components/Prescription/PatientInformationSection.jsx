import { HiOutlineUser } from 'react-icons/hi2';

const PatientInformationSection = ({ selectedPatient, onPatientChange, patientOptions, selectedPatientDetails }) => {
  return (
    <section className="rounded-2xl border border-[#E6EAF0] dark:border-gray-700 bg-white dark:bg-[#111827] overflow-hidden">
      <div className="bg-[#EEF3FB] dark:bg-[#1E293B] px-4 py-3">
        <h2 className="flex items-center gap-2 text-[16px] font-semibold text-black-main-text dark:text-[#E2E8F0]">
          <HiOutlineUser className="text-[14px] text-[#2563EB]" />
          <span>Patient Information</span>
        </h2>
      </div>

      <div className="p-4 sm:p-5">
        {selectedPatientDetails ? (
          <article className="rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-[#F9FAFB] dark:bg-[#0B1120] px-4 py-3">
            <div className="flex items-center gap-3">
              <img src={selectedPatientDetails.avatar} alt={selectedPatientDetails.name} className="h-11 w-11 rounded-full object-cover" />
              <h3 className="text-[16px] font-semibold text-black-main-text dark:text-[#E2E8F0]">{selectedPatientDetails.name}</h3>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[14px] text-[#6B7280] sm:grid-cols-5">
              <div><p>Patient ID</p><p className="font-semibold text-black-main-text dark:text-[#E2E8F0]">{selectedPatientDetails.id.toUpperCase()}</p></div>
              <div><p>Gender</p><p className="font-semibold text-black-main-text dark:text-[#E2E8F0]">{selectedPatientDetails.gender}</p></div>
              <div><p>Age</p><p className="font-semibold text-black-main-text dark:text-[#E2E8F0]">{selectedPatientDetails.age}</p></div>
              <div><p>Visit Type</p><p className="font-semibold text-black-main-text dark:text-[#E2E8F0]">{selectedPatientDetails.visitType}</p></div>
            </div>
          </article>
        ) : (
          <>
            <label htmlFor="patient-select" className="mb-2 block text-[14px] font-bold text-[#364153] dark:text-gray-200">
              Select Patient <span className="text-[#DC2626]">*</span>
            </label>

            <div className="relative">
              <select
                id="patient-select"
                value={selectedPatient}
                onChange={(event) => onPatientChange(event.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-[#F9FAFB] dark:bg-[#0B1120] px-4 pr-10 text-[16px] text-[#111827] dark:text-gray-100 outline-none transition-colors focus:border-[#333CF5] cursor-pointer"
              >
                <option value="" disabled>Select a patient...</option>
                {patientOptions.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - ID: {patient.id}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#9CA3AF]">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PatientInformationSection;
