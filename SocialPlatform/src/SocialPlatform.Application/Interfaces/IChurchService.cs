using SocialPlatform.Application.DTOs.Churches;
using SocialPlatform.Application.DTOs;

namespace SocialPlatform.Application.Interfaces;

public interface IChurchService
{
    Task<PagedResult<ChurchListDto>> GetAllAsync(ChurchQueryDto query);
    Task<ChurchDetailDto?> GetByIdAsync(Guid id);
    Task<ChurchDetailDto> CreateAsync(CreateChurchDto dto, string userId);
    Task<ChurchDetailDto> UpdateAsync(Guid id, UpdateChurchDto dto, string userId);
    Task<bool> ApproveAsync(Guid id, string adminId);
    Task<bool> RejectAsync(Guid id, string adminId, string reason);
    Task<bool> SuspendAsync(Guid id, string adminId);
    Task<bool> DeleteAsync(Guid id, string userId);
}
