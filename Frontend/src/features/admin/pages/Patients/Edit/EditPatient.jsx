import { useEffect } from 'react';
import EditPatientView from '../../../components/Patients/EditPatient/EditPatient';

export default function EditPatientPage() {
  useEffect(() => {
    document.title = 'Edit Patient | PulseX Admin';
    const metaName = 'description';
    let meta = document.querySelector(`meta[name="${metaName}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', metaName);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Edit patient profile details and account information in the admin panel.');
  }, []);

  return (
    <main aria-label="Edit patient page" className="h-full">
      <EditPatientView />
    </main>
  );
}
