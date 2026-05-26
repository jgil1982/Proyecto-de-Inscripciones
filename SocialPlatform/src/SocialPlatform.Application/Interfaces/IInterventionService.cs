using SocialPlatform.Application.DTOs.Interventions;
using SocialPlatform.Application.DTOs;

namespace SocialPlatform.Application.Interfaces;

public interface IInterventionService
{
    Task<PagedResult<InterventionListDto>> GetAllAsync(InterventionQueryDto query);
    Task<InterventionDetailDto?> GetByIdAsync(Guid id);
    Task<InterventionDetailDto> CreateAsync(CreateInterventionDto dto, string userId);
    Task<InterventionDetailDto> UpdateAsync(Guid id, UpdateInterventionDto dto, string userId);
    Task<bool> DeleteAsync(Guid id, string userId);
    Task<ParticipationDto> EnrollChildAsync(EnrollChildDto dto, string userId);
    Task<bool> WithdrawChildAsync(Guid participationId, string userId);
    Task<List<ParticipationDto>> GetParticipantsAsync(Guid interventionId);
}
