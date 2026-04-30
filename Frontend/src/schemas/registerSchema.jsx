import * as Yup from 'yup';
import { MdOutlineError } from "react-icons/md";
import React from 'react';

// الدالة المساعدة لتوحيد شكل الخطأ
const errorMsg = (msg) => (
  <div className="flex items-center gap-1 text-red-500 text-[11px] mt-1.5 font-medium animate-fade-in">
    <MdOutlineError size={13} />
    {msg}
  </div>
);

export const registerSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, errorMsg("Name too short"))
    .required(errorMsg("First name is required")),
  
  lastName: Yup.string()
    .min(2, errorMsg("Name too short"))
    .required(errorMsg("Last name is required")),
  
  email: Yup.string()
    .email(errorMsg("Invalid email address"))
    .required(errorMsg("Email is required")),
  
phone: Yup.string()
    .required(errorMsg("Phone number is required"))
    .matches(/^01[0125][0-9]{8}$/, {
      message: errorMsg("Invalid Egyptian phone number"),
      excludeEmptyString: true
    }),
  dateOfBirth: Yup.date()
    .nullable()
    .required(errorMsg("Date of birth is required"))
    .max(new Date(), errorMsg("Invalid date")),
  
  gender: Yup.string()
    .required(errorMsg("Please select your gender")),
    
  password: Yup.string()
    .min(8, errorMsg("Minimum 8 characters"))
    .required(errorMsg("Password is required")),

  // إضافة التحقق من الـ Checkbox
  acceptTerms: Yup.boolean()
    .oneOf([true], errorMsg("You must accept the terms and conditions"))
    .required(errorMsg("Required")),
});