using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialPlatform.Application.DTOs.Interventions;
using SocialPlatform.Application.Interfaces;
using System.Security.Claims;

namespace SocialPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InterventionsController : ControllerBase
{
    private readonly IInterventionService _service;

    public InterventionsController(IInterventionService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] InterventionQueryDto query)
    {
        var result = await _service.GetAllAsync(query);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result is null) return NotFound(new { success = false, message = "Intervención no encontrada." });
        return Ok(new { success = true, data = result });
    }

    [HttpPost]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateInterventionDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _service.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, new { success = true, data = result });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInterventionDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _service.UpdateAsync(id, dto, userId);
        return Ok(new { success = true, data = result });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _service.DeleteAsync(id, userId);
        return Ok(new { success = true, message = "Intervención eliminada." });
    }

    [HttpPost("enroll")]
    [Authorize(Roles = "SuperAdmin,ChurchAdmin")]
    public async Task<IActionResult> Enroll([FromBody] EnrollChildDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _service.EnrollChildAsync(dto, userId);
        return Ok(new { success = true, data = result });
    }

    [HttpPost("withdraw/{participationId:guid}")]
    [Authorize(Roles = "SuperAdmin,ChurchAdmin")]
    public async Task<IActionResult> Withdraw(Guid participationId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _service.WithdrawChildAsync(participationId, userId);
        return Ok(new { success = true, message = "Participación retirada correctamente." });
    }

    [HttpGet("{id:guid}/participants")]
    public async Task<IActionResult> GetParticipants(Guid id)
    {
        var result = await _service.GetParticipantsAsync(id);
        return Ok(new { success = true, data = result });
    }
}
