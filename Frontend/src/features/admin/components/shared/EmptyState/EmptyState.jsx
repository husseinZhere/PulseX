import React from 'react';
import { FiPlus } from 'react-icons/fi';

/**
 * EmptyState
 *
 * Props:
 *  - pageIcon      ReactNode   icon shown next to the page title  (optional)
 *  - pageTitle     string      bold heading top-left  e.g. "Patient Management"
 *  - pageSubtitle  string      small grey line below heading       e.g. "View, edit, and manage all registered patients."
 *  - imgSrc        string      illustration src
 *  - title         string      big centered title   e.g. "No Patients Found"
 *  - description   string      centered description paragraph
 *  - buttonLabel   string      button text          e.g. "Add Patient"
 *  - onAction      function    button onClick
 */
const EmptyState = ({
  pageIcon,
  pageTitle,
  pageSubtitle,
  imgSrc,
  imgClassName,
  title,
  description,
  buttonLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col bg-white dark:bg-[#111827] w-full min-h-[80vh]">

      {/* ── Page Header ─────────────────────────────────────── */}
      {(pageTitle || pageSubtitle) && (
        <div className=" pb-4 ">
          {/* Title row */}
          <div className="flex items-center gap-2 mb-1">
            {pageIcon && (
              <span className=" text-[#101828] dark:text-[#E2E8F0]">
                {pageIcon}
              </span>
            )}
            <h1
              className="text-[#101828] dark:text-[#E2E8F0] font-bold leading-tight m-0"
              style={{ fontSize: 24 }}
            >
              {pageTitle}
            </h1>
          </div>

          {/* Subtitle */}
          {pageSubtitle && (
            <p
              className="text-[#757575] dark:text-gray-400 font-normal leading-snug m-0"
              style={{ fontSize: 18 }}
            >
              {pageSubtitle}
            </p>
          )}
        </div>
      )}

      {/* ── Empty State Body ────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center text-center p-10 flex-1">

        {/* Illustration */}
        <div className="w-[220px] mb-8">
          <img
            src={imgSrc}
            alt="No Data"
            className={`w-full h-auto object-contain ${imgClassName || ''}`}
          />
        </div>

        {/* Title */}
        <h3 className="text-[#101828] dark:text-[#E2E8F0] font-bold mb-3 m-0" style={{ fontSize: 28 }}>
          {title}
        </h3>

        {/* Description */}
        <p
          className="text-[#6B7280] dark:text-gray-400 max-w-[400px] mb-10 leading-relaxed font-normal m-0"
          style={{ fontSize: 18 }}
        >
          {description}
        </p>

        {/* Button */}
        {buttonLabel && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 px-10 py-3 bg-[#333CF5] text-white rounded-full font-bold hover:bg-[#2830d4] transition-all shadow-[0_12px_28px_rgba(51,60,245,0.28)] dark:shadow-[0_14px_30px_rgba(30,64,175,0.35)] cursor-pointer border-none"
            style={{ fontSize: 16 }}
          >
            <FiPlus size={18} />
            {buttonLabel}
          </button>
        )}
      </div>

    </div>
  );
};

export default EmptyState;


/* ─────────────────────────────────────────────────────────────
   USAGE EXAMPLE  (Patient Management page)
   ─────────────────────────────────────────────────────────────

import EmptyState       from './EmptyState';
import { PiUsersFourLight } from 'react-icons/pi';
import noPatientImg     from '../../assets/images/no-patients.svg';

<EmptyState
  pageIcon={<PiUsersFourLight />}
  pageTitle="Patient Management"
  pageSubtitle="View, edit, and manage all registered patients."
  imgSrc={noPatientImg}
  title="No Patients Found"
  description="You haven't added any patients yet. Start building your patient database by adding your first patient record."
  buttonLabel="Add Patient"
  onAction={() => navigate('/patients/new')}
/>

───────────────────────────────────────────────────────────── */