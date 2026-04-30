namespace PulseX.Core.DTOs.Doctor
{
    public class DoctorListDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public decimal ConsultationPrice { get; set; }
        public string? ClinicLocation { get; set; }
        public int YearsOfExperience { get; set; }
        public bool IsApproved { get; set; }
        public decimal AverageRating { get; set; }
        public int TotalRatings { get; set; }
    }
}
