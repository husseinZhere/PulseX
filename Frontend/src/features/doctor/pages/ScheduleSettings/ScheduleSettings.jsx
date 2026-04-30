import React, { useEffect, useMemo, useState } from 'react';
import ConfirmModal from '../../../admin/components/ConfirmModal/ConfirmModal';
import AvailabilityCalendar from '../../components/ScheduleSettings/AvailabilityCalendar';
import ScheduleSettingsHeader from '../../components/ScheduleSettings/ScheduleSettingsHeader';
import TodaySlotsPanel from '../../components/ScheduleSettings/TodaySlotsPanel';
import WeeklyRecurringSchedule from '../../components/ScheduleSettings/WeeklyRecurringSchedule';
import {
  getMySchedule,
  saveWeeklySchedule,
  addSingleSlot,
} from '../../../../services/scheduleService';

// 0=Sunday … 6=Saturday
const INITIAL_WEEKLY = Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((n) => [n, { startTime: '', endTime: '' }]));

const toIso = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDateLabel = (iso) => {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

const ScheduleSettings = () => {
  const todayIso = toIso(new Date());

  const [currentMonth, setCurrentMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [weeklySchedule, setWeeklySchedule] = useState(INITIAL_WEEKLY);
  const [draftSlot, setDraftSlot] = useState({ date: todayIso, startTime: '', endTime: '' });
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [flashMessage, setFlashMessage] = useState('');
  const isWarningFlash = flashMessage.toLowerCase().startsWith('please') || flashMessage.toLowerCase().startsWith('failed') || flashMessage.toLowerCase().includes('error');

  useEffect(() => {
    document.title = 'Schedule Settings | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Doctor availability management — select days and manage appointment slots.');
  }, []);

  // Sync draft date when calendar selection changes
  useEffect(() => {
    setDraftSlot((prev) => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const schedule = await getMySchedule();
        if (ignore || !schedule) return;

        // Weekly recurring slots
        if (Array.isArray(schedule.weeklySlots)) {
          const weekly = { ...INITIAL_WEEKLY };
          schedule.weeklySlots.forEach((s) => {
            if (s.dayOfWeek != null) {
              weekly[s.dayOfWeek] = {
                startTime: (s.startTime || '').slice(0, 5),
                endTime: (s.endTime || '').slice(0, 5),
              };
            }
          });
          setWeeklySchedule(weekly);
        }

        // Single slots keyed by ISO date
        if (Array.isArray(schedule.singleSlots)) {
          const map = {};
          schedule.singleSlots.forEach((s) => {
            if (!s.slotDate) return;
            const iso = s.slotDate.slice(0, 10);
            if (!map[iso]) map[iso] = [];
            const t = (s.startTime || '').slice(0, 5);
            if (t && !map[iso].includes(t)) map[iso].push(t);
          });
          Object.values(map).forEach((arr) => arr.sort());
          setSlotsByDate(map);
        }
      } catch (err) {
        console.error('Load schedule failed', err);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  // Compute available dates: single slots + weekly recurring days in current month view
  const availableDates = useMemo(() => {
    const dates = new Set(Object.keys(slotsByDate));
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(year, month, d).getDay();
      const cfg = weeklySchedule[dow];
      if (cfg?.startTime && cfg?.endTime) {
        dates.add(toIso(new Date(year, month, d)));
      }
    }
    return dates;
  }, [slotsByDate, weeklySchedule, currentMonth]);

  const selectedSlots = slotsByDate[selectedDate] || [];

  const handlePrevMonth = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const handleDraftChange = (field, value) =>
    setDraftSlot((prev) => ({ ...prev, [field]: value }));

  const flash = (msg) => {
    setFlashMessage(msg);
    setTimeout(() => setFlashMessage(''), 2500);
  };

  const handleAddSlot = async () => {
    if (!draftSlot.date || !draftSlot.startTime) {
      flash('Please select a date and start time first.');
      return;
    }
    if (!draftSlot.endTime) {
      flash('Please enter an end time.');
      return;
    }

    const iso = draftSlot.date;
    setSlotsByDate((prev) => {
      const current = prev[iso] || [];
      if (current.includes(draftSlot.startTime)) return prev;
      return { ...prev, [iso]: [...current, draftSlot.startTime].sort() };
    });
    setSelectedDate(iso);

    try {
      await addSingleSlot({
        slotDate: draftSlot.date,
        startTime: draftSlot.startTime,
        endTime: draftSlot.endTime,
      });
      flash('Single slot added successfully.');
    } catch (err) {
      flash(err?.response?.data?.message || 'Failed to add slot.');
    }
  };

  const handleWeeklyChange = (dayNum, key, value) =>
    setWeeklySchedule((prev) => ({
      ...prev,
      [dayNum]: { ...prev[dayNum], [key]: value },
    }));

  const handleConfirmSave = async () => {
    setConfirmSaveOpen(false);
    try {
      const days = Object.entries(weeklySchedule)
        .filter(([, cfg]) => cfg.startTime && cfg.endTime)
        .map(([dayNum, cfg]) => ({
          dayOfWeek: Number(dayNum),
          startTime: cfg.startTime,
          endTime: cfg.endTime,
        }));
      await saveWeeklySchedule({ days });
      flash('Recurring schedule saved successfully.');
    } catch (err) {
      flash(err?.response?.data?.message || 'Save failed.');
    }
  };

  return (
    <main className="p-4 sm:p-[24px] xl:p-7 flex flex-col gap-5" style={{ '--appt-muted': '#757575' }}>
      <ConfirmModal
        isOpen={!!confirmSaveOpen}
        title="Save Recurring Schedule?"
        desc="Are you sure you want to save the recurring schedule changes?"
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmSaveOpen(false)}
      />

      {flashMessage && (
        <section
          role="status"
          className={`fixed top-6 right-6 z-[1200] flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-medium shadow-[0_10px_30px_rgba(2,6,23,0.35)] backdrop-blur-sm ${
            isWarningFlash
              ? 'border-amber-400/30 bg-[#291d0a]/95 text-amber-100'
              : 'border-emerald-400/25 bg-[#0b1623]/95 text-emerald-100'
          }`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${isWarningFlash ? 'bg-amber-300' : 'bg-emerald-300'}`} />
          <span>{flashMessage}</span>
        </section>
      )}

      <ScheduleSettingsHeader />

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
        <section className="flex flex-col gap-4">
          <AvailabilityCalendar
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            availableDates={availableDates}
            todayIso={todayIso}
            onSelectDate={setSelectedDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          <WeeklyRecurringSchedule
            weeklySchedule={weeklySchedule}
            onScheduleChange={handleWeeklyChange}
            onSave={() => setConfirmSaveOpen(true)}
          />
        </section>

        <TodaySlotsPanel
          selectedDateLabel={formatDateLabel(selectedDate)}
          slots={selectedSlots}
          draftSlot={draftSlot}
          onDraftChange={handleDraftChange}
          onAddSlot={handleAddSlot}
        />
      </section>
    </main>
  );
};

export default ScheduleSettings;