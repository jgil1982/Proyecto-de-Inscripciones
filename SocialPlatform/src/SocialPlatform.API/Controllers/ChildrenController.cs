using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialPlatform.Application.DTOs.Children;
using SocialPlatform.Application.Interfaces;
using System.Security.Claims;

namespace SocialPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChildrenController : ControllerBase
{
    private readonly IChildService _service;

    public ChildrenController(IChildService service) => _service = service;

    [HttpGet]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> GetAll([FromQuery] ChildQueryDto query)
    {
        var result = await _service.GetAllAsync(query);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("church/{churchId:guid}")]
    public async Task<IActionResult> GetByChurch(Guid churchId, [FromQuery] ChildQueryDto query)
    {
        var userChurchId = User.FindFirstValue("churchId");
        if (!User.IsInRole("SuperAdmin") && userChurchId != churchId.ToString())
            return Forbid();

        var result = await _service.GetByChurchAsync(churchId, query);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result is null) return NotFound(new { success = false, message = "Niño no encontrado." });

        var userChurchId = User.FindFirstValue("churchId");
        if (!User.IsInRole("SuperAdmin") && userChurchId != result.ChurchId.ToString())
            return Forbid();

        return Ok(new { success = true, data = result });
    }

    [HttpPost]
    [Authorize(Roles = "SuperAdmin,ChurchAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateChildDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var userChurchId = User.FindFirstValue("churchId");

        if (!User.IsInRole("SuperAdmin") && userChurchId != dto.ChurchId.ToString())
            return Forbid();

        var result = await _service.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, new { success = true, data = result });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "SuperAdmin,ChurchAdmin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateChildDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _service.UpdateAsync(id, dto, userId);
        return Ok(new { success = true, data = result });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "SuperAdmin,ChurchAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _service.DeleteAsync(id, userId);
        return Ok(new { success = true, message = "Registro eliminado correctamente." });
    }
}
