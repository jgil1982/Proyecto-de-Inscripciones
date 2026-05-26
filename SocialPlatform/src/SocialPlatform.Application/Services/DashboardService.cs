using Microsoft.EntityFrameworkCore;
using SocialPlatform.Application.DTOs.Dashboard;
using SocialPlatform.Application.Interfaces;
using SocialPlatform.Domain.Enums;

namespace SocialPlatform.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IApplicationDbContext _db;

    public DashboardService(IApplicationDbContext db) => _db = db;

    public async Task<GlobalDashboardDto> GetGlobalDashboardAsync()
    {
        var churches = await _db.Churches.Include(c => c.Children).ToListAsync();
        var children = await _db.Children.ToListAsync();
        var interventions = await _db.Interventions.Include(i => i.Participations).ToListAsync();
        var participations = await _db.Participations.ToListAsync();

        var monthlyStats = await GetMonthlyStatsAsync(6);

        return new GlobalDashboardDto
        {
            TotalChurches = churches.Count,
            ActiveChurches = churches.Count(c => c.Status == ChurchStatus.Active),
            PendingChurches = churches.Count(c => c.Status == ChurchStatus.Pending),
            TotalChildren = children.Count,
            ActiveChildren = children.Count(c => c.IsActive),
            TotalInterventions = interventions.Count,
            ActiveInterventions = interventions.Count(i => i.Status == InterventionStatus.Active),
            TotalParticipations = participations.Count,
            CompletedParticipations = participations.Count(p => p.Status == ParticipationStatus.Completed),
            TopChurches = churches
                .OrderByDescending(c => c.Children.Count)
                .Take(5)
                .Select(c => new ChurchKpiDto
                {
                    ChurchId = c.Id,
                    ChurchName = c.Name,
                    ChildrenCount = c.Children.Count,
                    ParticipationsCount = participations.Count(p => children.Where(ch => ch.ChurchId == c.Id).Select(ch => ch.Id).Contains(p.ChildId))
                }).ToList(),
            TopInterventions = interventions
                .OrderByDescending(i => i.Participations.Count)
                .Take(5)
                .Select(i => new InterventionKpiDto
                {
                    InterventionId = i.Id,
                    InterventionName = i.Name,
                    Category = i.Category,
                    ParticipantsCount = i.Participations.Count,
                    Status = i.Status.ToString()
                }).ToList(),
            MonthlyStats = monthlyStats,
            ChurchStatusChart = new List<ChurchStatusChartDto>
            {
                new() { Name = "Activas", Value = churches.Count(c => c.Status == ChurchStatus.Active), Color = "#6366f1" },
                new() { Name = "Pendientes", Value = churches.Count(c => c.Status == ChurchStatus.Pending), Color = "#f59e0b" },
                new() { Name = "Suspendidas", Value = churches.Count(c => c.Status == ChurchStatus.Suspended), Color = "#ef4444" },
                new() { Name = "Rechazadas", Value = churches.Count(c => c.Status == ChurchStatus.Rejected), Color = "#94a3b8" },
            },
            GenderChart = new List<GenderChartDto>
            {
                new() { Name = "Niñas", Value = children.Count(c => c.Gender == Gender.Female), Color = "#ec4899" },
                new() { Name = "Niños", Value = children.Count(c => c.Gender == Gender.Male), Color = "#6366f1" },
                new() { Name = "Otro", Value = children.Count(c => c.Gender == Gender.Other), Color = "#94a3b8" },
            },
            AgeGroupChart = GetAgeGroups(children.Select(c => c.Age).ToList())
        };
    }

    public async Task<ChurchDashboardDto> GetChurchDashboardAsync(Guid churchId)
    {
        var church = await _db.Churches.FindAsync(churchId);
        var children = await _db.Children.Where(c => c.ChurchId == churchId).ToListAsync();
        var participations = await _db.Participations
            .Include(p => p.Intervention)
            .Where(p => children.Select(c => c.Id).Contains(p.ChildId))
            .ToListAsync();
        var availableInterventions = await _db.Interventions
            .CountAsync(i => i.Status == InterventionStatus.Active);
        var monthlyStats = await GetChurchMonthlyStatsAsync(churchId, 6);

        return new ChurchDashboardDto
        {
            ChurchName = church?.Name ?? string.Empty,
            TotalChildren = children.Count,
            ActiveChildren = children.Count(c => c.IsActive),
            TotalParticipations = participations.Count,
            ActiveParticipations = participations.Count(p => p.Status == ParticipationStatus.Active),
            CompletedParticipations = participations.Count(p => p.Status == ParticipationStatus.Completed),
            AvailableInterventions = availableInterventions,
            MyInterventions = participations
                .GroupBy(p => p.Intervention)
                .Select(g => new InterventionKpiDto
                {
                    InterventionId = g.Key.Id,
                    InterventionName = g.Key.Name,
                    Category = g.Key.Category,
                    ParticipantsCount = g.Count(),
                    Status = g.Key.Status.ToString()
                }).ToList(),
            GenderChart = new List<GenderChartDto>
            {
                new() { Name = "Niñas", Value = children.Count(c => c.Gender == Gender.Female), Color = "#ec4899" },
                new() { Name = "Niños", Value = children.Count(c => c.Gender == Gender.Male), Color = "#6366f1" },
                new() { Name = "Otro", Value = children.Count(c => c.Gender == Gender.Other), Color = "#94a3b8" },
            },
            AgeGroupChart = GetAgeGroups(children.Select(c => c.Age).ToList()),
            MonthlyRegistrations = monthlyStats
        };
    }

    private async Task<List<MonthlyStatsDto>> GetMonthlyStatsAsync(int months)
    {
        var stats = new List<MonthlyStatsDto>();
        for (int i = months - 1; i >= 0; i--)
        {
            var date = DateTime.UtcNow.AddMonths(-i);
            var from = new DateTime(date.Year, date.Month, 1);
            var to = from.AddMonths(1);

            var childrenCount = await _db.Children.CountAsync(c => c.CreatedAt >= from && c.CreatedAt < to);
            var participationsCount = await _db.Participations.CountAsync(p => p.EnrolledAt >= from && p.EnrolledAt < to);
            var completionsCount = await _db.Participations.CountAsync(p => p.CompletedAt >= from && p.CompletedAt < to);

            stats.Add(new MonthlyStatsDto
            {
                Month = date.ToString("MMM yyyy"),
                Children = childrenCount,
                Participations = participationsCount,
                Completions = completionsCount
            });
        }
        return stats;
    }

    private async Task<List<MonthlyStatsDto>> GetChurchMonthlyStatsAsync(Guid churchId, int months)
    {
        var stats = new List<MonthlyStatsDto>();
        for (int i = months - 1; i >= 0; i--)
        {
            var date = DateTime.UtcNow.AddMonths(-i);
            var from = new DateTime(date.Year, date.Month, 1);
            var to = from.AddMonths(1);

            var count = await _db.Children.CountAsync(c => c.ChurchId == churchId && c.CreatedAt >= from && c.CreatedAt < to);
            stats.Add(new MonthlyStatsDto { Month = date.ToString("MMM yyyy"), Children = count });
        }
        return stats;
    }

    private static List<AgeGroupChartDto> GetAgeGroups(List<int> ages) =>
    [
        new() { Group = "0-5", Count = ages.Count(a => a <= 5) },
        new() { Group = "6-8", Count = ages.Count(a => a >= 6 && a <= 8) },
        new() { Group = "9-11", Count = ages.Count(a => a >= 9 && a <= 11) },
        new() { Group = "12-14", Count = ages.Count(a => a >= 12 && a <= 14) },
        new() { Group = "15-18", Count = ages.Count(a => a >= 15 && a <= 18) },
    ];
}
