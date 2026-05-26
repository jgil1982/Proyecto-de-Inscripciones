using SocialPlatform.Application.DTOs;
using SocialPlatform.Domain.Enums;

namespace SocialPlatform.Application.DTOs.Churches;

public record ChurchListDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Phone { get; init; } = string.Empty;
    public string? PastorName { get; init; }
    public ChurchStatus Status { get; init; }
    public string StatusLabel => Status.ToString();
    public int ChildrenCount { get; init; }
    public DateTime CreatedAt { get; init; }
    public string? LogoUrl { get; init; }
}

public record ChurchDetailDto : ChurchListDto
{
    public string LegalName { get; init; } = string.Empty;
    public string? TaxId { get; init; }
    public string Address { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public string? Website { get; init; }
    public string? Description { get; init; }
    public DateTime? ApprovedAt { get; init; }
    public string? ApprovedBy { get; init; }
    public string? RejectionReason { get; init; }
    public int UsersCount { get; init; }
    public int ActiveInterventions { get; init; }
}

public record CreateChurchDto
{
    public string Name { get; init; } = string.Empty;
    public string LegalName { get; init; } = string.Empty;
    public string? TaxId { get; init; }
    public string Address { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string Country { get; init; } = "Colombia";
    public string Phone { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? Website { get; init; }
    public string? PastorName { get; init; }
    public string? Description { get; init; }
    public string AdminFirstName { get; init; } = string.Empty;
    public string AdminLastName { get; init; } = string.Empty;
    public string AdminEmail { get; init; } = string.Empty;
    public string AdminPassword { get; init; } = string.Empty;
}

public record UpdateChurchDto
{
    public string Name { get; init; } = string.Empty;
    public string LegalName { get; init; } = string.Empty;
    public string? TaxId { get; init; }
    public string Address { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string Phone { get; init; } = string.Empty;
    public string? Website { get; init; }
    public string? PastorName { get; init; }
    public string? Description { get; init; }
}

public record ChurchQueryDto : QueryBase
{
    public ChurchStatus? Status { get; init; }
    public string? City { get; init; }
}
