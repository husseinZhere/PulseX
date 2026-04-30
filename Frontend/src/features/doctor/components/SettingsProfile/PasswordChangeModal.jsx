import { useMemo, useState } from 'react';
import { LuCheck, LuEye, LuEyeOff, LuLock, LuShieldCheck, LuX } from 'react-icons/lu';
import { changePassword } from '../../../../services/patientService';

const checkReqs = (value) => ({
  length: value.length >= 8,
  mixed: /[a-z]/.test(value) && /[A-Z]/.test(value),
  number: /\d/.test(value),
});

const PasswordField = ({ label, value, onChange, show, onToggle, placeholder }) => {
  return (
    <div className="mb-3.5">
      <label className="mb-1 block text-[12px] font-semibold text-[#374151]">{label}</label>
      <div className="flex items-center gap-2 rounded-full border border-[#D1D5DB] bg-white dark:bg-[#111827] px-3 py-2 transition-colors focus-within:border-[#333CF5]">
        <LuLock className="text-[13px] text-[#9CA3AF]" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[12px] text-black-main-text dark:text-[#E2E8F0] outline-none text-[#111827] dark:text-gray-100 placeholder:text-[#9CA3AF]"
        />
        <button
          type="button"
          onClick={onToggle}
          className="cursor-pointer text-[#9CA3AF] transition-colors hover:text-[#6B7280]"
          aria-label="Toggle password visibility"
        >
          {show ? <LuEyeOff className="text-[13px]" /> : <LuEye className="text-[13px]" />}
        </button>
      </div>
    </div>
  );
};

const ReqItem = ({ met, text }) => (
  <li className={`flex items-center gap-1.5 text-[10px] ${met ? 'text-[#16A34A]' : 'text-[#6B7280]'}`}>
    <LuCheck className={`text-[11px] ${met ? 'text-[#22C55E]' : 'text-[#D1D5DB]'}`} />
    <span>{text}</span>
  </li>
);

const PasswordChangeModal = ({ isOpen, onClose, onSuccess }) => {
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwError, setPwError] = useState('');

  const reqs = useMemo(() => checkReqs(pwForm.newPw), [pwForm.newPw]);

  if (!isOpen) return null;

  const closeModal = () => {
    setPwForm({ current: '', newPw: '', confirm: '' });
    setShowPw({ current: false, newPw: false, confirm: false });
    setPwError('');
    onClose();
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
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
        confirmPassword: pwForm.confirm,
      });
      closeModal();
      onSuccess();
    } catch (err) {
      setPwError(err?.response?.data?.message || err?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="cursor-pointer fixed inset-0 z-[1200] flex items-center justify-center bg-black/45 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Change password modal"
    >
      <section className="relative w-full max-w-[470px] rounded-[16px] bg-white dark:bg-[#111827] p-5 shadow-2xl dark:shadow-none">
        <button
          type="button"
          onClick={closeModal}
          className="cursor-pointer absolute right-4 top-4 text-[#6B7280] transition-colors hover:text-black-main-text dark:text-[#E2E8F0]"
          aria-label="Close"
        >
          <LuX className="text-[16px]" />
        </button>

        <h2 className="text-[36px] leading-tight font-bold text-black-main-text dark:text-[#E2E8F0]">Change Password</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">Update your password securely</p>

        <section className="mt-4">
          {pwError ? (
            <div className="mb-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2] dark:bg-[#1E293B] px-3 py-2 text-[11px] text-[#B91C1C]">
              {pwError}
            </div>
          ) : null}

          <PasswordField
            label="Current Password"
            value={pwForm.current}
            onChange={(value) => setPwForm((state) => ({ ...state, current: value }))}
            show={showPw.current}
            onToggle={() => setShowPw((state) => ({ ...state, current: !state.current }))}
            placeholder="Enter current password"
          />
          <PasswordField
            label="New Password"
            value={pwForm.newPw}
            onChange={(value) => setPwForm((state) => ({ ...state, newPw: value }))}
            show={showPw.newPw}
            onToggle={() => setShowPw((state) => ({ ...state, newPw: !state.newPw }))}
            placeholder="Enter new password"
          />
          <PasswordField
            label="Confirm New Password"
            value={pwForm.confirm}
            onChange={(value) => setPwForm((state) => ({ ...state, confirm: value }))}
            show={showPw.confirm}
            onToggle={() => setShowPw((state) => ({ ...state, confirm: !state.confirm }))}
            placeholder="Confirm new password"
          />

          <div className="mt-2 rounded-xl bg-[#F9FAFB] dark:bg-[#0B1120] p-3">
            <p className="mb-2 text-[10px] font-semibold text-[#4B5563]">Password Requirements:</p>
            <ul className="space-y-1">
              <ReqItem met={reqs.length} text="At least 8 characters long" />
              <ReqItem met={reqs.mixed} text="Contains uppercase and lowercase letters" />
              <ReqItem met={reqs.number} text="Contains at least one number" />
            </ul>
          </div>

          <div className="mt-4 flex gap-2.5">
            <button
              type="button"
              onClick={closeModal}
              className="cursor-pointer h-10 flex-1 rounded-full border border-[#D1D5DB] bg-[#F3F4F6] text-[12px] font-semibold text-[#6B7280] transition-colors hover:bg-[#E5E7EB] dark:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="cursor-pointer flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#333CF5] text-[12px] font-semibold text-white shadow-[0_8px_18px_rgba(51,60,245,0.35)] transition-colors hover:bg-[#2C34D8]"
            >
              <LuShieldCheck className="text-[13px]" />
              Save Password
            </button>
          </div>
        </section>
      </section>
    </div>
  );
};

export default PasswordChangeModal;
