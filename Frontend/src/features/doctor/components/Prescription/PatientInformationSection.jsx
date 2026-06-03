import { useState, useRef, useEffect } from 'react';
import { HiOutlineUser } from 'react-icons/hi2';
import { LuChevronDown, LuSearch } from 'react-icons/lu';

const PatientAvatar = ({ src, name, size = 'sm' }) => {
  const [err, setErr] = useState(false);
  const dim = size === 'sm' ? 'w-8 h-8 text-[13px]' : 'w-11 h-11 text-[15px]';
  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        className={`${dim} rounded-full object-cover shrink-0`}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full bg-[#E2E8F0] dark:bg-[#334155] text-[#334155] dark:text-[#94a3b8] flex items-center justify-center font-bold shrink-0`}>
      {(name || 'P')[0].toUpperCase()}
    </div>
  );
};

const PatientInformationSection = ({ selectedPatient, onPatientChange, patientOptions, selectedPatientDetails }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = (patientOptions || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const chosen = (patientOptions || []).find((p) => String(p.id) === String(selectedPatient));

  const handleSelect = (id) => {
    onPatientChange(id);
    setOpen(false);
    setSearch('');
  };

  return (
    <section className="rounded-2xl border border-[#E6EAF0] dark:border-gray-700 bg-white dark:bg-[#111827]">
      <div className="bg-[#EEF3FB] dark:bg-[#1E293B] px-4 py-3 rounded-t-2xl">
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
            <label className="mb-2 block text-[14px] font-bold text-[#364153] dark:text-gray-200">
              Select Patient <span className="text-[#DC2626]">*</span>
            </label>

            <div className="relative" ref={ref}>
              {/* Trigger */}
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex h-12 w-full items-center gap-3 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-[#F9FAFB] dark:bg-[#0B1120] px-4 text-left transition-colors focus:border-[#333CF5] cursor-pointer"
              >
                {chosen ? (
                  <>
                    <PatientAvatar src={chosen.avatar} name={chosen.name} />
                    <span className="flex-1 text-[15px] font-medium text-[#111827] dark:text-gray-100">{chosen.name}</span>
                  </>
                ) : (
                  <span className="flex-1 text-[15px] text-[#9CA3AF]">Select a patient...</span>
                )}
                <LuChevronDown className={`shrink-0 text-[#9CA3AF] transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {open && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#0B1120] shadow-lg overflow-hidden">
                  {/* Search */}
                  <div className="flex items-center gap-2 border-b border-[#E5E7EB] dark:border-gray-700 px-3 py-2">
                    <LuSearch className="shrink-0 text-[#9CA3AF]" />
                    <input
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search patient..."
                      className="flex-1 bg-transparent text-[14px] text-[#111827] dark:text-gray-100 placeholder:text-[#9CA3AF] outline-none"
                    />
                  </div>

                  {/* Options */}
                  <ul className="max-h-52 overflow-y-auto py-1">
                    {filtered.length === 0 ? (
                      <li className="px-4 py-3 text-[13px] text-[#9CA3AF] text-center">No patients found</li>
                    ) : filtered.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(p.id)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer hover:bg-[#F3F4F6] dark:hover:bg-[#1E293B] ${String(p.id) === String(selectedPatient) ? 'bg-[#EEF2FF] dark:bg-[#1e2a4a]' : ''}`}
                        >
                          <PatientAvatar src={p.avatar} name={p.name} />
                          <span className="text-[14px] font-medium text-[#111827] dark:text-gray-100">{p.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PatientInformationSection;
