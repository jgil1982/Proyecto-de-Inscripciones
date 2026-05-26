using SocialPlatform.Application.DTOs.Children;
using SocialPlatform.Application.DTOs;

namespace SocialPlatform.Application.Interfaces;

public interface IChildService
{
    Task<PagedResult<ChildListDto>> GetAllAsync(ChildQueryDto query);
    Task<PagedResult<ChildListDto>> GetByChurchAsync(Guid churchId, ChildQueryDto query);
    Task<ChildDetailDto?> GetByIdAsync(Guid id);
    Task<ChildDetailDto> CreateAsync(CreateChildDto dto, string userId);
    Task<ChildDetailDto> UpdateAsync(Guid id, UpdateChildDto dto, string userId);
    Task<bool> DeleteAsync(Guid id, string userId);
}
