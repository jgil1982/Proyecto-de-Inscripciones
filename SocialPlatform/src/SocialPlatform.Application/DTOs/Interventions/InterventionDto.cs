using SocialPlatform.Application.DTOs;
using SocialPlatform.Domain.Enums;

namespace SocialPlatform.Application.DTOs.Interventions;

public record InterventionListDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Category { get; init; }
    public string? Description { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public InterventionStatus Status { get; init; }
    public string StatusLabel => Status.ToString();
    public int EnrolledCount { get; init; }
    public int? MaxParticipants { get; init; }
    public int MinAge { get; init; }
    public int MaxAge { get; init; }
    public string? Location { get; init; }
    public string? ImageUrl { get; init; }
    public bool IsPublic { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record InterventionDetailDto : InterventionListDto
{
    public string? Objectives { get; init; }
    public string? Requirements { get; init; }
    public List<ParticipationDto> Participants { get; init; } = new();
}

public record ParticipationDto
{
    public Guid Id { get; init; }
    public Guid ChildId { get; init; }
    public string ChildName { get; init; } = string.Empty;
    public string ChildDocument { get; init; } = string.Empty;
    public string ChurchName { get; init; } = string.Empty;
    public ParticipationStatus Status { get; init; }
    public string StatusLabel => Status.ToString();
    public DateTime EnrolledAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public string? Notes { get; init; }
    public decimal? Score { get; init; }
}

public record CreateInterventionDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Category { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public int? MaxParticipants { get; init; }
    public int MinAge { get; init; } = 0;
    public int MaxAge { get; init; } = 18;
    public string? Location { get; init; }
    public string? Objectives { get; init; }
    public string? Requirements { get; init; }
    public bool IsPublic { get; init; } = true;
}

public record UpdateInterventionDto : CreateInterventionDto
{
    public InterventionStatus Status { get; init; }
}

public record EnrollChildDto
{
    public Guid ChildId { get; init; }
    public Guid InterventionId { get; init; }
    public string? Notes { get; init; }
}

public record InterventionQueryDto : QueryBase
{
    public InterventionStatus? Status { get; init; }
    public string? Category { get; init; }
    public DateTime? StartDateFrom { get; init; }
    public DateTime? StartDateTo { get; init; }
}
