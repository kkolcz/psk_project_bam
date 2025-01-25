namespace API.Entities
{
    public class SharedFiles
    {
        public int Id { get; set; }

        public int FileEntityId { get; set; }
        public FileEntity FileEntity { get; set; }

        public string AccessCode { get; set; } = Guid.NewGuid().ToString().Substring(0, 8); 

        public int SharedByUserId { get; set; }
        public AppUser SharedByUser { get; set; }

        public int? AccessedByUserId { get; set; }
        public AppUser? AccessedByUser { get; set; }

        public DateTime SharedAt { get; set; } = DateTime.UtcNow;
        public DateTime? AccessedAt { get; set; }
    }

}
