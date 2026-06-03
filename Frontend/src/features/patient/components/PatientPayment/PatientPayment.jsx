import React, { useState } from 'react';
import { bookAppointment } from '../../../../services/appointmentService';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiCheckCircle } from 'react-icons/hi2';
import { HiOutlineUser, HiOutlineCalendar, HiOutlineClock } from 'react-icons/hi';

export const PAYMENT_CSS_VARS = {
  '--payment-ink': '#0F172A',
  '--payment-muted': '#64748B',
  '--payment-brand': '#3B5BFE',
  '--payment-brand-hover': '#252CBF',
};

const MastercardLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="18" viewBox="0 0 32 18" fill="none" role="img" aria-label="Mastercard logo">
    <rect width="32" height="18" rx="4" fill="#FFF4EE" />
    <path d="M20.2744 3.75C23.7196 3.75021 26.5124 6.0678 26.5127 8.92676C26.5127 11.7859 23.7198 14.1043 20.2744 14.1045C18.7295 14.1045 17.3162 13.6371 16.2266 12.8652C15.1371 13.6367 13.7251 14.1044 12.1807 14.1045C8.73503 14.1045 5.94141 11.7861 5.94141 8.92676C5.94172 6.06767 8.73522 3.75 12.1807 3.75C13.7249 3.75008 15.1372 4.21699 16.2266 4.98828C17.3161 4.21661 18.7297 3.75 20.2744 3.75Z" fill="#ED0006" />
    <path d="M20.2734 3.75C23.7189 3.75002 26.5124 6.06768 26.5127 8.92676C26.5127 11.7861 23.7191 14.1045 20.2734 14.1045C18.7287 14.1045 17.3162 13.6369 16.2266 12.8652C17.5673 11.9156 18.4189 10.5042 18.4189 8.92676C18.4188 7.34937 17.5675 5.93778 16.2266 4.98828C17.3161 4.21677 18.7289 3.75 20.2734 3.75Z" fill="#F9A000" />
    <path d="M16.2266 4.98779C17.5679 5.93739 18.4189 7.34942 18.4189 8.92725C18.4189 10.5049 17.5677 11.9161 16.2266 12.8657C14.8859 11.9161 14.0352 10.5046 14.0352 8.92725C14.0352 7.34974 14.8856 5.93739 16.2266 4.98779Z" fill="#FF5E00" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" role="img" aria-label="Secure payment lock" className="text-[var(--payment-brand)]">
    <path d="M12.6667 7.3335H3.33333C2.59695 7.3335 2 7.93045 2 8.66683V13.3335C2 14.0699 2.59695 14.6668 3.33333 14.6668H12.6667C13.403 14.6668 14 14.0699 14 13.3335V8.66683C14 7.93045 13.403 7.3335 12.6667 7.3335Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.66797 7.3335V4.66683C4.66797 3.78277 5.01916 2.93493 5.64428 2.30981C6.2694 1.68469 7.11725 1.3335 8.0013 1.3335C8.88536 1.3335 9.7332 1.68469 10.3583 2.30981C10.9834 2.93493 11.3346 3.78277 11.3346 4.66683V7.3335" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FieldInput = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-semibold text-slate-600 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-[12px] text-red-500 font-medium flex items-center gap-1"><span>⚠</span>{error}</p>}
  </div>
);

const inputBase = 'w-full px-4 py-3.5 rounded-xl border-[1.5px] outline-none transition-all text-[14px] bg-white dark:bg-[#0F172A] text-slate-800 dark:text-[#E2E8F0] placeholder:text-slate-400 dark:placeholder:text-gray-500';
const inputNormal = 'border-gray-200 dark:border-gray-600 focus:border-[#3B5BFE] focus:ring-2 focus:ring-[#3B5BFE]/15';
const inputError = 'border-red-400 dark:border-red-500 bg-red-50/40 dark:bg-red-900/10 focus:border-red-400 focus:ring-2 focus:ring-red-400/15';

