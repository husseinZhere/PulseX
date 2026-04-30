namespace PulseX.Core.DTOs.Doctor
{
    public class DoctorListRequestDto
    {
        public string? SearchTerm { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public decimal? MinRating { get; set; }
        public string? Location { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class DoctorListResponseDto
    {
        public DoctorStatisticsDto Statistics { get; set; } = new();
        public List<DoctorCardDto> Doctors { get; set; } = new();
        public PaginationDto Pagination { get; set; } = new();
    }

    public class DoctorStatisticsDto
    {
        public int TotalDoctors { get; set; }
        public int TopRatedDoctors { get; set; }
        public int ActiveNow { get; set; }
    }

    public class DoctorCardDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string? ProfilePicture { get; set; }
        public string? ClinicLocation { get; set; }
        public decimal AverageRating { get; set; }
        public int TotalRatings { get; set; }
        public decimal ConsultationPrice { get; set; }
        public int YearsOfExperience { get; set; }
        public bool IsActiveNow { get; set; }
    }

    public class PaginationDto
    {
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public int TotalItems { get; set; }
        public bool HasPrevious { get; set; }
        public bool HasNext { get; set; }
    }
}
