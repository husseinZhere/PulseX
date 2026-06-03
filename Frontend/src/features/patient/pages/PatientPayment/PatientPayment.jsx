import React, { useEffect } from 'react';
import PatientPaymentContent, { PAYMENT_CSS_VARS } from '../../components/PatientPayment/PatientPayment';

const PatientPayment = () => {
  useEffect(() => {
    document.title = 'Payment | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Choose a payment method and complete your appointment booking.');
    }
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-[#111827] rounded-[22px] p-6 md:p-12 font-roboto" style={PAYMENT_CSS_VARS}>
      <PatientPaymentContent />
    </main>
  );
};

export default PatientPayment;
