import { useEffect } from 'react';
import PatientManagementView from '../../../components/Patients/PatientManagement/PatientManagement';

export default function PatientManagementPage() {
  useEffect(() => {
    document.title = 'Patient Management | PulseX Admin';
    const metaName = 'description';
    let meta = document.querySelector(`meta[name="${metaName}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', metaName);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Manage patient profiles, records, and account details from the admin panel.');
  }, []);

  return (
    <main aria-label="Patient management page" className="h-full">
      <PatientManagementView />
    </main>
  );
}
