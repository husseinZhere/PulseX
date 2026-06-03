import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DoctorAbout from '../../components/DoctorProfile/DoctorAbout';
import DoctorExperience from '../../components/DoctorProfile/DoctorExperience';
import DoctorHero from '../../components/DoctorProfile/DoctorHero';
import DoctorStats from '../../components/DoctorProfile/DoctorStats';
import PatientRatingModal from '../../components/PatientRatingModal/PatientRatingModal';
import {
  getDoctorProfileForPatient,
  getDoctorProfilePublic,
  canChatWithDoctor,
  getPendingRatings,
  submitDoctorRating,
} from '../../../../services/doctorService';
import { resolveFileUrl } from '../../../../utils/api';

const formatApptDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return (
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
    ' at ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
};

const withDrPrefix = (name) => {
  if (!name) return '';
  const t = name.trim();
  return /^dr\.?\s/i.test(t) ? t : `DR. ${t}`;
};

const parseExperience = (doctor) => {
  const items = [];
  if (doctor.education) {
    items.push({
      icon: '🎓',
      title: 'Education',
      place: '',
      desc: doctor.education,
    });
  }
  if (doctor.professionalExperience) {
    try {
      const parsed = typeof doctor.professionalExperience === 'string'
        ? JSON.parse(doctor.professionalExperience)
        : doctor.professionalExperience;
        
      if (Array.isArray(parsed)) {
        parsed.forEach((exp) => {
          items.push({
            icon: '🏥',
            title: exp.title || 'Experience',
            place: `${exp.institution || ''} • ${exp.startDate || ''}${
              exp.endDate ? ' - ' + exp.endDate : ' - Present'
            }`,
            desc: exp.description || '',
          });
        });
      }
    } catch {
      items.push({
        icon: '🏥',
        title: 'Professional Experience',
        place: '',
        desc: String(doctor.professionalExperience),
      });
    }
  }
  if (doctor.certifications) {
    items.push({
      icon: '📜',
      title: 'Certifications',
      place: '',
      desc: doctor.certifications,
    });
  }
  return items;
};

const PatientDoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAppointment, setHasAppointment] = useState(false);
  const [pendingForThisDoctor, setPendingForThisDoctor] = useState(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  useEffect(() => {
    document.title = 'Doctor Profile | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'View doctor profile details, ratings, and experience.');
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        let profile = null;
        try {
          profile = await getDoctorProfileForPatient(id);
        } catch {
          profile = await getDoctorProfilePublic(id);
        }
        const chatResp = await canChatWithDoctor(id).catch(() => null);
        const pendingList = await getPendingRatings().catch(() => []);
        if (ignore) return;

        // Pick the most recent un-rated completed appointment with THIS doctor
        const docIdNum = Number(id);
        const eligible = Array.isArray(pendingList)
          ? pendingList.find((p) => Number(p.doctorId) === docIdNum)
          : null;
        setPendingForThisDoctor(eligible || null);
        setDoctor({
          name: withDrPrefix(profile.fullName || profile.name || 'Doctor'),
          title: profile.specialization || 'Doctor',
          rate: profile.averageRating || 0,
          reviews: profile.totalRatings || 0,
          price: profile.consultationPrice || 0,
          loc: profile.clinicLocation || '',
          patients: profile.totalPatients > 0 ? `${profile.totalPatients}` : '—',
          exp: profile.yearsOfExperience ? `${profile.yearsOfExperience}+ Years` : '—',
          img: resolveFileUrl(profile.profilePicture || ''),
          bio: profile.bio || '',
          languages: profile.languages || '',
          availableHours: profile.availableHours || '',
          experience: parseExperience(profile),
        });
        setHasAppointment(Boolean(chatResp?.canChat));
      } catch (err) {
        console.error('Load doctor profile failed', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-400">
        Loading doctor profile…
      </main>
    );
  }

  if (!doctor) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-400">
        Doctor not found.
      </main>
    );
  }

  const handleMessage = () => {
    if (hasAppointment) {
      navigate('/patient/messages', { state: { doctorId: Number(id) } });
    }
  };

  const handleWriteReview = () => {
    if (pendingForThisDoctor) setRatingModalOpen(true);
  };

  const handleReviewSubmit = async (rating, feedback) => {
    if (!pendingForThisDoctor) return;
    try {
      await submitDoctorRating({
        appointmentId: pendingForThisDoctor.appointmentId,
        rating,
        review: feedback,
      });
      // Hide the button after a successful review and reflect the new
      // average locally without forcing a full reload.
      const newCount = (doctor.reviews || 0) + 1;
      const newAvg = ((Number(doctor.rate) || 0) * (doctor.reviews || 0) + rating) / newCount;
      setDoctor((prev) => prev ? { ...prev, reviews: newCount, rate: Number(newAvg.toFixed(1)) } : prev);
      setPendingForThisDoctor(null);
    } catch (err) {
      console.error('Submit rating failed', err);
    }
  };

  return (
    <main
      className="min-h-screen"
      style={{
        "--doc-muted": "#6B7280",
        "--doc-muted-2": "#4A5565",
      }}
    >
      <DoctorHero
        doctor={{ ...doctor, hasAppointment, canReview: Boolean(pendingForThisDoctor) }}
        onBook={() => navigate(`/patient/booking/${id}`)}
        onMessage={handleMessage}
        onWriteReview={handleWriteReview}
      />

      <section className="p-4 sm:p-5" aria-label="Doctor profile details">
        <DoctorStats doctor={doctor} />
        <DoctorAbout doctor={doctor} />
        <DoctorExperience experience={doctor.experience} />
      </section>

      <PatientRatingModal
        isOpen={ratingModalOpen && !!pendingForThisDoctor}
        onClose={() => setRatingModalOpen(false)}
        onSubmit={handleReviewSubmit}
        doctor={pendingForThisDoctor ? {
          name: pendingForThisDoctor.doctorName,
          specialty: pendingForThisDoctor.doctorSpecialization,
          img: resolveFileUrl(pendingForThisDoctor.doctorProfilePicture || ''),
          appointmentDate: formatApptDate(pendingForThisDoctor.appointmentDate),
        } : null}
      />

      <footer className="sr-only">
        <p>End of doctor profile page.</p>
      </footer>
    </main>
  );
};

export default PatientDoctorProfile;
