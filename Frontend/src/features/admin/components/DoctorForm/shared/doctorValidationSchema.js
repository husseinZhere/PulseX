import * as Yup from "yup";

const MIN_DOB = new Date("1900-01-01");
// A doctor must be at least 22 years old
const maxDobDoctor = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 22);
  return d;
};

const EGYPTIAN_PHONE = /^01[0125][0-9]{8}$/;

export const createDoctorValidationSchema = Yup.object({
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
    .max(maxDobDoctor(), "Doctor must be at least 22 years old")
    .min(MIN_DOB, "Invalid date of birth"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  location: Yup.string().required("Location is required"),
  price: Yup.number()
    .typeError("Must be a number")
    .positive("Must be positive")
    .required("Consultation price is required"),
  gender: Yup.string().required("Gender is required"),
});

export const editDoctorValidationSchema = Yup.object({
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
    .max(maxDobDoctor(), "Doctor must be at least 22 years old")
    .min(MIN_DOB, "Invalid date of birth"),
  password: Yup.string().min(8, "At least 8 characters"),
  location: Yup.string(),
  price: Yup.number()
    .typeError("Must be a number")
    .min(0, "Must be 0 or positive")
    .nullable()
    .transform((v, o) => (o === "" || o === undefined ? null : v)),
  gender: Yup.string().required("Gender is required"),
});
