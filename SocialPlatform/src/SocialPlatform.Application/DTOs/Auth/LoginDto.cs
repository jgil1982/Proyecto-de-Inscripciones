namespace SocialPlatform.Application.DTOs.Auth;

public record LoginDto(string Email, string Password);

public record RefreshTokenDto(string AccessToken, string RefreshToken);

public record RegisterChurchAdminDto(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    Guid ChurchId
);

public record AuthResponseDto
{
    public string AccessToken { get; init; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
    public UserInfoDto User { get; init; } = null!;
}

public record UserInfoDto
{
    public string Id { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public List<string> Roles { get; init; } = new();
    public Guid? ChurchId { get; init; }
    public string? ChurchName { get; init; }
    public string? ProfilePictureUrl { get; init; }
}
