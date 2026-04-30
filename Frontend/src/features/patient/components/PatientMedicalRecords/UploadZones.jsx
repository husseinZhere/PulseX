import { HiOutlineUpload } from 'react-icons/hi';
import { CATEGORY_CONFIG } from './constants.jsx';

const UploadZones = ({ dragOver, setDragOver, fileInputRefs, onDrop, onFileInput, brand }) => {
  const renderUploadZone = (categoryKey) => {
    const cfg = CATEGORY_CONFIG[categoryKey];
    const isActive = dragOver === categoryKey;

    return (
      <div
        key={categoryKey}
        className="bg-white dark:bg-[#111827] rounded-[22px] border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-4 transition-all w-full max-w-full"
        style={{ boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.10), 0px 1px 2px -1px rgba(0,0,0,0.10)', maxWidth: '465px' }}
      >
        <div className="flex items-start gap-3">
          <span
            className="w-12 h-12 rounded-[14px] flex items-center justify-center text-lg shrink-0"
            style={{ background: cfg.color, color: '#fff' }}
          >
            {cfg.icon}
          </span>
          <div>
            <p className="text-lg font-bold text-black-main-text dark:text-[#E2E8F0]">{cfg.label}</p>
            <p className="text-sm text-neutral-500 dark:text-gray-400 mt-0.5">{cfg.description}</p>
          </div>
        </div>

        <div
          className={`border-2 border-dashed rounded-[14px] p-8 flex flex-col items-center cursor-pointer transition-colors ${isActive ? 'border-brand-main bg-[#EEF0FF] dark:bg-[#1E293B]/45' : 'border-[#D1D5DC] dark:border-gray-700 bg-transparent'}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(categoryKey); }}
          onDragLeave={() => setDragOver(null)}
          onDrop={(e) => onDrop(e, categoryKey)}
          onClick={() => fileInputRefs.current[categoryKey]?.click()}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
            style={{ background: 'linear-gradient(135deg, #DBEAFE, #EEF2FF)' }}
          >
            <HiOutlineUpload className="text-xl" style={{ color: brand.main }} />
          </div>
          <p className="text-[13px] text-gray-700 dark:text-gray-300 text-center">
            Drag &amp; drop {cfg.label} files or{' '}
            <span className="font-bold underline" style={{ color: '#155DFC' }}>Browse</span>
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-gray-400 mt-1">Supported formats: {cfg.formats}</p>
        </div>

        <input
          type="file"
          accept={cfg.accept}
          multiple
          hidden
          ref={(el) => {
            fileInputRefs.current[categoryKey] = el;
          }}
          onChange={(e) => onFileInput(e, categoryKey)}
        />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 justify-items-center mb-12 sm:mb-16">
      <div className="w-full flex justify-center lg:justify-end">{renderUploadZone('ECG')}</div>
      <div className="w-full flex justify-center lg:justify-start">{renderUploadZone('Radiology')}</div>
      <div className="lg:col-span-2 w-full flex justify-center mt-4">
        <div className="w-full max-w-full" style={{ maxWidth: '465px' }}>{renderUploadZone('Medical File')}</div>
      </div>
    </div>
  );
};

export default UploadZones;
