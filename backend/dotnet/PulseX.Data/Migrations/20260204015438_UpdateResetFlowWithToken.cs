using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PulseX.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateResetFlowWithToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ResetToken",
                table: "PasswordResetTokens",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResetTokenExpiresAt",
                table: "PasswordResetTokens",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PasswordResetTokens_ResetToken",
                table: "PasswordResetTokens",
                column: "ResetToken");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PasswordResetTokens_ResetToken",
                table: "PasswordResetTokens");

            migrationBuilder.DropColumn(
                name: "ResetToken",
                table: "PasswordResetTokens");

            migrationBuilder.DropColumn(
                name: "ResetTokenExpiresAt",
                table: "PasswordResetTokens");
        }
    }
}
