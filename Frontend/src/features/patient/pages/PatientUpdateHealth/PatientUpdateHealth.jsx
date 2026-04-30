import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UpdateHealthForm from '../../components/UpdateHealth/UpdateHealthForm';
import UpdateHealthHeader from '../../components/UpdateHealth/UpdateHealthHeader';

export default function PatientUpdateHealth() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Update Health | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Update your health data and vital signs.');
    }
  }, []);

  return (
    <main
      className="flex flex-col gap-6 font-roboto p-5"
      style={{
        "--uh-muted": "#4A5565",
        "--uh-muted-2": "#6B7280",
        "--uh-muted-3": "#9CA3AF",
      }}
    >
      <UpdateHealthHeader />

      <UpdateHealthForm onSave={() => setTimeout(() => navigate('/patient/settings'), 2000)} />

      <footer className="sr-only">
        <p>End of update health page.</p>
      </footer>
    </main>
  );
}
