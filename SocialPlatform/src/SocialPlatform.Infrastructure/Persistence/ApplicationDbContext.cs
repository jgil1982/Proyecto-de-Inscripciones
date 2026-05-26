using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SocialPlatform.Application.Interfaces;
using SocialPlatform.Domain.Entities;

namespace SocialPlatform.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Church> Churches => Set<Church>();
    public DbSet<Child> Children => Set<Child>();
    public DbSet<Intervention> Interventions => Set<Intervention>();
    public DbSet<Participation> Participations => Set<Participation>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Church>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.LegalName).HasMaxLength(300).IsRequired();
            e.Property(x => x.Email).HasMaxLength(256).IsRequired();
            e.Property(x => x.Phone).HasMaxLength(50).IsRequired();
            e.Property(x => x.City).HasMaxLength(100).IsRequired();
            e.Property(x => x.State).HasMaxLength(100).IsRequired();
            e.HasIndex(x => x.Email).IsUnique();
            e.HasQueryFilter(x => !x.IsDeleted);
        });

        builder.Entity<Child>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.FirstName).HasMaxLength(100).IsRequired();
            e.Property(x => x.LastName).HasMaxLength(100).IsRequired();
            e.Property(x => x.DocumentNumber).HasMaxLength(50).IsRequired();
            e.HasIndex(x => new { x.DocumentNumber, x.ChurchId }).IsUnique();
            e.HasOne(x => x.Church).WithMany(x => x.Children)
                .HasForeignKey(x => x.ChurchId).OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(x => !x.IsDeleted);
        });

        builder.Entity<Intervention>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(300).IsRequired();
            e.HasQueryFilter(x => !x.IsDeleted);
        });

        builder.Entity<Participation>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.ChildId, x.InterventionId }).IsUnique();
            e.HasOne(x => x.Child).WithMany(x => x.Participations)
                .HasForeignKey(x => x.ChildId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Intervention).WithMany(x => x.Participations)
                .HasForeignKey(x => x.InterventionId).OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(x => !x.IsDeleted);
        });

        builder.Entity<ApplicationUser>(e =>
        {
            e.HasOne(x => x.Church).WithMany(x => x.Users)
                .HasForeignKey(x => x.ChurchId).OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<AuditLog>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Action).HasMaxLength(100).IsRequired();
            e.Property(x => x.EntityName).HasMaxLength(100).IsRequired();
        });
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is Domain.Common.BaseEntity entity)
            {
                if (entry.State == EntityState.Added)
                    entity.CreatedAt = DateTime.UtcNow;
                if (entry.State == EntityState.Modified)
                    entity.UpdatedAt = DateTime.UtcNow;
            }
        }
        return await base.SaveChangesAsync(cancellationToken);
    }
}
