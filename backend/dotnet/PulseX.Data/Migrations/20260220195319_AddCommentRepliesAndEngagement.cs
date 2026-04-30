using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PulseX.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCommentRepliesAndEngagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LikesCount",
                table: "StoryComments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ParentCommentId",
                table: "StoryComments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ViewsCount",
                table: "Stories",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_StoryComments_ParentCommentId",
                table: "StoryComments",
                column: "ParentCommentId");

            migrationBuilder.AddForeignKey(
                name: "FK_StoryComments_StoryComments_ParentCommentId",
                table: "StoryComments",
                column: "ParentCommentId",
                principalTable: "StoryComments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StoryComments_StoryComments_ParentCommentId",
                table: "StoryComments");

            migrationBuilder.DropIndex(
                name: "IX_StoryComments_ParentCommentId",
                table: "StoryComments");

            migrationBuilder.DropColumn(
                name: "LikesCount",
                table: "StoryComments");

            migrationBuilder.DropColumn(
                name: "ParentCommentId",
                table: "StoryComments");

            migrationBuilder.DropColumn(
                name: "ViewsCount",
                table: "Stories");
        }
    }
}