const ConfirmPayModal = ({ method, doctorName, date, time, price, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white dark:bg-[#111827] rounded-[28px] p-8 max-w-sm w-full shadow-2xl text-center">
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3B5BFE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      </div>
      <h3 className="text-[18px] font-bold text-slate-800 dark:text-[#E2E8F0] mb-2">
        {method === 'cash' ? 'Confirm Booking?' : 'Confirm Payment?'}
      </h3>
      <p className="text-sm text-slate-500 dark:text-gray-400 mb-5">
        {method === 'cash'
          ? `Book appointment with ${doctorName} on ${date} at ${to12h(time)}. Pay at clinic.`
          : `Pay $${price}.00 for appointment with ${doctorName} on ${date} at ${to12h(time)}.`}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-[#1E293B] transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 rounded-2xl bg-[#3B5BFE] text-white font-bold text-sm hover:bg-[#252CBF] transition-all shadow-[0_4px_12px_rgba(59,91,254,0.30)] cursor-pointer"
        >
          {method === 'cash' ? 'Confirm' : 'Pay Now'}
        </button>
      </div>
    </div>
  </div>
);

const to12h = (t) => {
  if (!t) return t;
  const [hStr, mStr = '00'] = t.split(':');
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return t;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${period}`;
};

const PatientPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [method, setMethod] = useState('credit');
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const bookingData = location.state || {
    doctorId: null,
    doctorName: 'Dr. Sarah Johnson',
    doctorTitle: 'Cardiologist',
    date: 'December 8, 2025',
    isoDate: new Date().toISOString(),
    time: '10:30 AM',
    price: 150,
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
    setExpiry(val);
    if (fieldErrors.expiry) setFieldErrors((prev) => ({ ...prev, expiry: '' }));
  };

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
    if (fieldErrors.cardNumber) setFieldErrors((prev) => ({ ...prev, cardNumber: '' }));
  };

  const validateCard = () => {
    if (method !== 'credit') return true;
    const errors = {};
    if (!cardHolder.trim()) errors.cardHolder = 'Cardholder name is required';
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 16) errors.cardNumber = 'Enter a valid 16-digit card number';
    if (!expiry.match(/^\d{2}\/\d{2}$/)) errors.expiry = 'Use MM/YY format (e.g. 08/26)';
    if (cvv.length < 3) errors.cvv = 'CVV must be 3–4 digits';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayClick = () => {
    if (!bookingData.doctorId) {
      setError('Missing booking data. Please re-select a doctor.');
      return;
    }
    if (!validateCard()) return;
    setShowConfirm(true);
  };

  const handleConfirmedPay = async () => {
    setShowConfirm(false);
    setProcessing(true);
    setError('');
    try {
      const payload = {
        doctor_id: Number(bookingData.doctorId),
        appointment_date: bookingData.isoDate,
        time_slot: bookingData.time,
        payment_method: method === 'credit' ? 2 : 1,
        card_number: method === 'credit' ? cardNumber.replace(/\s/g, '') : null,
        card_holder: method === 'credit' ? cardHolder : null,
      };
      await bookAppointment(payload);
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <section className="fixed inset-0 flex items-center justify-center z-[100] bg-black/40 backdrop-blur-sm p-4" aria-live="polite">
        <div className="bg-white dark:bg-[#111827] rounded-[32px] p-10 max-w-sm w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiCheckCircle className="text-emerald-500 text-5xl" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-[#E2E8F0] mb-2">
            {method === 'cash' ? 'Appointment Confirmed!' : 'Payment Successful!'}
          </h2>
          <p className="text-slate-500 dark:text-gray-400 mb-8">
            {method === 'cash'
              ? 'Your appointment is booked. Chat will open automatically when your appointment begins.'
              : 'Payment confirmed! Chat with your doctor is now active for 24 hours.'}
          </p>
          <button onClick={() => navigate('/patient/appointments')} className="w-full py-4 bg-[var(--payment-brand)] text-white rounded-2xl font-bold hover:bg-[var(--payment-brand-hover)] transition-all">
            View Appointments
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto" style={PAYMENT_CSS_VARS}>
      {showConfirm && (
        <ConfirmPayModal
          method={method}
          doctorName={bookingData.doctorName}
          date={bookingData.date}
          time={bookingData.time}
          price={bookingData.price}
          onConfirm={handleConfirmedPay}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      <header className="flex items-center gap-3 mb-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#333CF5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
        <h1 className="text-xl font-bold text-black-main-text dark:text-[#E2E8F0]">Select Payment Method</h1>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <article className="lg:col-span-7 space-y-5">
          {/* Cash Option */}
          <div
            onClick={() => { setMethod('cash'); setFieldErrors({}); }}
            className={`bg-white dark:bg-[#111827] p-5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${method === 'cash' ? 'border-[#3B5BFE] shadow-[0_0_0_4px_rgba(59,91,254,0.08)]' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-slate-50 dark:bg-[#0F172A] rounded-xl flex items-center justify-center border border-slate-200 dark:border-gray-700">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M20 5H4C2.89543 5 2 5.89543 2 7V17C2 18.1046 2.89543 19 4 19H20C21.1046 19 22 18.1046 22 17V7C22 5.89543 21.1046 5 20 5Z" stroke="#333CF5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 10H22" stroke="#333CF5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-black-main-text dark:text-[#E2E8F0] text-[15px]">Cash at Clinic</p>
                <p className="text-[13px] text-slate-400 dark:text-gray-400 mt-0.5">Pay directly at the clinic during your visit</p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${method === 'cash' ? 'border-[#3B5BFE]' : 'border-gray-300 dark:border-gray-600'}`}>
              {method === 'cash' && <div className="w-2.5 h-2.5 bg-[#3B5BFE] rounded-full" />}
            </div>
          </div>

          {/* Credit Option */}
          <div
            onClick={() => setMethod('credit')}
            className={`bg-white dark:bg-[#111827] p-5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${method === 'credit' ? 'border-[#3B5BFE] shadow-[0_0_0_4px_rgba(59,91,254,0.08)]' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-slate-50 dark:bg-[#0F172A] rounded-xl flex items-center justify-center border border-slate-200 dark:border-gray-700">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M19 7V4C19 3.73 18.89 3.48 18.71 3.29C18.52 3.1 18.27 3 18 3H5C4.47 3 3.96 3.21 3.59 3.59C3.21 3.96 3 4.47 3 5C3 5.53 3.21 6.04 3.59 6.41C3.96 6.79 4.47 7 5 7H20C20.27 7 20.52 7.1 20.71 7.29C20.9 7.48 21 7.73 21 8V12M21 12H18C17.47 12 16.96 12.21 16.59 12.59C16.21 12.96 16 13.47 16 14C16 14.53 16.21 15.04 16.59 15.41C16.96 15.79 17.47 16 18 16H21C21.27 16 21.52 15.89 21.71 15.71C21.9 15.52 22 15.27 22 15V13C22 12.73 21.9 12.48 21.71 12.29C21.52 12.1 21.27 12 21 12Z" stroke="#333CF5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 5V19C3 19.53 3.21 20.04 3.59 20.41C3.96 20.79 4.47 21 5 21H20C20.27 21 20.52 20.89 20.71 20.71C20.9 20.52 21 20.27 21 20V16" stroke="#333CF5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-black-main-text dark:text-[#E2E8F0] text-[15px]">Credit / Debit Card</p>
                <p className="text-[13px] text-slate-400 dark:text-gray-400 mt-0.5">Pay securely with your credit or debit card</p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${method === 'credit' ? 'border-[#3B5BFE]' : 'border-gray-300 dark:border-gray-600'}`}>
              {method === 'credit' && <div className="w-2.5 h-2.5 bg-[#3B5BFE] rounded-full" />}
            </div>
          </div>

          {/* Card Details Form */}
          {method === 'credit' && (
            <section className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-5 animate-in fade-in duration-300" aria-label="Card details">
              <div className="flex items-center gap-2.5 pb-1">
                <MastercardLogo />
                <span className="font-bold text-slate-700 dark:text-[#E2E8F0] text-[14px]">Card Details</span>
              </div>

              <FieldInput label="Card Holder Name" required error={fieldErrors.cardHolder}>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardHolder}
                  onChange={(e) => { setCardHolder(e.target.value); if (fieldErrors.cardHolder) setFieldErrors((p) => ({ ...p, cardHolder: '' })); }}
                  className={`${inputBase} ${fieldErrors.cardHolder ? inputError : inputNormal}`}
                />
              </FieldInput>

              <FieldInput label="Card Number" required error={fieldErrors.cardNumber}>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                  className={`${inputBase} tracking-widest ${fieldErrors.cardNumber ? inputError : inputNormal}`}
                />
              </FieldInput>

              <div className="grid grid-cols-2 gap-4">
                <FieldInput label="Expiry Date" required error={fieldErrors.expiry}>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={handleExpiryChange}
                    maxLength={5}
                    className={`${inputBase} ${fieldErrors.expiry ? inputError : inputNormal}`}
                  />
                </FieldInput>
                <FieldInput label="CVV" required error={fieldErrors.cvv}>
                  <input
                    type="password"
                    placeholder="•••"
                    value={cvv}
                    onChange={(e) => { setCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 4)); if (fieldErrors.cvv) setFieldErrors((p) => ({ ...p, cvv: '' })); }}
                    maxLength={4}
                    className={`${inputBase} ${fieldErrors.cvv ? inputError : inputNormal}`}
                  />
                </FieldInput>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-gray-700">
                <LockIcon />
                <p className="text-[12px] text-slate-500 dark:text-gray-400 font-medium">Your payment information is encrypted and secure</p>
              </div>
            </section>
          )}
        </article>

        {/* Booking Summary */}
        <aside className="lg:col-span-5" aria-label="Booking summary">
          <div className="bg-white dark:bg-[#111827] rounded-[28px] p-7 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-[17px] font-bold text-black-main-text dark:text-[#E2E8F0] mb-7">Booking Summary</h2>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                {bookingData.doctorImg ? (
                  <img
                    src={bookingData.doctorImg}
                    alt={bookingData.doctorName}
                    className="h-12 w-12 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-700"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div
                  className="h-12 w-12 rounded-full shrink-0 bg-blue-50 dark:bg-blue-900/25 items-center justify-center text-blue-500 dark:text-blue-300 text-[16px] font-bold"
                  style={{ display: bookingData.doctorImg ? 'none' : 'flex' }}
                >
                  {(String(bookingData.doctorName || 'D').replace(/^dr\.?\s/i, '').trim()[0] || 'D').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400">Doctor</p>
                  <p className="font-bold text-slate-800 dark:text-[#E2E8F0] text-[14px] truncate">{bookingData.doctorName}</p>
                  {bookingData.doctorTitle && <p className="text-[12px] text-slate-400 dark:text-gray-400 truncate">{bookingData.doctorTitle}</p>}
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-gray-700" />

              <SummaryRow icon={<HiOutlineCalendar className="text-slate-500" />} label="Date">
                <p className="font-bold text-slate-800 dark:text-[#E2E8F0] text-[14px]">{bookingData.date}</p>
              </SummaryRow>

              <SummaryRow icon={<HiOutlineClock className="text-slate-500" />} label="Time">
                <p className="font-bold text-slate-800 dark:text-[#E2E8F0] text-[14px]">{to12h(bookingData.time)}</p>
              </SummaryRow>

              <SummaryRow icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              } label="Payment Method">
                <p className="font-bold text-slate-800 dark:text-[#E2E8F0] text-[14px]">{method === 'credit' ? 'Credit / Debit Card' : 'Cash at Clinic'}</p>
              </SummaryRow>

              <div className="h-px bg-slate-100 dark:bg-gray-700" />

              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400 font-medium text-[14px]">Total Amount</span>
                <span className="text-[22px] font-bold text-black-main-text dark:text-[#E2E8F0]">${bookingData.price}.00</span>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-[13px] text-red-700 dark:text-red-300 font-medium">
                  {error}
                </div>
              )}

              <button
                onClick={handlePayClick}
                disabled={processing}
                className="w-full py-4 cursor-pointer bg-[#3B5BFE] text-white rounded-2xl font-bold text-[15px] hover:bg-[#252CBF] transition-all shadow-[0_8px_20px_rgba(59,91,254,0.30)] dark:shadow-[0_8px_20px_rgba(37,44,191,0.40)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing…' : method === 'cash' ? 'Confirm Booking' : 'Pay Now'}
              </button>
            </div>
          </div>
        </aside>
      </section>
    </section>
  );
};

const SummaryRow = ({ icon, label, children, iconBg = 'bg-slate-50 dark:bg-[#0F172A]' }) => (
  <div className="flex items-start gap-3.5">
    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[11px] text-slate-400 dark:text-gray-400 mb-0.5 uppercase tracking-wide font-medium">{label}</p>
      {children}
    </div>
  </div>
);

export default PatientPayment;
