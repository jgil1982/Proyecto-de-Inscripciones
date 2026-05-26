using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialPlatform.Application.DTOs.Auth;
using SocialPlatform.Application.Interfaces;
using System.Security.Claims;

namespace SocialPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        return Ok(new { success = true, data = result });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenDto dto)
    {
        var result = await _authService.RefreshTokenAsync(dto);
        return Ok(new { success = true, data = result });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _authService.RevokeTokenAsync(userId);
        return Ok(new { success = true, message = "Sesión cerrada correctamente." });
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var user = new UserInfoDto
        {
            Id = User.FindFirstValue(ClaimTypes.NameIdentifier)!,
            Email = User.FindFirstValue(ClaimTypes.Email)!,
            FullName = User.FindFirstValue(ClaimTypes.Name)!,
            Roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList(),
            ChurchId = Guid.TryParse(User.FindFirstValue("churchId"), out var cid) ? cid : null
        };
        return Ok(new { success = true, data = user });
    }
}
