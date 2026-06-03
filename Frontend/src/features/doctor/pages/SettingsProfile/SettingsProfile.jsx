import { useEffect, useMemo, useState } from 'react';
import ConfirmModal from '../../../admin/components/ConfirmModal/ConfirmModal';
import AboutSection from '../../components/SettingsProfile/AboutSection';
import AccountSettingsSection from '../../components/SettingsProfile/AccountSettingsSection';
import PasswordChangeModal from '../../components/SettingsProfile/PasswordChangeModal';
import PersonalInfoSection from '../../components/SettingsProfile/PersonalInfoSection';
import ProfessionalExperienceSection from '../../components/SettingsProfile/ProfessionalExperienceSection';
import SettingsHeader from '../../components/SettingsProfile/SettingsHeader';
import { useTheme } from '../../../../context/ThemeContext';
import { readProfilePhoto, writeProfilePhoto } from '../../../../utils/profilePhotoStorage';
import Toast from '../../../../components/Toast/Toast';
import {
  getDoctorSelfProfile,
  updateDoctorSelfProfile,
  uploadDoctorProfilePicture,
} from '../../../../services/doctorService';
import { resolveFileUrl } from '../../../../utils/api';

const INITIAL_FORM = {
  photo: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dob: '',
  location: '',
  experienceYears: '',
  gender: 'male',
};

const INITIAL_EXPERIENCES = [];

