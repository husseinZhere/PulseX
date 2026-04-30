// src/schemas/forgotPasswordSchema.js
import * as Yup from 'yup';
import { MdOutlineError } from "react-icons/md";
import React from 'react';

const errorMsg = (msg) => (
  <div className="flex items-center gap-1 text-red-500 text-[11px] mt-1.5 ml-3 font-medium animate-fade-in">
    <MdOutlineError size={13} />
    {msg}
  </div>
);

export const emailStageSchema = Yup.object().shape({
  email: Yup.string()
    .email(errorMsg("Invalid email address"))
    .required(errorMsg("Email is required"))
});

export const otpStageSchema = Yup.object().shape({
  otp: Yup.string()
    .matches(/^[0-9]{6}$/, errorMsg("Must be exactly 6 digits"))
    .required(errorMsg("OTP is required"))
});

export const resetPasswordStageSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, errorMsg("At least 8 characters"))
    .required(errorMsg("Password is required")),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], errorMsg("Passwords must match"))
    .required(errorMsg("Please confirm your password"))
});