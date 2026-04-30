import { QRCodeSVG } from 'qrcode.react';

const QRCodeCard = ({ qrRef, userData, onDownload }) => {
  const safeQrValue = userData.qrCodeValue
    || (typeof window !== 'undefined' ? `${window.location.origin}/patient/qr` : 'https://pulsex.local/patient/qr');

  return (
    <article className="bg-white dark:bg-[#111827] w-full max-w-[360px] lg:w-[350px] rounded-[22px] border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center gap-5">
      <div ref={qrRef} className="p-4 bg-gray-50 dark:bg-[#0F172A] rounded-[16px] border border-gray-100 dark:border-gray-700">
        <QRCodeSVG
          value={safeQrValue}
          size={212}
          bgColor="#ffffff"
          fgColor="#010218"
          level="M"
          marginSize={4}
          aria-label={`QR code for ${userData.name}`}
        />
      </div>

      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2 text-[20px] font-medium text-black-main-text dark:text-[#E2E8F0]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            role="img"
            aria-label="Calendar icon"
          >
            <path d="M29.5833 6.55833V4.375C29.5833 4.04348 29.4516 3.72554 29.2172 3.49112C28.9828 3.2567 28.6649 3.125 28.3333 3.125C28.0018 3.125 27.6839 3.2567 27.4494 3.49112C27.215 3.72554 27.0833 4.04348 27.0833 4.375V6.45833H12.9167V4.375C12.9167 4.04348 12.785 3.72554 12.5506 3.49112C12.3161 3.2567 11.9982 3.125 11.6667 3.125C11.3351 3.125 11.0172 3.2567 10.7828 3.49112C10.5484 3.72554 10.4167 4.04348 10.4167 4.375V6.55833C8.55888 6.85881 6.8684 7.80992 5.64718 9.24181C4.42596 10.6737 3.75353 12.4931 3.75 14.375V28.9583C3.75 29.998 3.95477 31.0274 4.35262 31.9879C4.75047 32.9484 5.33361 33.8211 6.06874 34.5563C7.5534 36.0409 9.56704 36.875 11.6667 36.875H28.3333C29.373 36.875 30.4024 36.6702 31.3629 36.2724C32.3234 35.8745 33.1961 35.2914 33.9313 34.5563C34.6664 33.8211 35.2495 32.9484 35.6474 31.9879C36.0452 31.0274 36.25 29.998 36.25 28.9583V14.375C36.2465 12.4931 35.574 10.6737 34.3528 9.24181C33.1316 7.80992 31.4411 6.85881 29.5833 6.55833ZM33.75 16.4583H6.25V14.375C6.25164 13.1585 6.66399 11.9782 7.42023 11.0253C8.17648 10.0724 9.23232 9.40284 10.4167 9.125V11.0417C10.4167 11.3732 10.5484 11.6911 10.7828 11.9256C11.0172 12.16 11.3351 12.2917 11.6667 12.2917C11.9982 12.2917 12.3161 12.16 12.5506 11.9256C12.785 11.6911 12.9167 11.3732 12.9167 11.0417V8.95833H27.0833V11.0417C27.0833 11.3732 27.215 11.6911 27.4494 11.9256C27.6839 12.16 28.0018 12.2917 28.3333 12.2917C28.6649 12.2917 28.9828 12.16 29.2172 11.9256C29.4516 11.6911 29.5833 11.3732 29.5833 11.0417V9.125C30.7677 9.40284 31.8235 10.0724 32.5798 11.0253C33.336 11.9782 33.7484 13.1585 33.75 14.375V16.4583Z" fill="#333CF5" />
          </svg>
          <span>Generated on: {userData.generatedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-[20px] font-medium text-black-main-text dark:text-[#E2E8F0]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            role="img"
            aria-label="Files icon"
          >
            <path d="M15 30.0002H6.66667V16.6668H15V30.0002ZM11.6667 26.6668V20.0002H10V26.6668H11.6667ZM21.6667 26.6668V13.3335H20V26.6668H21.6667ZM25 30.0002H16.6667V10.0002H25V30.0002ZM31.6667 26.6668V6.66683H30V26.6668H31.6667ZM35 30.0002H26.6667V3.3335H35V30.0002ZM36.6667 36.6668H5V33.3335H36.6667V36.6668Z" fill="#333CF5" />
          </svg>
          <span>Total Files: {userData.totalFiles}</span>
        </div>
      </div>

      <button
        className="w-full bg-brand-main cursor-pointer hover:bg-[#2830d4] text-white font-bold rounded-full py-2.5 m-2 text-[14px] transition-colors"
        onClick={onDownload}
      >
        Download PDF
      </button>
    </article>
  );
};

export default QRCodeCard;
