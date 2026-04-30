import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const exportPatientsToExcel = async (patients) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Patients");

  sheet.columns = [
    { header: "Full Name", key: "fullName", width: 30 },
    { header: "Email", key: "email", width: 35 },
    { header: "Phone", key: "phone", width: 20 },
    { header: "Age", key: "age", width: 10 },
    { header: "Gender", key: "gender", width: 12 },
  ];

  patients.forEach((patient) => sheet.addRow(patient));

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "PulseX_Patients.xlsx");
};

export default exportPatientsToExcel;
