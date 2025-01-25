using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddedTableToFileShare : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SharedFiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FileEntityId = table.Column<int>(type: "int", nullable: false),
                    AccessCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SharedByUserId = table.Column<int>(type: "int", nullable: false),
                    AccessedByUserId = table.Column<int>(type: "int", nullable: true),
                    SharedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AccessedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SharedFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SharedFiles_Files_FileEntityId",
                        column: x => x.FileEntityId,
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SharedFiles_Users_AccessedByUserId",
                        column: x => x.AccessedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SharedFiles_Users_SharedByUserId",
                        column: x => x.SharedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SharedFiles_AccessedByUserId",
                table: "SharedFiles",
                column: "AccessedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SharedFiles_FileEntityId",
                table: "SharedFiles",
                column: "FileEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_SharedFiles_SharedByUserId",
                table: "SharedFiles",
                column: "SharedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SharedFiles");
        }
    }
}
