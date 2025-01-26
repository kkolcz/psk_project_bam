namespace API.DTOs
{
    public class Base64FileUploadDto
    {
        public string FileName { get; set; }
        public string Base64Content { get; set; }
        public string ContentType { get; set; } 
    }
}

