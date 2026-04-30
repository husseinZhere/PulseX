import { LuCheck, LuEye, LuEyeOff, LuLock } from 'react-icons/lu';

export function InputField({ label, icon, value, onChange, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[14px] font-semibold text-[#364153] dark:text-gray-300">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="flex items-center bg-[#f9fafb] dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 gap-2.5 focus-within:border-[#155DFC] transition-colors">
        <span className="text-gray-400 dark:text-gray-500 shrink-0 text-[14px]">{icon}</span>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="bg-transparent outline-none w-full text-[14px] text-black-main-text dark:text-[#E2E8F0]"
        />
      </div>
    </div>
  );
}

export function PasswordField({ label, placeholder, value, show, onToggle, onChange }) {
  return (
    <div className="mb-4">
      <label className="text-[12px] font-semibold text-[#364153] dark:text-gray-300 mb-1.5 block">{label}</label>
      <div className="flex items-center bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 gap-2.5 focus-within:border-[#155DFC] transition-colors">
        <LuLock size={14} className="text-gray-400 shrink-0" />
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="outline-none w-full text-[13px] text-black-main-text dark:text-[#E2E8F0] bg-transparent"
        />
        <button type="button" onClick={onToggle} className="cursor-pointer text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-colors shrink-0">
          {show ? <LuEyeOff size={14} /> : <LuEye size={14} />}
        </button>
      </div>
    </div>
  );
}

export function ReqItem({ met, text }) {
  return (
    <li className={`flex items-center gap-2 text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
      <LuCheck size={12} className={met ? 'text-green-500' : 'text-gray-300'} />
      {text}
    </li>
  );
}

export function SettingRow({ icon, title, desc, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4">
      <div className="flex items-start sm:items-center gap-3">
        <span className="text-gray-400 text-lg shrink-0">{icon}</span>
        <div>
          <h3 className="font-bold text-[16px] text-black-main-text dark:text-[#E2E8F0]">{title}</h3>
          <p className="text-gray-400 dark:text-gray-500 text-[14px] mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="sm:self-auto self-start">
        {action}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
      className={`cursor-pointer relative h-6 w-11 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#155DFC]' : 'bg-[#D1D5DB] dark:bg-[#374151]'}`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}
