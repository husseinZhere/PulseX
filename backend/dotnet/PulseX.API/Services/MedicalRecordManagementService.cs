using PulseX.Core.DTOs.MedicalRecord;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;
using QRCoder;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace PulseX.API.Services
{
    public class MedicalRecordManagementService
    {
        private readonly IMedicalRecordRepository _medicalRecordRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<MedicalRecordManagementService> _logger;
        private readonly string _uploadPath;
        private readonly string _webRoot;

        private static readonly string[] ValidRecordTypes = { "ECG", "X-Ray", "Medical File" };

        public MedicalRecordManagementService(
            IMedicalRecordRepository medicalRecordRepository,
            IPatientRepository patientRepository,
            IWebHostEnvironment environment,
            ILogger<MedicalRecordManagementService> logger)
        {
            _medicalRecordRepository = medicalRecordRepository;
            _patientRepository = patientRepository;
            _environment = environment;
            _logger = logger;

            // WebRootPath is null when no wwwroot folder exists; fall back to ContentRootPath
            _webRoot = string.IsNullOrEmpty(_environment.WebRootPath)
                ? _environment.ContentRootPath
                : _environment.WebRootPath;

            // Setup upload directory, creating it automatically if it does not exist
            _uploadPath = Path.Combine(_webRoot, "uploads", "medical-records");
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        public async Task<MedicalRecordListDto> UploadMedicalRecordAsync(int userId, string recordType, IFormFile file, string? notes)
        {
            // Validate patient using UserId (not PatientId)
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            // Validate record type
            if (!ValidRecordTypes.Contains(recordType))
            {
                throw new Exception("Invalid record type. Must be 'ECG', 'X-Ray', or 'Medical File'");
            }

            // Validate file
            if (file == null || file.Length == 0)
            {
                throw new Exception("File is required");
            }

            // Validate file type (images and PDFs only)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                throw new Exception("Only image files (JPG, PNG) and PDF files are allowed");
            }

            // Validate file size (max 10MB)
            if (file.Length > 10 * 1024 * 1024)
            {
                throw new Exception("File size must not exceed 10MB");
            }

            // Create unique filename
            var uniqueFileName = $"{recordType}_{patient.Id}_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(_uploadPath, uniqueFileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Create database record
            var medicalRecord = new MedicalRecord
            {
                PatientId = patient.Id,
                RecordType = recordType,
                FileName = file.FileName,
                FilePath = $"/uploads/medical-records/{uniqueFileName}",
                FileType = file.ContentType,
                FileSize = file.Length,
                Notes = notes,
                UploadedAt = DateTime.UtcNow
            };

            await _medicalRecordRepository.AddAsync(medicalRecord);

            _logger.LogInformation($"Medical record uploaded: {recordType} for Patient {patient.Id}");

            return new MedicalRecordListDto
            {
                Id = medicalRecord.Id,
                RecordType = medicalRecord.RecordType,
                FileName = medicalRecord.FileName,
                FilePath = medicalRecord.FilePath,
                FileType = medicalRecord.FileType,
                FileSize = medicalRecord.FileSize,
                FileSizeFormatted = FormatFileSize(medicalRecord.FileSize),
                Notes = medicalRecord.Notes,
                UploadedAt = medicalRecord.UploadedAt,
                UpdatedAt = medicalRecord.UpdatedAt
            };
        }

        public async Task<MedicalRecordsSummaryDto> GetAllRecordsAsync(int userId)
        {
            // Get patient using UserId
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            var records = await _medicalRecordRepository.GetByPatientIdAsync(patient.Id);
            var recordsList = records.ToList(); // Convert to list first

            var recordsDtoList = recordsList.OrderByDescending(r => r.UploadedAt).Select(r => new MedicalRecordListDto
            {
                Id = r.Id,
                RecordType = r.RecordType,
                FileName = r.FileName,
                FilePath = r.FilePath,
                FileType = r.FileType,
                FileSize = r.FileSize,
                FileSizeFormatted = FormatFileSize(r.FileSize),
                Notes = r.Notes,
                UploadedAt = r.UploadedAt,
                UpdatedAt = r.UpdatedAt
            }).ToList();

            return new MedicalRecordsSummaryDto
            {
                TotalRecords = recordsList.Count,
                EcgRecords = recordsList.Count(r => r.RecordType == "ECG"),
                XRayRecords = recordsList.Count(r => r.RecordType == "X-Ray"),
                MedicalFileRecords = recordsList.Count(r => r.RecordType == "Medical File"),
                LastUpdated = recordsList.Any() ? recordsList.Max(r => r.UpdatedAt ?? r.UploadedAt) : null,
                Records = recordsDtoList
            };
        }

        // Doctor access — patientId is Patient.Id (not User.Id)
        public async Task<MedicalRecordsSummaryDto> GetAllRecordsByPatientIdAsync(int patientId)
        {
            var records = await _medicalRecordRepository.GetByPatientIdAsync(patientId);
            var recordsList = records.OrderByDescending(r => r.UploadedAt).ToList();

            var recordsDtoList = recordsList.Select(r => new MedicalRecordListDto
            {
                Id = r.Id,
                RecordType = r.RecordType,
                FileName = r.FileName,
                FilePath = r.FilePath,
                FileType = r.FileType,
                FileSize = r.FileSize,
                FileSizeFormatted = FormatFileSize(r.FileSize),
                Notes = r.Notes,
                UploadedAt = r.UploadedAt,
                UpdatedAt = r.UpdatedAt
            }).ToList();

            return new MedicalRecordsSummaryDto
            {
                TotalRecords = recordsList.Count,
                EcgRecords = recordsList.Count(r => r.RecordType == "ECG"),
                XRayRecords = recordsList.Count(r => r.RecordType == "X-Ray"),
                MedicalFileRecords = recordsList.Count(r => r.RecordType == "Medical File"),
                LastUpdated = recordsList.Any() ? recordsList.Max(r => r.UpdatedAt ?? r.UploadedAt) : null,
                Records = recordsDtoList
            };
        }

        public async Task<List<MedicalRecordListDto>> GetRecordsByTypeAsync(int userId, string recordType)
        {
            if (!ValidRecordTypes.Contains(recordType))
            {
                throw new Exception("Invalid record type. Must be 'ECG', 'X-Ray', or 'Medical File'");
            }

            // Get patient using UserId
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            var records = await _medicalRecordRepository.GetByPatientIdAsync(patient.Id);
            var filteredRecords = records.Where(r => r.RecordType == recordType).OrderByDescending(r => r.UploadedAt);

            return filteredRecords.Select(r => new MedicalRecordListDto
            {
                Id = r.Id,
                RecordType = r.RecordType,
                FileName = r.FileName,
                FilePath = r.FilePath,
                FileType = r.FileType,
                FileSize = r.FileSize,
                FileSizeFormatted = FormatFileSize(r.FileSize),
                Notes = r.Notes,
                UploadedAt = r.UploadedAt,
                UpdatedAt = r.UpdatedAt
            }).ToList();
        }

        public async Task DeleteRecordAsync(int userId, int recordId)
        {
            // Get patient using UserId
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            var record = await _medicalRecordRepository.GetByIdAsync(recordId);
            if (record == null)
            {
                throw new Exception("Record not found");
            }

            if (record.PatientId != patient.Id)
            {
                throw new Exception("Unauthorized: This record does not belong to you");
            }

            // Delete physical file
            try
            {
                var fullPath = Path.Combine(_webRoot, record.FilePath.TrimStart('/'));
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Failed to delete physical file: {ex.Message}");
            }

            // Delete database record
            await _medicalRecordRepository.DeleteAsync(record.Id);

            _logger.LogInformation($"Medical record deleted: ID {recordId} for Patient {patient.Id}");
        }

        public async Task<GenerateQRCodeDto> GenerateQRCodeAsync(int userId, string baseUrl)
        {
            // Get patient using UserId
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            var records = await _medicalRecordRepository.GetByPatientIdAsync(patient.Id);
            var recordsList = records.ToList(); // Convert to list
            var lastUpdate = recordsList.Any() ? recordsList.Max(r => r.UpdatedAt ?? r.UploadedAt) : DateTime.UtcNow;

            // Generate URL that doctor can access
            var recordsUrl = $"{baseUrl}/api/MedicalRecords/view/{patient.Id}";

            // Generate QR Code using QRCoder (Cross-platform)
            using var qrGenerator = new QRCodeGenerator();
            var qrCodeData = qrGenerator.CreateQrCode(recordsUrl, QRCodeGenerator.ECCLevel.Q);
            
            // Use PngByteQRCode for cross-platform compatibility
            using var qrCode = new PngByteQRCode(qrCodeData);
            var qrCodeBytes = qrCode.GetGraphic(20);
            var base64Image = Convert.ToBase64String(qrCodeBytes);

            _logger.LogInformation($"QR Code generated for Patient {patient.Id}");

            return new GenerateQRCodeDto
            {
                PatientId = patient.Id,
                QRCodeData = recordsUrl,
                QRCodeImageBase64 = $"data:image/png;base64,{base64Image}",
                GeneratedAt = DateTime.UtcNow,
                LastRecordUpdate = lastUpdate,
                TotalRecords = recordsList.Count
            };
        }

        public async Task<byte[]> GeneratePdfWithAllRecordsAsync(int userId)
        {
            // Get patient using UserId
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            var records = await _medicalRecordRepository.GetByPatientIdAsync(patient.Id);
            var recordsList = records.OrderBy(r => r.RecordType).ThenBy(r => r.UploadedAt).ToList();

            using var ms = new MemoryStream();
            var document = new Document(PageSize.A4, 50, 50, 50, 50);
            var writer = PdfWriter.GetInstance(document, ms);
            
            document.Open();

            // Title
            var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18, new BaseColor(0, 0, 0));
            var title = new Paragraph($"Medical Records - {patient.User?.FullName ?? "Patient"}", titleFont);
            title.Alignment = Element.ALIGN_CENTER;
            title.SpacingAfter = 20;
            document.Add(title);

            // Generated date
            var dateFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, new BaseColor(128, 128, 128));
            var dateText = new Paragraph($"Generated on: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC", dateFont);
            dateText.Alignment = Element.ALIGN_CENTER;
            dateText.SpacingAfter = 30;
            document.Add(dateText);

            // Summary
            var summaryFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12, new BaseColor(0, 0, 0));
            document.Add(new Paragraph("Summary", summaryFont));
            document.Add(new Paragraph($"Total Files: {recordsList.Count}"));
            document.Add(new Paragraph($"ECG Files: {recordsList.Count(r => r.RecordType == "ECG")}"));
            document.Add(new Paragraph($"X-Ray Files: {recordsList.Count(r => r.RecordType == "X-Ray")}"));
            document.Add(new Paragraph($"Medical Files: {recordsList.Count(r => r.RecordType == "Medical File")}"));

            // Group by type
            var ecgRecords = recordsList.Where(r => r.RecordType == "ECG").ToList();
            var xrayRecords = recordsList.Where(r => r.RecordType == "X-Ray").ToList();
            var medicalFileRecords = recordsList.Where(r => r.RecordType == "Medical File").ToList();

            // ECG Section
            if (ecgRecords.Any())
            {
                document.NewPage(); // Start new page for ECG section
                document.Add(new Paragraph("ECG Records", summaryFont));
                document.Add(new Paragraph(" "));
                
                for (int i = 0; i < ecgRecords.Count; i++)
                {
                    if (i > 0)
                    {
                        document.NewPage(); // New page for each record after first
                    }
                    await AddImageToPdf(document, ecgRecords[i]);
                }
            }

            // X-Ray Section
            if (xrayRecords.Any())
            {
                document.NewPage(); // Start new page for X-Ray section
                document.Add(new Paragraph("X-Ray Records", summaryFont));
                document.Add(new Paragraph(" "));
                
                for (int i = 0; i < xrayRecords.Count; i++)
                {
                    if (i > 0)
                    {
                        document.NewPage(); // New page for each record after first
                    }
                    await AddImageToPdf(document, xrayRecords[i]);
                }
            }

            // Medical File Section
            if (medicalFileRecords.Any())
            {
                document.NewPage(); // Start new page for Medical File section
                document.Add(new Paragraph("Other Medical Files", summaryFont));
                document.Add(new Paragraph(" "));
                
                for (int i = 0; i < medicalFileRecords.Count; i++)
                {
                    if (i > 0)
                    {
                        document.NewPage(); // New page for each record after first
                    }
                    await AddImageToPdf(document, medicalFileRecords[i]);
                }
            }

            document.Close();
            writer.Close();

            _logger.LogInformation($"PDF generated for Patient {patient.Id} with {recordsList.Count} records");

            return ms.ToArray();
        }

        // Doctor access — generates PDF using Patient.Id directly
        public async Task<byte[]> GeneratePdfByPatientIdAsync(int patientId)
        {
            var records = await _medicalRecordRepository.GetByPatientIdAsync(patientId);
            var recordsList = records.OrderBy(r => r.RecordType).ThenBy(r => r.UploadedAt).ToList();

            using var ms = new MemoryStream();
            var document = new Document(PageSize.A4, 50, 50, 50, 50);
            var writer = PdfWriter.GetInstance(document, ms);
            document.Open();

            var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18, new BaseColor(0, 0, 0));
            var title = new Paragraph($"Medical Records - Patient #{patientId}", titleFont);
            title.Alignment = Element.ALIGN_CENTER;
            title.SpacingAfter = 20;
            document.Add(title);

            var dateFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, new BaseColor(128, 128, 128));
            var dateText = new Paragraph($"Generated on: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC", dateFont);
            dateText.Alignment = Element.ALIGN_CENTER;
            dateText.SpacingAfter = 30;
            document.Add(dateText);

            var summaryFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12, new BaseColor(0, 0, 0));
            document.Add(new Paragraph("Summary", summaryFont));
            document.Add(new Paragraph($"Total Files: {recordsList.Count}"));
            document.Add(new Paragraph($"ECG Files: {recordsList.Count(r => r.RecordType == "ECG")}"));
            document.Add(new Paragraph($"X-Ray Files: {recordsList.Count(r => r.RecordType == "X-Ray")}"));
            document.Add(new Paragraph($"Medical Files: {recordsList.Count(r => r.RecordType == "Medical File")}"));

            foreach (var group in new[] { "ECG", "X-Ray", "Medical File" })
            {
                var grouped = recordsList.Where(r => r.RecordType == group).ToList();
                if (!grouped.Any()) continue;
                document.NewPage();
                document.Add(new Paragraph($"{group} Records", summaryFont));
                document.Add(new Paragraph(" "));
                for (int i = 0; i < grouped.Count; i++)
                {
                    if (i > 0) document.NewPage();
                    await AddImageToPdf(document, grouped[i]);
                }
            }

            document.Close();
            writer.Close();
            return ms.ToArray();
        }

        private async Task AddImageToPdf(Document document, MedicalRecord record)
        {
            try
            {
                var fullPath = Path.Combine(_webRoot, record.FilePath.TrimStart('/'));
                
                // Add record info
                var infoFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, new BaseColor(64, 64, 64));
                document.Add(new Paragraph($"File: {record.FileName}", infoFont));
                document.Add(new Paragraph($"Uploaded: {record.UploadedAt:yyyy-MM-dd HH:mm}", infoFont));
                if (!string.IsNullOrEmpty(record.Notes))
                {
                    document.Add(new Paragraph($"Notes: {record.Notes}", infoFont));
                }
                document.Add(new Paragraph(" "));

                // Add image if it's an image file
                if (record.FileType?.StartsWith("image/") == true && File.Exists(fullPath))
                {
                    var imageBytes = await File.ReadAllBytesAsync(fullPath);
                    var image = Image.GetInstance(imageBytes);
                    
                    // Scale image to fit page
                    float maxWidth = document.PageSize.Width - 100;
                    float maxHeight = document.PageSize.Height - 250;
                    
                    if (image.Width > maxWidth || image.Height > maxHeight)
                    {
                        image.ScaleToFit(maxWidth, maxHeight);
                    }
                    
                    image.Alignment = Element.ALIGN_CENTER;
                    document.Add(image);
                }
                else if (record.FileType == "application/pdf")
                {
                    document.Add(new Paragraph($"[PDF File: {record.FileName} - Cannot embed in this report]", infoFont));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to add image to PDF: {ex.Message}");
                document.Add(new Paragraph($"[Error loading image: {record.FileName}]"));
            }
        }

        private string FormatFileSize(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB" };
            double len = bytes;
            int order = 0;
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }
            return $"{len:0.##} {sizes[order]}";
        }
    }
}
