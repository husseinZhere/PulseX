import { useEffect } from 'react';
import EditDoctorView from '../../../components/Doctor/EditDoctor/EditDoctor';

export default function EditDoctorPage() {
	useEffect(() => {
		document.title = 'Edit Doctor | PulseX Admin';
		const metaName = 'description';
		let meta = document.querySelector(`meta[name="${metaName}"]`);
		if (!meta) {
			meta = document.createElement('meta');
			meta.setAttribute('name', metaName);
			document.head.appendChild(meta);
		}
		meta.setAttribute('content', 'Edit doctor profile details, credentials, and account information in the admin panel.');
	}, []);

	return (
		<main aria-label="Edit doctor page" className="h-full">
			<EditDoctorView />
		</main>
	);
}