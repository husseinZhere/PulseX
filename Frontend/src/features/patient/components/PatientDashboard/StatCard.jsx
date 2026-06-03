const LowWave = () => (
  <svg width="101" height="65" viewBox="0 0 101 65" fill="none" className="block pointer-events-none">
    <path d="M99.5801 64.6421C94.169 50.1954 89.4171 31.915 76.4486 30.9393C60.6543 29.3206 56.225 44.9508 42.7229 43.0388C19.7846 41.313 31.0898 3.33072 0.0746655 0.997194" stroke="url(#paint0_low)" strokeWidth="2" />
    <defs><linearGradient id="paint0_low" x1="99.5801" y1="64.6421" x2="17.949" y2="-16.8972" gradientUnits="userSpaceOnUse"><stop offset="0.125" stopColor="#FFC500" stopOpacity="0" /><stop offset="0.488932" stopColor="#FFC500" /><stop offset="1" stopColor="#FFC500" stopOpacity="0" /></linearGradient></defs>
  </svg>
);

const NormalWave = () => (
  <svg width="100" height="65" viewBox="0 0 118 88" fill="none" className="block pointer-events-none">
    <path d="M0.71875 34.1851C11.4402 45.2773 23.0854 60.1481 35.3679 55.8733C50.4983 51.0617 48.3297 34.9614 61.4748 31.3325C83.1998 23.7714 87.9726 63.1119 117.347 52.8884" stroke="url(#paint0_norm)" strokeWidth="2" />
    <defs><linearGradient id="paint0_norm" x1="0.71875" y1="34.1851" x2="108.088" y2="76.4248" gradientUnits="userSpaceOnUse"><stop offset="0.125" stopColor="#00DEA3" stopOpacity="0" /><stop offset="0.488932" stopColor="#00DEA3" /><stop offset="1" stopColor="#00DEA3" stopOpacity="0" /></linearGradient></defs>
  </svg>
);

const HighWave = () => (
  <svg width="100" height="65" viewBox="0 0 119 107" fill="none" className="block pointer-events-none">
    <path d="M0.484375 61.4083C13.9804 68.8812 29.4646 79.6976 39.9606 72.0185C53.0231 62.9934 46.2419 48.2306 57.7517 40.9171C76.3167 27.3346 92.383 63.5607 117.485 45.1956" stroke="url(#paint0_high)" strokeWidth="2" />
    <defs><linearGradient id="paint0_high" x1="0.484375" y1="61.4083" x2="115.512" y2="70.4108" gradientUnits="userSpaceOnUse"><stop offset="0.125" stopColor="#F23985" stopOpacity="0" /><stop offset="0.488932" stopColor="#F23985" /><stop offset="1" stopColor="#F23985" stopOpacity="0" /></linearGradient></defs>
  </svg>
);

const StatCard = ({ label, value, unit, status, isHeartRate, icon }) => {
  const normalizedStatus = String(status || 'No Data');
  const sl = normalizedStatus.toLowerCase();
  const isNoData = sl === 'no data';

  const badgeClass = sl === 'low'
    ? 'bg-yellow-400/30 text-yellow-800 dark:bg-amber-900/40 dark:text-amber-300 outline-yellow-400/30 dark:outline-amber-700/40'
    : sl === 'high'
      ? 'bg-rose-100 text-red-900 dark:bg-rose-900/30 dark:text-rose-300 outline-red-100 dark:outline-rose-700/40'
      : isNoData
        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 outline-slate-200 dark:outline-slate-600/70'
        : 'bg-emerald-50 text-green-800 dark:bg-emerald-900/25 dark:text-emerald-300 outline-green-100 dark:outline-emerald-700/35';

  const displayValue = value === null || value === undefined || value === '' ? '--' : value;
  const showUnit = displayValue !== '--' && unit;
  const CurrentWave = isNoData
    ? null
    : sl === 'low'
      ? LowWave
      : sl === 'high'
        ? HighWave
        : NormalWave;
  const waveRight = label === 'Blood Pressure' ? '-14px' : '10.88px';

  return (
    <div className={`relative overflow-hidden h-36 rounded-3xl shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)] dark:hover:shadow-[0px_10px_24px_rgba(2,6,23,0.45)] ${isHeartRate ? 'bg-gradient-to-b from-[#333CF5] to-[#0913C3] border-transparent' : 'bg-white dark:bg-[#111827] border border-zinc-200 dark:border-gray-700'}`}>
      <div className="absolute left-[16px] top-[16px] flex flex-col z-10">
        <span className={`text-base font-semibold font-['Roboto'] tracking-tight ${isHeartRate ? 'text-white' : 'text-black-main-text dark:text-[#E2E8F0]'}`}>{label}</span>
      </div>
      <div className="absolute right-[16px] top-[12px] z-10">
        {isHeartRate ? <img src="/PatiantHeart.svg" className="size-11 object-contain" alt="heart" /> : <span className="text-xl text-black-main-text dark:text-[#E2E8F0]">{icon}</span>}
      </div>
      <div className="absolute left-[16.5px] top-[77px] z-10">
        <span className={`text-base font-bold font-['Roboto'] tracking-tight ${isHeartRate ? 'text-white' : 'text-black-main-text dark:text-[#E2E8F0]'}`}>{displayValue} </span>
        {showUnit && (
          <span className={`text-sm font-normal font-['Roboto'] tracking-tight ${isHeartRate ? 'text-white/80' : 'text-neutral-500 dark:text-gray-400'}`}>{unit}</span>
        )}
      </div>
      <div className="absolute left-[16.5px] top-[107px] z-10">
        {isHeartRate ? (
          <span className="text-xs font-normal font-['Roboto'] tracking-tight text-white">{normalizedStatus}</span>
        ) : (
          <span className={`px-2 py-0.5 rounded-[100px] inline-flex items-center text-xs font-medium font-['Roboto'] leading-5 outline outline-1 ${badgeClass}`}>{normalizedStatus}</span>
        )}
      </div>
      <div
        key={`${label}-${sl}`}
        className="absolute bottom-0 pointer-events-none"
        style={{ right: waveRight }}
      >
        {CurrentWave && <CurrentWave />}
      </div>
    </div>
  );
};

export default StatCard;
