import { useEffect } from 'react';
import AddPatientView from '../../../components/Patients/AddPatientBtn/AddPatientBtn';

export default function AddPatientPage() {
  useEffect(() => {
    document.title = 'Add Patient | PulseX Admin';
    const metaName = 'description';
    let meta = document.querySelector(`meta[name="${metaName}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', metaName);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Add a new patient account with complete personal and contact information.');
  }, []);

  return (
    <main aria-label="Add patient page" className="h-full">
      <AddPatientView />
    </main>
  );
}
