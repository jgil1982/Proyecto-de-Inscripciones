using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialPlatform.Application.DTOs.Churches;
using SocialPlatform.Application.Interfaces;
using System.Security.Claims;

namespace SocialPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChurchesController : ControllerBase
{
    private readonly IChurchService _service;

    public ChurchesController(IChurchService service) => _service = service;

    [HttpGet]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> GetAll([FromQuery] ChurchQueryDto query)
    {
        var result = await _service.GetAllAsync(query);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result is null) return NotFound(new { success = false, message = "Iglesia no encontrada." });
        return Ok(new { success = true, data = result });
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] CreateChurchDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anonymous";
        var result = await _service.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, new { success = true, data = result });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateChurchDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _service.UpdateAsync(id, dto, userId);
        return Ok(new { success = true, data = result });
    }

    [HttpPost("{id:guid}/approve")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _service.ApproveAsync(id, adminId);
        return Ok(new { success = true, message = "Iglesia aprobada correctamente." });
    }

    [HttpPost("{id:guid}/reject")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectChurchDto dto)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _service.RejectAsync(id, adminId, dto.Reason);
        return Ok(new { success = true, message = "Iglesia rechazada." });
    }

    [HttpPost("{id:guid}/suspend")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Suspend(Guid id)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _service.SuspendAsync(id, adminId);
        return Ok(new { success = true, message = "Iglesia suspendida." });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _service.DeleteAsync(id, userId);
        return Ok(new { success = true, message = "Iglesia eliminada." });
    }
}

public record RejectChurchDto(string Reason);
