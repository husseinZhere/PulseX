import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '../../../../components/Toast/Toast';
import BookingCalendar from '../../components/Booking/BookingCalendar';
import BookingSidebar from '../../components/Booking/BookingSidebar';
import BookingTimeSlots from '../../components/Booking/BookingTimeSlots';
import {
  getDoctorProfilePublic,
  getAvailableSlots,
} from '../../../../services/doctorService';
import { resolveFileUrl } from '../../../../utils/api';

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const toLocalDateStr = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const PatientBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState({
    day: today.getDate(),
    month: today.getMonth(),
    year: today.getFullYear(),
  });
  const [selectedTime, setSelectedTime] = useState(null);
  const [toast, setToast] = useState({ visible: false, title: '', message: '', type: 'success' });
  const [availableSlotsMap, setAvailableSlotsMap] = useState({});
  const [bookedSlotsMap, setBookedSlotsMap] = useState({});

  useEffect(() => {
    document.title = 'Booking | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Book your appointment with a doctor.');
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const profile = await getDoctorProfilePublic(id);
        if (ignore) return;
        setDoctor({
          name: profile.fullName || 'Doctor',
          title: profile.specialization || 'Doctor',
          rate: profile.averageRating || 0,
          reviews: profile.totalRatings || 0,
          price: Number(profile.consultationPrice || 0),
          img: resolveFileUrl(profile.profilePicture || ''),
          clinicLocation: profile.clinicLocation || '',
        });
      } catch (err) {
        console.error('Load doctor failed', err);
      }
    };
    load();
    return () => { ignore = true; };
  }, [id]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const iso = toLocalDateStr(selectedDate.year, selectedDate.month, selectedDate.day);
        const resp = await getAvailableSlots(id, iso);
        // The /slots endpoint returns { availableSlots: [{ time, isAvailable }] }.
        // Split those into truly-available vs already-booked so booked slots are
        // shown disabled/faded up front instead of failing at the payment step.
        const rawSlots = resp?.availableSlots ?? resp?.availableTimes ?? [];
        const times = [];
        const bookedList = Array.isArray(resp?.bookedTimes) ? [...resp.bookedTimes] : [];
        if (Array.isArray(rawSlots)) {
          for (const s of rawSlots) {
            if (typeof s === 'string') {
              times.push(s);
            } else if (s?.time) {
              if (s.isAvailable === false) bookedList.push(s.time);
              else times.push(s.time);
            }
          }
        }
        const key = `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`;
        if (!ignore) {
          setAvailableSlotsMap((prev) => ({ ...prev, [key]: times }));
          setBookedSlotsMap((prev) => ({ ...prev, [key]: bookedList }));
        }
      } catch (err) {
        console.error('Load slots failed', err);
      }
    };
    load();
    return () => { ignore = true; };
  }, [id, selectedDate]);

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const availableDays = useMemo(() => {
    const set = new Set();
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(calYear, calMonth, d);
      if (dt >= new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        set.add(d);
      }
    }
    return set;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calYear, calMonth, daysInMonth]);

  const key = `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`;
  const timesForDay = availableSlotsMap[key] || [];
  const bookedForDay = bookedSlotsMap[key] || [];

  const isSelectedDay = (day) => selectedDate.day === day && selectedDate.month === calMonth && selectedDate.year === calYear;
  const stepperDateLabel = `${selectedDate.day} ${MONTH_NAMES[selectedDate.month].slice(0, 3)}, ${selectedDate.year}`;
  const selectedDow = new Date(selectedDate.year, selectedDate.month, selectedDate.day).getDay();
  const dayOfWeekLabel = `${DAY_NAMES[selectedDow]}, ${selectedDate.day}. ${MONTH_NAMES[selectedDate.month]}`;
  const calHeaderLabel = `${MONTH_NAMES[calMonth]} ${calYear}`;

  const goPrevMonth = useCallback(() => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
    setSelectedTime(null);
  }, [calMonth]);

  const goNextMonth = useCallback(() => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
    setSelectedTime(null);
  }, [calMonth]);

  const handleDayClick = (day) => {
    if (!availableDays.has(day)) return;
    setSelectedDate({ day, month: calMonth, year: calYear });
    setSelectedTime(null);
  };

  const handleConfirm = () => {
    if (!selectedTime) {
      setToast({
        visible: true,
        type: 'warning',
        title: 'Time Required',
        message: 'Please select a time slot before confirming your appointment.',
      });
      return;
    }
    navigate(`/patient/payment/${id}`, {
      state: {
        doctorId: Number(id),
        doctorName: doctor?.name,
        doctorImg: doctor?.img,
        doctorTitle: doctor?.title,
        date: stepperDateLabel,
        isoDate: toLocalDateStr(selectedDate.year, selectedDate.month, selectedDate.day),
        time: selectedTime,
        price: doctor?.price,
      },
    });
  };

  if (!doctor) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-400">
        Loading…
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start bg-white dark:bg-[#111827] rounded-[22px] p-4 sm:p-6 lg:p-8"
    >
      <h1 className="sr-only">Book an appointment</h1>

      <aside aria-live="polite">
        <Toast {...toast} onClose={() => setToast((t) => ({ ...t, visible: false }))} />
      </aside>

      <article className="w-full max-w-5xl bg-white dark:bg-[#111827] rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
        <div className="flex flex-col lg:flex-row">
          <BookingSidebar
            doctor={doctor}
            stepperDateLabel={stepperDateLabel}
            selectedTime={selectedTime}
            locationLabel={doctor.clinicLocation || 'City Medical Center'}
          />

          <section className="flex-1 p-6 sm:p-8" aria-label="Select date and time">
            <h2 className="text-2xl font-bold text-black-main-text dark:text-[#E2E8F0] mb-6 sm:mb-8 text-center sm:text-left">Select date &amp; time</h2>

            <div className="flex flex-col xl:flex-row gap-8 sm:gap-10">
              <BookingCalendar
                calHeaderLabel={calHeaderLabel}
                weekDays={WEEK_DAYS}
                daysInMonth={daysInMonth}
                firstDayOfWeek={firstDayOfWeek}
                availableDays={availableDays}
                isSelectedDay={isSelectedDay}
                onPrev={goPrevMonth}
                onNext={goNextMonth}
                onDayClick={handleDayClick}
              />

              <BookingTimeSlots
                dayLabel={dayOfWeekLabel}
                timesForDay={[...timesForDay, ...bookedForDay].sort()}
                bookedTimes={bookedForDay}
                selectedTime={selectedTime}
                onSelect={setSelectedTime}
                onBookedClick={() => setToast({
                  visible: true,
                  type: 'warning',
                  title: 'Time Slot Unavailable',
                  message: 'This time slot is already booked. Please choose another time.',
                })}
              />
            </div>
          </section>
        </div>
      </article>

      <button
        onClick={handleConfirm}
        className="cursor-pointer bg-[#333cf5] text-white font-bold text-base px-10 sm:px-16 py-3.5 sm:py-4 rounded-full hover:bg-blue-700 transition shadow-[0_10px_24px_rgba(59,91,254,0.30)] dark:shadow-[0_10px_24px_rgba(37,44,191,0.45)] active:scale-95 w-full sm:w-auto max-w-[90%]"
      >
        Confirm Appointment
      </button>

      <footer className="sr-only">
        <p>End of booking page.</p>
      </footer>
    </main>
  );
};

export default PatientBooking;
