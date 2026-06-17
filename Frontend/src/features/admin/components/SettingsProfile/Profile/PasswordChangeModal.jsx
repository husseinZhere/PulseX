import { useState } from 'react';
import { LuCheck, LuEye, LuEyeOff, LuLock, LuShieldCheck } from 'react-icons/lu';
import { changePassword } from '../../../../../services/patientService';

function checkReqs(value) {
  return {
    length: value.length >= 8,
    mixed: /[a-z]/.test(value) && /[A-Z]/.test(value),
    number: /\d/.test(value),
  };
}

export default function PasswordChangeModal({ isOpen, onClose, onSuccess }) {
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  const reqs = checkReqs(pwForm.newPw);

  const closeModal = () => {
    setPwForm({ current: '', newPw: '', confirm: '' });
    setPwError('');
    setShowPw({ current: false, newPw: false, confirm: false });
    onClose();
  };

  const [saving, setSaving] = useState(false);

  const handleSavePassword = async () => {
    if (!pwForm.current) {
      setPwError('Please enter your current password.');
      return;
    }
    if (!reqs.length || !reqs.mixed || !reqs.number) {
      setPwError('New password does not meet requirements.');
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await changePassword({
        currentPassword: pwForm.current,
        newPassword: pwForm.newPw,
        confirmNewPassword: pwForm.confirm,
      });
      closeModal();
      onSuccess();
    } catch (err) {
      setPwError(err?.response?.data?.message || err?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <div
        className="relative mx-4 w-full max-w-md rounded-3xl bg-white dark:bg-[#111827] p-7 shadow-2xl"
        style={{ animation: 'pwSlideIn .28s ease' }}
        role="dialog"
        aria-modal="true"
        aria-label="Change password"
      >
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 cursor-pointer rounded-lg p-1 text-gray-400 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-[#1E293B] hover:text-gray-700 dark:hover:text-gray-100"
        >
          ✕
        </button>

        <h2 className="mb-0.5 text-[18px] font-bold text-black-main-text dark:text-[#E2E8F0]">Change Password</h2>
        <p className="mb-5 text-[12px] text-gray-400">Update your password securely</p>

        {pwError ? (
          <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 text-[12px] text-red-600 dark:text-red-300">
            {pwError}
          </div>
        ) : null}

        <PasswordField
          label="Current Password"
          placeholder="Enter current password"
          value={pwForm.current}
          show={showPw.current}
          onToggle={() => setShowPw((state) => ({ ...state, current: !state.current }))}
          onChange={(value) => setPwForm((state) => ({ ...state, current: value }))}
        />
        <PasswordField
          label="New Password"
          placeholder="Enter new password"
          value={pwForm.newPw}
          show={showPw.newPw}
          onToggle={() => setShowPw((state) => ({ ...state, newPw: !state.newPw }))}
          onChange={(value) => setPwForm((state) => ({ ...state, newPw: value }))}
        />
        <PasswordField
          label="Confirm New Password"
          placeholder="Confirm new password"
          value={pwForm.confirm}
          show={showPw.confirm}
          onToggle={() => setShowPw((state) => ({ ...state, confirm: !state.confirm }))}
          onChange={(value) => setPwForm((state) => ({ ...state, confirm: value }))}
        />

        <div className="mt-3 mb-5 rounded-2xl bg-gray-50 dark:bg-[#0B1120] p-4">
          <p className="mb-2 text-[12px] font-bold text-gray-700 dark:text-gray-200">Password Requirements:</p>
          <ul className="space-y-1.5">
            <ReqItem met={reqs.length} text="At least 8 characters long" />
            <ReqItem met={reqs.mixed} text="Contains uppercase and lowercase letters" />
            <ReqItem met={reqs.number} text="Contains at least one number" />
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={closeModal}
            className="flex-1 cursor-pointer rounded-2xl border border-gray-200 dark:border-gray-700 py-3 text-[13px] font-semibold text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-[#1E293B]"
          >
            Cancel
          </button>
          <button
            onClick={handleSavePassword}
            disabled={saving}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand-main py-3 text-[13px] font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            <LuShieldCheck size={16} /> {saving ? 'Saving…' : 'Save Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordField({ label, placeholder, value, show, onToggle, onChange }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[14px] font-semibold text-[#364153] dark:text-gray-300">{label}</label>
      <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0B1120] px-3.5 py-2.5 transition-colors focus-within:border-[#155DFC]">
        <LuLock size={14} className="shrink-0 text-gray-400 dark:text-gray-500" />
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-[14px] text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
        />
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 cursor-pointer text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-300"
        >
          {show ? <LuEyeOff size={14} /> : <LuEye size={14} />}
        </button>
      </div>
    </div>
  );
}

function ReqItem({ met, text }) {
  return (
    <li className={`flex items-center gap-2 text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
      <LuCheck size={13} className={met ? 'text-green-500' : 'text-gray-300'} />
      {text}
    </li>
  );
}