import React from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi2';

const FieldError = ({ msg, textClassName = 'text-red-500' }) =>
  msg ? (
    <span className={`flex items-center gap-1.5 text-[14px] font-normal mt-1 ${textClassName}`}>
      <HiOutlineExclamationCircle className="text-[15px] shrink-0" />
      {msg}
    </span>
  ) : null;

export default FieldError;
