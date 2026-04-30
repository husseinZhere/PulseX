import DoctorCard from './DoctorCard';

const DoctorGrid = ({ doctors }) => {
  if (doctors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
        <p className="text-base font-semibold text-black-main-text dark:text-[#E2E8F0]">No doctors found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8" aria-label="Doctors">
      {doctors.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}
    </section>
  );
};

export default DoctorGrid;
