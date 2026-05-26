using SocialPlatform.Application.DTOs.Dashboard;

namespace SocialPlatform.Application.Interfaces;

public interface IDashboardService
{
    Task<GlobalDashboardDto> GetGlobalDashboardAsync();
    Task<ChurchDashboardDto> GetChurchDashboardAsync(Guid churchId);
}
