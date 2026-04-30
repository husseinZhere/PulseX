import { useEffect } from 'react';
import AddDoctorView from '../../../components/Doctor/AddDoctorBtn/AddDoctorBtn';

export default function AddDoctorPage() {
	useEffect(() => {
		document.title = 'Add Doctor | PulseX Admin';
		const metaName = 'description';
		let meta = document.querySelector(`meta[name="${metaName}"]`);
		if (!meta) {
			meta = document.createElement('meta');
			meta.setAttribute('name', metaName);
			document.head.appendChild(meta);
		}
		meta.setAttribute('content', 'Add a new doctor profile with complete professional and contact information.');
	}, []);

	return (
		<main aria-label="Add doctor page" className="h-full">
			<AddDoctorView />
		</main>
	);
}