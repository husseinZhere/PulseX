const DoctorAbout = ({ doctor }) => {
  return (
    <section className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 sm:p-7 mb-5" aria-labelledby="doctor-about-title">
      <h2 id="doctor-about-title" className="text-xl font-bold text-black-main-text dark:text-[#E2E8F0] mb-3 text-center sm:text-left">
        About {doctor.name}
      </h2>
      <p className="text-base text-[var(--doc-muted-2)] leading-relaxed">
        {doctor.bio || 'No professional bio provided yet.'}
      </p>
    </section>
  );
};

export default DoctorAbout;
