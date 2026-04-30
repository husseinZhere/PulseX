namespace PulseX.Core.DTOs.Doctor
{
    public class DoctorDashboardDto
    {
        // Doctor profile
        public string DoctorName { get; set; } = string.Empty;
        public string? DoctorProfilePicture { get; set; }

        // Basic Statistics
        public int TotalPatients { get; set; }
        public int CriticalCases { get; set; }
        public int UpcomingAppointments { get; set; }
        public int TodayAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public decimal PatientsGrowthPercent { get; set; }
        public decimal CriticalGrowthPercent { get; set; }
        public decimal AppointmentsGrowthPercent { get; set; }
        
        // Doctor Rating
        public decimal AverageRating { get; set; }
        public int TotalRatings { get; set; }
        
        // Financial
        public decimal EstimatedEarnings { get; set; }
        
        // Appointments
        public List<UpcomingAppointmentDto> NextAppointments { get; set; } = new List<UpcomingAppointmentDto>();
        public List<UpcomingAppointmentDto> TodayAppointmentsList { get; set; } = new List<UpcomingAppointmentDto>();
        
        // Critical Patients (based on risk assessment)
        public List<CriticalPatientDto> CriticalPatients { get; set; } = new List<CriticalPatientDto>();
        
        // Recent Messages
        public List<RecentMessageDto> RecentMessages { get; set; } = new List<RecentMessageDto>();
        
        // Weekly Overview Data
        public WeeklyOverviewDto WeeklyOverview { get; set; } = new WeeklyOverviewDto();
        
        // Empty state flags
        public bool HasData => TotalPatients > 0 || UpcomingAppointments > 0;
    }

    public class UpcomingAppointmentDto
    {
        public int Id { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string? PatientProfilePicture { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string AppointmentTime { get; set; } = string.Empty;
    }
    
    public class CriticalPatientDto
    {
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string? ProfilePicture { get; set; }
        public int Age { get; set; }
        public string RiskLevel { get; set; } = string.Empty; // "High Risk", "Moderate", "Low Risk"
        public decimal RiskScore { get; set; }
        public string? LastCondition { get; set; }
        public DateTime? LastVisit { get; set; }
        public string StatusBadge { get; set; } = string.Empty; // "High Risk", "Moderate", etc.
    }
    
    public class RecentMessageDto
    {
        public int MessageId { get; set; }
        public int AppointmentId { get; set; }
        public int PatientId { get; set; }
        public int PatientUserId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string? PatientProfilePicture { get; set; }
        public string MessagePreview { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public bool IsUnread { get; set; }
        public int UnreadCount { get; set; }
        public string TimeAgo { get; set; } = string.Empty;
    }
    
    public class WeeklyOverviewDto
    {
        public List<DailyStatsDto> DailyStats { get; set; } = new List<DailyStatsDto>();
        public int TotalPatientsThisWeek { get; set; }
        public int TotalAppointmentsThisWeek { get; set; }
        public decimal ChangePercentage { get; set; } // +51%, -20%, etc.
    }
    
    public class DailyStatsDto
    {
        public string Day { get; set; } = string.Empty; // "10am", "11am", etc.
        public int PatientsCount { get; set; }
        public int AppointmentsCount { get; set; }
    }
}
