import * as Yup from 'yup';
import { MdOutlineError } from "react-icons/md"; // تأكدي إن الحروف Capital و Small بالظبط كدة
import React from 'react'; // مهم جداً لأننا بنستخدم JSX هنا

// دالة مساعدة (Helper Function) لتوحيد شكل رسائل الخطأ
const errorMsg = (msg) => (
  <div className="flex items-center gap-1 text-error text-[12px] mt-1 font-medium">
    <MdOutlineError size={14} />
    {msg}
  </div>
);

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email(errorMsg("Invalid email address"))
    .required(errorMsg("Email address is required")),
  password: Yup.string()
    .min(8, errorMsg("Password must be at least 8 characters"))
    .required(errorMsg("Password is required / Incorrect email address or password")),
});