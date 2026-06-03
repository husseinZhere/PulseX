import * as Yup from "yup";

const MIN_DOB = new Date("1900-01-01");
// Patient must be at least 13 years old
const maxDobPatient = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 13);
  return d;
};

const EGYPTIAN_PHONE = /^01[0125][0-9]{8}$/;

export const createPatientValidationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .matches(EGYPTIAN_PHONE, "Must be a valid Egyptian number (e.g. 01012345678)")
    .required("Phone number is required"),
  dateOfBirth: Yup.date()
    .nullable()
    .required("Date of birth is required")
    .max(maxDobPatient(), "Patient must be at least 13 years old")
    .min(MIN_DOB, "Invalid date of birth"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  gender: Yup.string().required("Gender is required"),
});

export const editPatientValidationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .matches(EGYPTIAN_PHONE, "Must be a valid Egyptian number (e.g. 01012345678)")
    .required("Phone number is required"),
  dateOfBirth: Yup.date()
    .nullable()
    .required("Date of birth is required")
    .max(maxDobPatient(), "Patient must be at least 13 years old")
    .min(MIN_DOB, "Invalid date of birth"),
  password: Yup.string().min(8, "At least 8 characters"),
  gender: Yup.string().required("Gender is required"),
});
