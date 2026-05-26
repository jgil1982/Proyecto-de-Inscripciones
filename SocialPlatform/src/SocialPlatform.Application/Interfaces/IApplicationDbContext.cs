using Microsoft.EntityFrameworkCore;
using SocialPlatform.Domain.Entities;

namespace SocialPlatform.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Church> Churches { get; }
    DbSet<Child> Children { get; }
    DbSet<Intervention> Interventions { get; }
    DbSet<Participation> Participations { get; }
    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
