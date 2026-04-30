import React, { useRef, useState } from 'react';
import { LuCloudUpload, LuCircleCheck } from "react-icons/lu";
import { HiOutlineXMark } from "react-icons/hi2";

const PatientUploadCard = ({ title, desc, icon: Icon, onUpload }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-[22px] border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#155dfc] flex items-center justify-center shrink-0">
          <Icon className="text-white text-xl" />
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-black-main-text dark:text-[#E2E8F0]">{title}</h3>
          <p className="text-[12px] text-gray-500 mt-0.5">{desc}</p>
        </div>
      </div>

      <div
        className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:border-[#155DFC] hover:bg-blue-50/30 transition-colors"
        onClick={() => fileInputRef.current.click()}
      >
        <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#155DFC] text-xl">
          <LuCloudUpload />
        </div>
        <p className="mt-4 text-[13px] text-gray-700">Drag & drop files or <span className="text-brand-main font-semibold">Browse</span></p>
        <p className="text-[11px] text-gray-400 mt-1">Supported: JPEG, PNG</p>
      </div>

      {file && (
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-800">
          <LuCircleCheck className="text-green-500 shrink-0" />
          <div className="flex-1 overflow-hidden">
            <p className="text-[13px] font-medium truncate">{file.name}</p>
            <p className="text-[11px] text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
          <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 transition-colors">
            <HiOutlineXMark />
          </button>
        </div>
      )}

      <button
        className="bg-brand-main disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold py-2.5 text-[13px] transition-colors w-full"
        disabled={!file}
        onClick={() => onUpload(file)}
      >
        Upload
      </button>
    </div>
  );
};

export default PatientUploadCard;
