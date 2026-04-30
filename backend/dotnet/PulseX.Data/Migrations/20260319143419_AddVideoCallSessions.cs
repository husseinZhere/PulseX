using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PulseX.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddVideoCallSessions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VideoCallSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AppointmentId = table.Column<int>(type: "int", nullable: false),
                    SessionId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ChannelName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DoctorToken = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PatientToken = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsDoctorConnected = table.Column<bool>(type: "bit", nullable: false),
                    IsPatientConnected = table.Column<bool>(type: "bit", nullable: false),
                    DoctorJoinedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PatientJoinedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDoctorVideoEnabled = table.Column<bool>(type: "bit", nullable: false),
                    IsDoctorAudioEnabled = table.Column<bool>(type: "bit", nullable: false),
                    IsPatientVideoEnabled = table.Column<bool>(type: "bit", nullable: false),
                    IsPatientAudioEnabled = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndedByUserId = table.Column<int>(type: "int", nullable: true),
                    EndReason = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DoctorLatencyMs = table.Column<int>(type: "int", nullable: true),
                    PatientLatencyMs = table.Column<int>(type: "int", nullable: true),
                    DoctorConnectionQuality = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PatientConnectionQuality = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DurationSeconds = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VideoCallSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VideoCallSessions_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VideoCallSessions_AppointmentId",
                table: "VideoCallSessions",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_VideoCallSessions_SessionId",
                table: "VideoCallSessions",
                column: "SessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VideoCallSessions_Status_CreatedAt",
                table: "VideoCallSessions",
                columns: new[] { "Status", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VideoCallSessions");
        }
    }
}
