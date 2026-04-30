import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const exportDoctorsToExcel = async (doctors) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Doctors");

  sheet.columns = [
    { header: "Full Name", key: "fullName", width: 30 },
    { header: "Email", key: "email", width: 35 },
    { header: "Age", key: "age", width: 10 },
    { header: "Location", key: "location", width: 25 },
    { header: "Price ($)", key: "price", width: 15 },
    { header: "Joined Date", key: "joinedDate", width: 20 },
  ];

  doctors.forEach((doctor) => sheet.addRow(doctor));

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "PulseX_Doctors.xlsx");
};

export default exportDoctorsToExcel;
