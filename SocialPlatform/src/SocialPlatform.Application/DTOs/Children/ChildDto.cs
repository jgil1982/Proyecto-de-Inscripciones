using SocialPlatform.Application.DTOs;
using SocialPlatform.Domain.Enums;

namespace SocialPlatform.Application.DTOs.Children;

public record ChildListDto
{
    public Guid Id { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string DocumentNumber { get; init; } = string.Empty;
    public string DocumentType { get; init; } = string.Empty;
    public int Age { get; init; }
    public Gender Gender { get; init; }
    public string GenderLabel => Gender.ToString();
    public string? PhotoUrl { get; init; }
    public string ChurchName { get; init; } = string.Empty;
    public Guid ChurchId { get; init; }
    public bool IsActive { get; init; }
    public int ActiveInterventions { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record ChildDetailDto : ChildListDto
{
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public DateTime BirthDate { get; init; }
    public string? Address { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public string? GuardianName { get; init; }
    public string? GuardianPhone { get; init; }
    public string? GuardianRelationship { get; init; }
    public string? MedicalNotes { get; init; }
    public string? Notes { get; init; }
    public List<ParticipationSummaryDto> Participations { get; init; } = new();
}

public record ParticipationSummaryDto
{
    public Guid ParticipationId { get; init; }
    public Guid InterventionId { get; init; }
    public string InterventionName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime EnrolledAt { get; init; }
}

public record CreateChildDto
{
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string DocumentNumber { get; init; } = string.Empty;
    public string DocumentType { get; init; } = "CC";
    public DateTime BirthDate { get; init; }
    public Gender Gender { get; init; }
    public Guid ChurchId { get; init; }
    public string? Address { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public string? GuardianName { get; init; }
    public string? GuardianPhone { get; init; }
    public string? GuardianRelationship { get; init; }
    public string? MedicalNotes { get; init; }
    public string? Notes { get; init; }
}

public record UpdateChildDto
{
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string DocumentNumber { get; init; } = string.Empty;
    public string DocumentType { get; init; } = "CC";
    public DateTime BirthDate { get; init; }
    public Gender Gender { get; init; }
    public string? Address { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public string? GuardianName { get; init; }
    public string? GuardianPhone { get; init; }
    public string? GuardianRelationship { get; init; }
    public string? MedicalNotes { get; init; }
    public string? Notes { get; init; }
    public bool IsActive { get; init; } = true;
}

public record ChildQueryDto : QueryBase
{
    public Guid? ChurchId { get; init; }
    public Gender? Gender { get; init; }
    public bool? IsActive { get; init; }
    public int? MinAge { get; init; }
    public int? MaxAge { get; init; }
}
