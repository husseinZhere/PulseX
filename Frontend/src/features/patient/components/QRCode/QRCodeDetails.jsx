import { RiCheckFill } from 'react-icons/ri';

const QRCodeDetails = ({ items }) => {
  return (
    <div className="flex w-full max-w-[360px] lg:w-[350px] flex-col gap-4">
      <article className="bg-white dark:bg-[#111827] w-full lg:w-[320px] rounded-[22px] border border-gray-100 dark:border-gray-800 shadow-sm p-5">
        <h3 className="text-[20px] font-bold text-black-main-text dark:text-[#E2E8F0] mb-3">What's inside your QR Code?</h3>
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2 text-[16px] text-gray-700 dark:text-gray-300">
              <RiCheckFill className="text-[#00BC86] text-base shrink-0" aria-label={`${item} included`} />
              {item}
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
};

export default QRCodeDetails;
