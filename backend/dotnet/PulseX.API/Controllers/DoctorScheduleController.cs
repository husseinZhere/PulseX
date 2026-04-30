using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PulseX.API.Services;
using PulseX.Core.DTOs.Doctor;
using System.Security.Claims;

namespace PulseX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorScheduleController : ControllerBase
    {
        private readonly DoctorScheduleService _scheduleService;

        public DoctorScheduleController(DoctorScheduleService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        // ?? Doctor endpoints ????????????????????????????????????????????????

        /// <summary>
        /// Get the doctor's full schedule summary (weekly + single slots + today's view)
        /// </summary>
        [HttpGet("my-schedule")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetMySchedule()
        {
            try
            {
                var userId = GetUserId();
                var result = await _scheduleService.GetScheduleAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Save (replace) the weekly recurring schedule for the doctor
        /// </summary>
        [HttpPost("weekly")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> SaveWeeklySchedule([FromBody] SaveWeeklyScheduleDto dto)
        {
            try
            {
                var userId = GetUserId();
                var result = await _scheduleService.SaveWeeklyScheduleAsync(userId, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Add a single one-off slot for a specific date
        /// </summary>
        [HttpPost("single")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> AddSingleSlot([FromBody] AddSingleSlotDto dto)
        {
            try
            {
                var userId = GetUserId();
                var result = await _scheduleService.AddSingleSlotAsync(userId, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete a schedule slot by ID
        /// </summary>
        [HttpDelete("{slotId}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> DeleteSlot(int slotId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _scheduleService.DeleteSlotAsync(userId, slotId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ?? Patient endpoint ????????????????????????????????????????????????

        /// <summary>
        /// Get available time slots for a doctor on a given date (patient booking view)
        /// </summary>
        [HttpGet("available/{doctorId}")]
        public async Task<IActionResult> GetAvailableSlots(int doctorId, [FromQuery] DateTime date)
        {
            try
            {
                var times = await _scheduleService.GetAvailableTimesForDateAsync(doctorId, date);
                return Ok(new { date = date.Date, availableTimes = times });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ?? Helper ??????????????????????????????????????????????????????????
        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int id))
                throw new Exception("Invalid token");
            return id;
        }
    }
}
