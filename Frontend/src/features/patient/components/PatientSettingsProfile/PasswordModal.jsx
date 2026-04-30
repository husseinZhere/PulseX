import { LuShieldCheck, LuX } from 'react-icons/lu';
import { PasswordField, ReqItem } from './FormPrimitives';

const PasswordModal = ({
  pwModal,
  setPwModal,
  pwError,
  pwForm,
  showPw,
  setShowPw,
  setPwForm,
  reqs,
  handleSavePassword,
}) => {
  if (!pwModal) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }}
      onClick={e => { if (e.target === e.currentTarget) setPwModal(false); }}
    >
      <div
        className="bg-white dark:bg-[#111827] rounded-3xl shadow-2xl w-full max-w-md mx-3 sm:mx-4 p-5 sm:p-7 relative"
        style={{ animation: 'pwSlideIn .28s ease' }}
      >
        <button
          onClick={() => setPwModal(false)}
          className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1F2937]"
        >
          <LuX size={18} />
        </button>

        <h2 className="text-xl font-extrabold text-black-main-text dark:text-[#E2E8F0] mb-0.5">Change Password</h2>
        <p className="text-gray-400 text-sm mb-5">Update your password securely</p>

        {pwError && (
          <div className="mb-4 text-xs text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/25 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">
            {pwError}
          </div>
        )}

        <PasswordField
          label="Current Password"
          placeholder="Enter current password"
          value={pwForm.current}
          show={showPw.current}
          onToggle={() => setShowPw(s => ({ ...s, current: !s.current }))}
          onChange={v => setPwForm(f => ({ ...f, current: v }))}
        />
        <PasswordField
          label="New Password"
          placeholder="Enter new password"
          value={pwForm.newPw}
          show={showPw.newPw}
          onToggle={() => setShowPw(s => ({ ...s, newPw: !s.newPw }))}
          onChange={v => setPwForm(f => ({ ...f, newPw: v }))}
        />
        <PasswordField
          label="Confirm New Password"
          placeholder="Confirm new password"
          value={pwForm.confirm}
          show={showPw.confirm}
          onToggle={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
          onChange={v => setPwForm(f => ({ ...f, confirm: v }))}
        />

        <div className="mt-3 mb-5 bg-gray-50 dark:bg-[#0F172A] rounded-2xl p-4 border border-transparent dark:border-gray-700">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Password Requirements:</p>
          <ul className="space-y-1.5">
            <ReqItem met={reqs.length} text="At least 8 characters long" />
            <ReqItem met={reqs.mixed} text="Contains uppercase and lowercase letters" />
            <ReqItem met={reqs.number} text="Contains at least one number" />
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setPwModal(false)}
            className="flex-1 py-3 rounded-2xl cursor-pointer border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSavePassword}
            className="flex-1 py-3 rounded-2xl cursor-pointer bg-brand-main text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors text-sm"
          >
            <LuShieldCheck size={16} /> Save Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
