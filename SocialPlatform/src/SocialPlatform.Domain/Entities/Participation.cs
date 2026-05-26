using SocialPlatform.Domain.Common;
using SocialPlatform.Domain.Enums;

namespace SocialPlatform.Domain.Entities;

public class Participation : BaseEntity
{
    public Guid ChildId { get; set; }
    public Child Child { get; set; } = null!;

    public Guid InterventionId { get; set; }
    public Intervention Intervention { get; set; } = null!;

    public ParticipationStatus Status { get; set; } = ParticipationStatus.Enrolled;
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public string? Notes { get; set; }
    public decimal? Score { get; set; }
    public string? EnrolledBy { get; set; }
}
