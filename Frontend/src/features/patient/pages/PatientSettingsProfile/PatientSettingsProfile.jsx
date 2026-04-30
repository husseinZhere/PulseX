import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeartPulse } from 'react-icons/fa6';
import { LuActivity, LuDroplet, LuPencil, LuRuler, LuShieldPlus } from 'react-icons/lu';
import ConfirmModal from '../../../admin/components/ConfirmModal/ConfirmModal';
import Toast from '../../../../components/Toast/Toast';
import usePatientData from '../../../../PatientHooks/usePatientData';
import {
  checkReqs,
  formatWithUnit,
  getInitialFormFromPatient,
  getStoriesWithFallback,
} from '../../components/PatientSettingsProfile/constants';
import AccountSettingsSection from '../../components/PatientSettingsProfile/AccountSettingsSection';
import HealthInfoSection from '../../components/PatientSettingsProfile/HealthInfoSection';
import PasswordModal from '../../components/PatientSettingsProfile/PasswordModal';
import PersonalInfoSection from '../../components/PatientSettingsProfile/PersonalInfoSection';
import SettingsHeader from '../../components/PatientSettingsProfile/SettingsHeader';
import StoriesSection from '../../components/PatientSettingsProfile/StoriesSection';
import { readProfilePhoto, writeProfilePhoto } from '../../../../utils/profilePhotoStorage';
import { useAuth } from '../../../../context/AuthContext';
import {
  getUserProfile,
  updateUserProfile,
  uploadUserProfilePicture,
  updateAccountSettings,
} from '../../../../services/patientService';
import { resolveFileUrl } from '../../../../utils/api';

const PHOTO_UID_KEY = 'pulsex-profile-photo-patient-uid';

const savePatientPhoto = (photo, userId) => {
  writeProfilePhoto('patient', photo);
  if (userId) localStorage.setItem(PHOTO_UID_KEY, String(userId));
};

