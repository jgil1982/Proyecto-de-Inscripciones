using SocialPlatform.Domain.Common;
using SocialPlatform.Domain.Enums;

namespace SocialPlatform.Domain.Entities;

public class Child : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public string DocumentType { get; set; } = "CC";
    public DateTime BirthDate { get; set; }
    public Gender Gender { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? GuardianName { get; set; }
    public string? GuardianPhone { get; set; }
    public string? GuardianRelationship { get; set; }
    public string? MedicalNotes { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;

    public Guid ChurchId { get; set; }
    public Church Church { get; set; } = null!;

    public ICollection<Participation> Participations { get; set; } = new List<Participation>();

    public int Age => DateTime.Today.Year - BirthDate.Year -
        (DateTime.Today < BirthDate.AddYears(DateTime.Today.Year - BirthDate.Year) ? 1 : 0);

    public string FullName => $"{FirstName} {LastName}".Trim();
}
