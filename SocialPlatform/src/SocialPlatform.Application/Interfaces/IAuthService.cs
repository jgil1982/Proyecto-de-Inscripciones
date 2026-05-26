using SocialPlatform.Application.DTOs.Auth;

namespace SocialPlatform.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto dto);
    Task<bool> RegisterChurchAdminAsync(RegisterChurchAdminDto dto);
    Task RevokeTokenAsync(string userId);
}