export default function PatientSettingsProfile() {
  const { patient } = usePatientData();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Settings & Profile | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Manage your profile, health information, security, and account preferences.');
    }
  }, []);

  const [toast, setToast] = useState({ visible: false, title: '', msg: '' });
  const showToast = (title, msg) => {
    setToast({ visible: true, title, msg });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  };

  const fileRef = useRef(null);
  const [photo, setPhoto] = useState(() => readProfilePhoto('patient') || null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const nextPhoto = reader.result;
      setPhoto(nextPhoto);
      savePatientPhoto(nextPhoto, user?.userId);
    };
    reader.readAsDataURL(file);

    uploadUserProfilePicture(file)
      .then(() => showToast('Photo Updated', 'Your profile photo has been changed successfully.'))
      .catch((err) => showToast('Upload Failed', err?.response?.data?.message || 'Please try again.'));

    e.target.value = '';
  };

  const [form, setForm] = useState(() => getInitialFormFromPatient(patient));
  const handleField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const profile = await getUserProfile();
        if (ignore || !profile) return;
        const [firstName, ...rest] = (profile.fullName || '').split(' ');
        setForm((prev) => ({
          ...prev,
          firstName: firstName || prev.firstName,
          lastName: rest.join(' ') || prev.lastName,
          email: profile.email || prev.email,
          phone: profile.phoneNumber || prev.phone,
          dob: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : prev.dob,
          location: profile.location || prev.location || '',
          gender: profile.gender ? (profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1).toLowerCase()) : prev.gender,
          about: profile.about || prev.about || '',
        }));
        if (profile.profilePicture) {
          const url = resolveFileUrl(profile.profilePicture);
          setPhoto(url);
          savePatientPhoto(url, user?.userId);
        }
      } catch (err) {
        console.error('Load patient profile failed', err);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile({
        firstName: form.firstName?.trim() || '',
        lastName: form.lastName?.trim() || '',
        phoneNumber: form.phone?.trim() || null,
        dateOfBirth: form.dob?.trim() ? form.dob : null,
        gender: form.gender || null,
        location: form.location?.trim() || null,
        about: form.about?.trim() || null,
      });
      showToast('Saved Successfully', 'Your profile has been updated successfully.');
    } catch (err) {
      showToast('Save Failed', err?.response?.data?.message || 'Please try again.');
    }
  };

  const [pwModal, setPwModal] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const reqs = checkReqs(pwForm.newPw);

  const handleSavePassword = async () => {
    if (!pwForm.current) { setPwError('Please enter your current password.'); return; }
    if (!reqs.length || !reqs.mixed || !reqs.number) { setPwError('New password does not meet requirements.'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }

    try {
      const { changePassword } = await import('../../../../services/patientService');
      await changePassword({
        currentPassword: pwForm.current,
        newPassword: pwForm.newPw,
        confirmPassword: pwForm.confirm,
      });
      setPwModal(false);
      setPwForm({ current: '', newPw: '', confirm: '' });
      setPwError('');
      showToast('Password Changed', 'Your password has been updated successfully.');
    } catch (err) {
      setPwError(err?.response?.data?.message || err?.message || 'Failed to change password');
    }
  };

  const [emailNotif, setEmailNotif] = useState(Boolean(patient?.settings?.emailNotifications ?? true));
  const [darkMode, setDarkMode] = useState(Boolean(patient?.settings?.darkMode ?? false));

  const [stories, setStories] = useState(() => getStoriesWithFallback(patient));
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    // Only update auxiliary data from patient context, don't overwrite the main form which is managed by getUserProfile.
    setStories(getStoriesWithFallback(patient));
    setEmailNotif(Boolean(patient?.settings?.emailNotifications ?? true));
    setDarkMode(Boolean(patient?.settings?.darkMode ?? false));
  }, [patient]);

  const handleDeleteStory = () => {
    setStories(s => s.filter(x => x.id !== deleteTarget));
    setDeleteTarget(null);
    showToast('Story Deleted', 'Your story has been removed successfully.');
  };

  const v = patient?.vitals;
  const bloodPressureDisplay =
    v?.bloodPressure?.display
    ?? ((v?.bloodPressure?.systolic && v?.bloodPressure?.diastolic)
      ? `${v.bloodPressure.systolic}/${v.bloodPressure.diastolic}`
      : '--/--');

  const healthCards = [
    { label: 'Height', value: formatWithUnit(v?.height?.value ?? patient?.height, v?.height?.unit ?? 'cm'), icon: <LuRuler /> },
    { label: 'Weight', value: formatWithUnit(v?.weight?.value ?? patient?.weight, v?.weight?.unit ?? 'kg'), icon: <LuActivity /> },
    { label: 'Blood Pressure', value: bloodPressureDisplay, icon: <LuDroplet /> },
    { label: 'Blood Sugar', value: formatWithUnit(v?.bloodSugar?.value, v?.bloodSugar?.unit ?? 'mg/dL'), icon: <LuPencil /> },
    { label: 'Cholesterol', value: formatWithUnit(v?.cholesterol?.value, v?.cholesterol?.unit ?? 'mg/dL'), icon: <LuShieldPlus /> },
    { label: 'Blood Count', value: formatWithUnit(v?.bloodCount?.value, v?.bloodCount?.unit ?? '%'), icon: <LuActivity /> },
    { label: 'Heart Rate', value: formatWithUnit(v?.heartRate?.value, v?.heartRate?.unit ?? 'bpm'), icon: <FaHeartPulse /> },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6 font-roboto px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
      <Toast
        visible={toast.visible}
        title={toast.title}
        message={toast.msg}
        type="success"
        onClose={() => setToast(t => ({ ...t, visible: false }))}
      />

      <SettingsHeader />

      <main className="flex flex-col gap-4 sm:gap-6">
        <section aria-labelledby="settings-personal-heading">
          <PersonalInfoSection
            form={form}
            fileRef={fileRef}
            photo={photo}
            handlePhotoChange={handlePhotoChange}
            handleField={handleField}
            handleSaveProfile={handleSaveProfile}
          />
        </section>

        <section aria-labelledby="settings-health-heading">
          <HealthInfoSection healthCards={healthCards} navigate={navigate} />
        </section>

        <section aria-labelledby="settings-stories-heading">
          <StoriesSection stories={stories} navigate={navigate} setDeleteTarget={setDeleteTarget} />
        </section>

        <aside aria-labelledby="settings-account-heading">
          <AccountSettingsSection
            setPwError={setPwError}
            setPwModal={setPwModal}
            emailNotif={emailNotif}
            setEmailNotif={setEmailNotif}
          />
        </aside>
      </main>

      <footer className="sr-only">
        <p>Settings page footer</p>
      </footer>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Delete Story?"
        desc="Are you sure you want to delete this story? This action cannot be undone."
        onConfirm={handleDeleteStory}
        onCancel={() => setDeleteTarget(null)}
      />

      <PasswordModal
        pwModal={pwModal}
        setPwModal={setPwModal}
        pwError={pwError}
        pwForm={pwForm}
        showPw={showPw}
        setShowPw={setShowPw}
        setPwForm={setPwForm}
        reqs={reqs}
        handleSavePassword={handleSavePassword}
      />

      <style>{`
        @keyframes pwSlideIn {
          from { transform: translateY(-18px) scale(.97); opacity: 0; }
          to   { transform: translateY(0)     scale(1);   opacity: 1; }
        }
        .line-clamp-1 { overflow:hidden; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; }
        .line-clamp-2 { overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
      `}</style>
    </div>
  );
}
