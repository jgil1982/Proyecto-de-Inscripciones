using SocialPlatform.Domain.Common;
using SocialPlatform.Domain.Enums;

namespace SocialPlatform.Domain.Entities;

public class Intervention : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? MaxParticipants { get; set; }
    public int MinAge { get; set; } = 0;
    public int MaxAge { get; set; } = 18;
    public InterventionStatus Status { get; set; } = InterventionStatus.Planning;
    public string? Location { get; set; }
    public string? ImageUrl { get; set; }
    public string? Objectives { get; set; }
    public string? Requirements { get; set; }
    public bool IsPublic { get; set; } = true;

    public ICollection<Participation> Participations { get; set; } = new List<Participation>();

    public int EnrolledCount => Participations.Count(p => !p.IsDeleted);
}
