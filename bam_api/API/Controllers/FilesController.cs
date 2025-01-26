using API.Data;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace API.Controllers
{
    public class FilesController(DataContext context) : BaseApiController
    {
        private string UploadDirectory => Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        private int UserId
        {
            get
            {
                var UserIdClaim = context.Users.FirstOrDefault(x => x.UserName == User.Identity.Name).Id;
                if (UserIdClaim == null)
                    throw new UnauthorizedAccessException("401");

                return UserIdClaim;
            }
        }

        [HttpPost]
        public async Task<IActionResult> UploadFileBase64([FromBody] Base64FileUploadDto fileDto)
        {
            var allowedExtensions = new List<string> { ".jpg", ".png", ".pdf", ".docx" };

            if (fileDto == null || string.IsNullOrEmpty(fileDto.FileName) || string.IsNullOrEmpty(fileDto.Base64Content))
                return BadRequest("nie przeslano pliku");

            string fileExtension = Path.GetExtension(fileDto.FileName).ToLower();

            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest("Nieakceptowalny typ pliku");

            if (!Directory.Exists(UploadDirectory))
                Directory.CreateDirectory(UploadDirectory);

            string randomSuffix = Guid.NewGuid().ToString().Substring(0, 8);
            string fileNameWithoutExtension = Path.GetFileNameWithoutExtension(fileDto.FileName);
            fileNameWithoutExtension = fileNameWithoutExtension.Replace("%", "");
            string newFileName = $"{fileNameWithoutExtension}_{randomSuffix}{fileExtension}";

            var filePath = Path.Combine(UploadDirectory, newFileName);

            try
            {
                byte[] fileBytes = Convert.FromBase64String(fileDto.Base64Content);
                await System.IO.File.WriteAllBytesAsync(filePath, fileBytes);

                string checksum;
                using (var sha256 = SHA256.Create())
                {
                    await using var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                    var hashBytes = await sha256.ComputeHashAsync(fileStream);
                    checksum = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
                }

                var fileEntity = new FileEntity
                {
                    FileName = newFileName,
                    FilePath = filePath,
                    Checksum = checksum,
                    SizeInBytes = fileBytes.Length,
                    ContentType = fileDto.ContentType,
                    UploadedAt = DateTime.UtcNow,
                    UploadedBy = User.Identity?.Name ?? ""
                };

                context.Files.Add(fileEntity);
                await context.SaveChangesAsync();

                return Ok(new { fileEntity.Id, fileEntity.FileName, fileEntity.Checksum });
            }
            catch (FormatException)
            {
                return BadRequest("ex");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"err: {ex.Message}");
            }
        }

        //[HttpPost]
        //public async Task<IActionResult> UploadFile(IFormFile file)
        //{
        //    var allowedExtensions = new List<string> { ".jpg", ".png", ".pdf", ".docx" };
        //    string fileExtension = Path.GetExtension(file.FileName);

        //    if (!allowedExtensions.Contains(fileExtension.ToLower()))
        //        return BadRequest("Nieakceptowalny typ pliku ");

        //    if (file == null || file.Length == 0)
        //        return BadRequest("nie przesano pliku");

        //    if (!Directory.Exists(UploadDirectory))
        //        Directory.CreateDirectory(UploadDirectory);

        //    string randomSuffix = Guid.NewGuid().ToString().Substring(0, 8);
        //    string fileNameWithoutExtension = Path.GetFileNameWithoutExtension(file.FileName);
        //    fileNameWithoutExtension = fileNameWithoutExtension.Replace("%", "");
        //    string newFileName = $"{fileNameWithoutExtension}_{randomSuffix}{fileExtension}";

        //    var filePath = Path.Combine(UploadDirectory, newFileName);

        //    await using (var stream = new FileStream(filePath, FileMode.Create))
        //    {
        //        await file.CopyToAsync(stream);
        //    }

        //    string checksum;
        //    using (var sha256 = SHA256.Create())
        //    {
        //        await using var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
        //        var hashBytes = await sha256.ComputeHashAsync(fileStream);
        //        checksum = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        //    }

        //    var fileEntity = new FileEntity
        //    {
        //        FileName = newFileName,
        //        FilePath = filePath,
        //        Checksum = checksum,
        //        SizeInBytes = file.Length,
        //        ContentType = file.ContentType,
        //        UploadedAt = DateTime.UtcNow,
        //        UploadedBy = User.Identity?.Name ?? " "
        //    };

        //    context.Files.Add(fileEntity);
        //    await context.SaveChangesAsync();

        //    return Ok(new { fileEntity.Id, fileEntity.FileName, fileEntity.Checksum });
        //}

        [HttpGet]
        public async Task<IActionResult> GetFiles()
        {
            //endpoint do pobierania listy plików, również tych do których uzyskaliśmy dostęp access kodem
            //isShared == true  ->  plik zostal nam udostepniony

            var userUploadedFiles = context.Files
                .Where(x => x.UploadedBy == User.Identity.Name)
                .Select(f => new
                {
                    f.Id, 
                    f.FileName,
                    IsShared = false
                });

            var sharedWithUserFiles = context.SharedFiles
                .Where(fs => fs.AccessedByUserId == UserId && fs.FileEntity.UploadedBy != User.Identity.Name)
                .Select(fs => new
                {
                      fs.FileEntity.Id,
                      fs.FileEntity.FileName,
                      IsShared = true
                 });

            var allFiles = await userUploadedFiles
                .Union(sharedWithUserFiles)
                .ToListAsync();

            return Ok(allFiles);
        }


        [HttpPost("share/{fileId}")]
        public async Task<IActionResult> ShareFile(int fileId)
        {

            //metodka do udsotepniania pliku. Zwraca access code

            var file = await context.Files.FirstOrDefaultAsync(f => f.Id == fileId && f.UploadedBy == User.Identity.Name);


            if (file == null)
                return NotFound("nie znaleziono");

            var fileShare = new SharedFiles
            {
                FileEntityId = fileId,
                SharedByUserId = UserId
            };

            context.SharedFiles.Add(fileShare);
            await context.SaveChangesAsync();

            return Ok(new { AccessCode = fileShare.AccessCode });
        }

        [HttpGet("shared/{accessCode}")]
        public async Task<IActionResult> GetSharedFile(string accessCode)
        {

            //Metodka do przypisywania udostepnionego pliku po access code
            //nie bardzo wiedzialem co ma sie dziac po podaniu kodu (od razu pobieranie pliku?) wiec zwracam jego nazwe. Moze bedzie wyswietlany widok podobny do listy plikow, ale tylko z tym jednym?

            var fileShare = await context.SharedFiles
                .Include(fs => fs.FileEntity)
                .FirstOrDefaultAsync(fs => fs.AccessCode == accessCode);

            if (fileShare == null)
                return NotFound("Niepoprawny kod");

            fileShare.AccessedByUserId = context.Users.FirstOrDefault(x => x.UserName == User.Identity.Name).Id;

            fileShare.AccessedAt = DateTime.UtcNow;
            await context.SaveChangesAsync();

            var filePath = fileShare.FileEntity.FilePath;

            if (!System.IO.File.Exists(filePath))
                return NotFound("nie znaleziono");

            var memory = new MemoryStream();
            await using (var stream = new FileStream(filePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            return Ok(fileShare.FileEntity.FileName);
        }


        [HttpGet("{fileId}")]
        public async Task<IActionResult> GetFileDetails(int fileId)
        {
            //pobieranie szczegolow pliku.
            //sprawdza czy plik o danym id istnieje w glownej tabeli Files lub w udostepnionch [dla nas]

            var file = await context.Files
                .FirstOrDefaultAsync(f => f.Id == fileId);

            if (file == null)
            {
                return NotFound("nei znaleziono");
            }

            if (file.UploadedBy == User.Identity.Name)
            {
                return Ok(new
                {
                    file.Id,
                    file.FileName,
                    file.SizeInBytes,
                    file.ContentType,
                    Date = file.UploadedAt.ToString("yyyy-MM-dd"),
                    Hour = file.UploadedAt.ToString("HH:mm:ss"),
                    IsOwner = true,
                    Owner = file.UploadedBy

                });
            }

            var isSharedWithUser = await context.SharedFiles
                .AnyAsync(fs =>
                    fs.FileEntityId == fileId &&
                    (fs.AccessedByUserId == UserId || fs.AccessedByUserId == null));

            if (!isSharedWithUser)
            {
                //jak tu wejdzie to znaczy ze user nie ma do niego permisji
                return NotFound("nie znaleziono");
            }

            return Ok(new
            {
                file.Id,
                file.FileName,
                file.SizeInBytes,
                file.ContentType,
                Date = file.UploadedAt.ToString("yyyy-MM-dd"),
                Hour = file.UploadedAt.ToString("HH:mm:ss"),
                IsOwner = false,
                Owner = file.UploadedBy
            });
        }

        [HttpGet("download/{fileId}")]
        public async Task<IActionResult> DownloadFile(int fileId)
        {

            var file = await context.Files
                .FirstOrDefaultAsync(f => f.Id == fileId);

            if (file == null)
            {
                return NotFound("Nie znaleziono");
            }

            var isOwner = file.UploadedBy == User.Identity.Name;
            var isSharedWithUser = await context.SharedFiles.AnyAsync(fs =>
                fs.FileEntityId == fileId &&
                (fs.AccessedByUserId == UserId || fs.AccessedByUserId == null));

            if (!isOwner && !isSharedWithUser)
            {
                return NotFound("Nie znaleziono");
            }

            var filePath = file.FilePath;
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Nie znaleziono");
            }

            var memory = new MemoryStream();
            await using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            return File(memory, file.ContentType, file.FileName);
        }







        //---------------------------
        //nie wiem jak w react bedzie najlepiej/najlatwiej pobrac plik wiec ponizej alternatywne metody pobierania pliku czyli base64 xD
        //---------------------------

        #region download
        [HttpGet("download-base64/{fileId}")]
        public async Task<IActionResult> DownloadFileAsBase64(int fileId)
        {
            var file = await context.Files.FirstOrDefaultAsync(f => f.Id == fileId);
            if (file == null)
            {
                return NotFound("Nie znaleziono");
            }

            var isOwner = file.UploadedBy == User.Identity.Name;
            var isSharedWithUser = await context.SharedFiles.AnyAsync(fs =>
                fs.FileEntityId == fileId &&
                (fs.AccessedByUserId == UserId || fs.AccessedByUserId == null));

            if (!isOwner && !isSharedWithUser)
            {
                return NotFound("Nie znaleziono");
            }

            var filePath = file.FilePath;
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Nie znaleziono");
            }

            byte[] fileBytes;
            await using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
            {
                using (var memoryStream = new MemoryStream())
                {
                    await stream.CopyToAsync(memoryStream);
                    fileBytes = memoryStream.ToArray();
                }
            }

            var base64File = Convert.ToBase64String(fileBytes);

            return Ok(new
            {
                file.FileName,
                file.ContentType,
                Base64Content = base64File
            });
        }

        #endregion download
    }
}