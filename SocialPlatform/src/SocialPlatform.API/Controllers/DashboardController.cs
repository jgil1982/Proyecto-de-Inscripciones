using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialPlatform.Application.Interfaces;
using System.Security.Claims;

namespace SocialPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service) => _service = service;

    [HttpGet("global")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Global()
    {
        var result = await _service.GetGlobalDashboardAsync();
        return Ok(new { success = true, data = result });
    }

    [HttpGet("church/{churchId:guid}")]
    public async Task<IActionResult> Church(Guid churchId)
    {
        var userChurchId = User.FindFirstValue("churchId");
        if (!User.IsInRole("SuperAdmin") && userChurchId != churchId.ToString())
            return Forbid();

        var result = await _service.GetChurchDashboardAsync(churchId);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("my")]
    [Authorize(Roles = "ChurchAdmin,Viewer")]
    public async Task<IActionResult> My()
    {
        var churchIdStr = User.FindFirstValue("churchId");
        if (!Guid.TryParse(churchIdStr, out var churchId))
            return BadRequest(new { success = false, message = "No tiene iglesia asignada." });

        var result = await _service.GetChurchDashboardAsync(churchId);
        return Ok(new { success = true, data = result });
    }
}
