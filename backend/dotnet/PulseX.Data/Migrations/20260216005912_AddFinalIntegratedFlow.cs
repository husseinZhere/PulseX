using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PulseX.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFinalIntegratedFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfilePicture",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "About",
                table: "Patients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "DarkModeEnabled",
                table: "Patients",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EmailNotificationsEnabled",
                table: "Patients",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Patients",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfilePicture",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "About",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "DarkModeEnabled",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "EmailNotificationsEnabled",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Patients");
        }
    }
}