const SettingsProfile = () => {
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    photo: readProfilePhoto('doctor') || INITIAL_FORM.photo,
  }));
  const [about, setAbout] = useState('');
  const [experiences, setExperiences] = useState(INITIAL_EXPERIENCES);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const { isDark, toggleTheme } = useTheme();
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, title: '', message: '', type: 'success' });

  useEffect(() => {
    document.title = 'Settings & Profile | PulseX Doctor';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Doctor settings page to manage profile details, professional experience, and account preferences.');
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const profile = await getDoctorSelfProfile();
        if (ignore || !profile) return;
        const [firstName, ...rest] = (profile.fullName || '').split(' ');
        setForm((prev) => ({
          ...prev,
          firstName: firstName || prev.firstName,
          lastName: rest.join(' ') || prev.lastName,
          email: profile.email || prev.email,
          phone: profile.phoneNumber || prev.phone,
          dob: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : prev.dob,
          location: profile.clinicLocation || prev.location,
          experienceYears: profile.yearsOfExperience != null
            ? String(profile.yearsOfExperience)
            : prev.experienceYears,
          gender: (profile.gender || prev.gender || '').toLowerCase() || prev.gender,
          photo: resolveFileUrl(profile.profilePicture || '') || prev.photo,
        }));
        setAbout(profile.bio || '');
        if (profile.professionalExperience) {
          try {
            const parsed = typeof profile.professionalExperience === 'string'
              ? JSON.parse(profile.professionalExperience)
              : profile.professionalExperience;
              
            if (Array.isArray(parsed) && parsed.length) {
              setExperiences(parsed.map((exp, idx) => ({
                id: idx + 1,
                type: exp.type || 'work',
                typeLabel: exp.type === 'education' ? 'Education' : 'Work',
                institution: exp.institution || '',
                position: exp.title || exp.position || '',
                startDate: exp.startDate ? String(exp.startDate) : '',
                endDate: exp.endDate ? String(exp.endDate) : 'Present',
                description: exp.description || '',
              })));
            }
          } catch {
            // keep default
          }
        }
      } catch (err) {
        console.error('Load doctor profile failed', err);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  const handleSaveProfile = async () => {
    try {
      await updateDoctorSelfProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phone,
        dateOfBirth: form.dob,
        gender: form.gender,
        clinicLocation: form.location,
        yearsOfExperience: Number(String(form.experienceYears).replace(/\D/g, '')) || 0,
        bio: about,
        professionalExperience: experiences.map((e) => ({
          type: e.type,
          institution: e.institution,
          title: e.position,
          startDate: e.startDate,
          endDate: e.endDate,
          description: e.description,
        })),
      });
      showToast('Saved Successfully', 'Your changes have been saved successfully.');
    } catch (err) {
      showToast('Save Failed', err?.response?.data?.message || 'Please try again.');
    }
  };

  const handlePhotoUploaded = async (photoDataUrl, fileObject) => {
    writeProfilePhoto('doctor', photoDataUrl);

    if (fileObject instanceof File) {
      try {
        const response = await uploadDoctorProfilePicture(fileObject);
        const serverPhoto = response?.profilePicture || response?.data?.profilePicture || response?.photoUrl || '';
        const resolvedPhoto = resolveFileUrl(serverPhoto);

        if (resolvedPhoto) {
          setForm((state) => ({ ...state, photo: resolvedPhoto }));
          writeProfilePhoto('doctor', resolvedPhoto);
        }
      } catch (err) {
        console.error('Upload doctor photo failed', err);
        showToast('Upload Failed', err?.response?.data?.message || 'Could not upload this photo. Please try again.');
        return;
      }
    }

    showToast('Photo Updated', 'Your profile photo has been changed successfully.');
  };

  const canDeleteExperience = useMemo(() => experiences.length > 1, [experiences.length]);

  const showToast = (title, message, type = 'success') => {
    setToast({ visible: true, title, message, type });
    setTimeout(() => setToast((state) => ({ ...state, visible: false })), 3500);
  };

  const handleAddExperience = () => {
    const nextId = experiences.length ? Math.max(...experiences.map((item) => item.id)) + 1 : 1;
    setExperiences((state) => [
      ...state,
      {
        id: nextId,
        type: 'work',
        typeLabel: 'Work',
        institution: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
      },
    ]);
  };

  const handleChangeExperience = (id, field, value) => {
    setExperiences((state) =>
      state.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleDeleteExperience = () => {
    if (!canDeleteExperience) return;
    setExperiences((state) => state.filter((item) => item.id !== pendingDeleteId));
    setPendingDeleteId(null);
    showToast('Deleted Successfully', 'Experience entry has been removed successfully.');
  };

  return (
    <main className="min-h-full p-6 sm:p-8" aria-label="Doctor settings and profile page">
      <Toast
        visible={toast.visible}
        title={toast.title}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((state) => ({ ...state, visible: false }))}
      />

      <ConfirmModal
        isOpen={pendingDeleteId !== null}
        title="Delete Experience?"
        desc="Are you sure you want to delete this experience item?"
        onConfirm={handleDeleteExperience}
        onCancel={() => setPendingDeleteId(null)}
      />

      <PasswordChangeModal
        isOpen={pwModalOpen}
        onClose={() => setPwModalOpen(false)}
        onSuccess={() => showToast('Password Changed Successfully', 'Your changes have been saved successfully.')}
      />

      <section className="flex w-full flex-col gap-5">
        <SettingsHeader />

        <section className="flex flex-col gap-5">
          <PersonalInfoSection
            form={form}
            setForm={setForm}
            onPhotoUploaded={handlePhotoUploaded}
            onPhotoError={(title, msg) => showToast(title, msg, 'error')}
            onSave={handleSaveProfile}
          />

          <AboutSection
            value={about}
            onChange={setAbout}
            onSave={handleSaveProfile}
          />

          <ProfessionalExperienceSection
            experiences={experiences}
            onAdd={handleAddExperience}
            onChange={handleChangeExperience}
            onDeleteRequest={(id) => {
              if (canDeleteExperience) setPendingDeleteId(id);
            }}
            onSave={handleSaveProfile}
          />

          <AccountSettingsSection
            onOpenPassword={() => setPwModalOpen(true)}
          />
        </section>
      </section>
    </main>
  );
};

export default SettingsProfile;
