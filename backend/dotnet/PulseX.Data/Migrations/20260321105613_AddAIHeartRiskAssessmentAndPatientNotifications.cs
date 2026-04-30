using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PulseX.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAIHeartRiskAssessmentAndPatientNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RiskAssessments_PatientId",
                table: "RiskAssessments");

            migrationBuilder.AlterColumn<string>(
                name: "SleepHours",
                table: "RiskAssessments",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "RiskLevel",
                table: "RiskAssessments",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "PhysicalActivity",
                table: "RiskAssessments",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "CholesterolLevel",
                table: "RiskAssessments",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "AlcoholConsumption",
                table: "RiskAssessments",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<decimal>(
                name: "AIConfidenceScore",
                table: "RiskAssessments",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AIModelVersion",
                table: "RiskAssessments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AIProcessedAt",
                table: "RiskAssessments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AIRequestId",
                table: "RiskAssessments",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAIGenerated",
                table: "RiskAssessments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "KeyFactorsJson",
                table: "RiskAssessments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecommendationsJson",
                table: "RiskAssessments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RiskCategory",
                table: "RiskAssessments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PatientNotifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    RelatedRiskAssessmentId = table.Column<int>(type: "int", nullable: true),
                    RelatedAppointmentId = table.Column<int>(type: "int", nullable: true),
                    RelatedPrescriptionId = table.Column<int>(type: "int", nullable: true),
                    RiskLevel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ActionUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IconType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientNotifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientNotifications_Appointments_RelatedAppointmentId",
                        column: x => x.RelatedAppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientNotifications_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PatientNotifications_Prescriptions_RelatedPrescriptionId",
                        column: x => x.RelatedPrescriptionId,
                        principalTable: "Prescriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientNotifications_RiskAssessments_RelatedRiskAssessmentId",
                        column: x => x.RelatedRiskAssessmentId,
                        principalTable: "RiskAssessments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RiskAssessments_PatientId_AssessedAt",
                table: "RiskAssessments",
                columns: new[] { "PatientId", "AssessedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PatientNotifications_PatientId_CreatedAt",
                table: "PatientNotifications",
                columns: new[] { "PatientId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PatientNotifications_PatientId_IsRead",
                table: "PatientNotifications",
                columns: new[] { "PatientId", "IsRead" });

            migrationBuilder.CreateIndex(
                name: "IX_PatientNotifications_RelatedAppointmentId",
                table: "PatientNotifications",
                column: "RelatedAppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientNotifications_RelatedPrescriptionId",
                table: "PatientNotifications",
                column: "RelatedPrescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientNotifications_RelatedRiskAssessmentId",
                table: "PatientNotifications",
                column: "RelatedRiskAssessmentId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientNotifications_Type",
                table: "PatientNotifications",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PatientNotifications");

            migrationBuilder.DropIndex(
                name: "IX_RiskAssessments_PatientId_AssessedAt",
                table: "RiskAssessments");

            migrationBuilder.DropColumn(
                name: "AIConfidenceScore",
                table: "RiskAssessments");

            migrationBuilder.DropColumn(
                name: "AIModelVersion",
                table: "RiskAssessments");

            migrationBuilder.DropColumn(
                name: "AIProcessedAt",
                table: "RiskAssessments");

            migrationBuilder.DropColumn(
                name: "AIRequestId",
                table: "RiskAssessments");

            migrationBuilder.DropColumn(
                name: "IsAIGenerated",
                table: "RiskAssessments");

            migrationBuilder.DropColumn(
                name: "KeyFactorsJson",
                table: "RiskAssessments");

            migrationBuilder.DropColumn(
                name: "RecommendationsJson",
                table: "RiskAssessments");

            migrationBuilder.DropColumn(
                name: "RiskCategory",
                table: "RiskAssessments");

            migrationBuilder.AlterColumn<string>(
                name: "SleepHours",
                table: "RiskAssessments",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.AlterColumn<string>(
                name: "RiskLevel",
                table: "RiskAssessments",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "PhysicalActivity",
                table: "RiskAssessments",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "CholesterolLevel",
                table: "RiskAssessments",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "AlcoholConsumption",
                table: "RiskAssessments",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.CreateIndex(
                name: "IX_RiskAssessments_PatientId",
                table: "RiskAssessments",
                column: "PatientId");
        }
    }
}
