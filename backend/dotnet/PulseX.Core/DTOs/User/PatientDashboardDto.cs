namespace PulseX.Core.DTOs.User
{
    public class PatientDashboardDto
    {
        public int UpcomingAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int TotalMedicalRecords { get; set; }
        public int TotalHealthDataEntries { get; set; }
        public string? LatestHealthMetric { get; set; }
        public List<UpcomingAppointmentInfoDto> NextAppointments { get; set; } = new List<UpcomingAppointmentInfoDto>();
        public string? AIRiskScore { get; set; }
    }

    public class UpcomingAppointmentInfoDto
    {
        public int Id { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
