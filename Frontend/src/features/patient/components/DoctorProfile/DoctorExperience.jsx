const DoctorExperience = ({ experience }) => {
  return (
    <section className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 sm:p-7" aria-labelledby="doctor-experience-title">
      <h2 id="doctor-experience-title" className="text-lg font-bold text-black-main-text dark:text-[#E2E8F0] mb-4 text-center sm:text-left">
        Professional Experience
      </h2>
      <div className="flex flex-col gap-5">
        {experience.map((item, i) => (
          <article key={i} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-[#4C51F71A] text-[#4C51F7] flex items-center justify-center text-base shrink-0 mt-0.5">
              {item.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-black-main-text dark:text-[#E2E8F0] text-center sm:text-left">{item.title}</h3>
              {item.place && <p className="text-sm text-gray-text-dim2 mt-0.5">{item.place}</p>}
              <p className="text-sm text-gray-text-dim2 mt-1 whitespace-pre-line">{item.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default DoctorExperience;
