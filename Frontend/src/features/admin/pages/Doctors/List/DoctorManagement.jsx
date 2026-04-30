import { useEffect } from 'react';
import DoctorManagementView from '../../../components/Doctor/DoctorManagement/DoctorManagement';

export default function DoctorManagementPage() {
	useEffect(() => {
		document.title = 'Doctor Management | PulseX Admin';
		const metaName = 'description';
		let meta = document.querySelector(`meta[name="${metaName}"]`);
		if (!meta) {
			meta = document.createElement('meta');
			meta.setAttribute('name', metaName);
			document.head.appendChild(meta);
		}
		meta.setAttribute('content', 'Manage doctor accounts, update profiles, and maintain doctor records from the admin panel.');
	}, []);

	return (
		<main aria-label="Doctor management page" className="h-full">
			<DoctorManagementView />
		</main>
	);
}