using SocialPlatform.Domain.Common;
using SocialPlatform.Domain.Enums;

namespace SocialPlatform.Domain.Entities;

public class Church : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string LegalName { get; set; } = string.Empty;
    public string? TaxId { get; set; }
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = "Colombia";
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Website { get; set; }
    public string? PastorName { get; set; }
    public string? LogoUrl { get; set; }
    public string? Description { get; set; }
    public ChurchStatus Status { get; set; } = ChurchStatus.Pending;
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovedBy { get; set; }
    public string? RejectionReason { get; set; }

    public ICollection<ApplicationUser> Users { get; set; } = new List<ApplicationUser>();
    public ICollection<Child> Children { get; set; } = new List<Child>();
}
