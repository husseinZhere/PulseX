import { HiOutlineChat, HiStar } from 'react-icons/hi';

const DoctorHero = ({ doctor, onBook, onMessage }) => {
  return (
    <header className="bg-brand-main rounded-2xl p-6 sm:p-10 lg:p-14 mb-5 flex flex-col md:flex-row items-center md:items-start lg:items-center gap-6 text-center sm:text-left">
      <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-4 flex-1 w-full">
        <img
          src={doctor.img}
          alt={`Profile of ${doctor.name}`}
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover border-4 border-white shrink-0"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${doctor.name}&background=5B65F8&color=fff`;
          }}
        />
        <div className="flex flex-col items-center sm:items-start w-full">
          <h1 className="text-2xl sm:text-xl font-bold text-white text-center sm:text-left">{doctor.name}</h1>
          <p className="text-[#DBEAFE] text-base sm:text-lg mt-0.5">{doctor.title}</p>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2 bg-[#FFFFFF33] rounded-full px-3 py-2 w-fit mx-auto sm:mx-0">
            <HiStar className="text-[#FDC700] text-lg" aria-label="Rating" />
            <span className="text-white text-lg font-semibold">{doctor.rate}</span>
            <span className="text-[#DBEAFE] text-base">· {doctor.reviews} reviews</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3.5 w-full md:w-auto shrink-0 mt-4 md:mt-0">
        <button
          onClick={onBook}
          className="bg-white dark:bg-[#111827] cursor-pointer text-brand-main font-semibold text-base px-6 py-2.5 rounded-xl hover:bg-blue-50 transition w-full md:w-50"
        >
          Book Appointment
        </button>
        <button
          onClick={onMessage}
          disabled={!doctor.hasAppointment}
          title={!doctor.hasAppointment ? 'Book an appointment first to message' : 'Go to messages'}
          className={`flex items-center justify-center gap-2 font-semibold text-base px-6 py-2.5 rounded-xl border transition w-full md:w-50 cursor-pointer disabled:cursor-not-allowed
            ${doctor.hasAppointment
              ? 'bg-white text-brand-main border-white/30 hover:bg-white'
              : 'bg-[#E5E7EB] border-white/15 text-gray-text-dim2'}`}
        >
          <HiOutlineChat className="text-base" aria-label="Message" />
          Message Now
        </button>
      </div>
    </header>
  );
};

export default DoctorHero;
