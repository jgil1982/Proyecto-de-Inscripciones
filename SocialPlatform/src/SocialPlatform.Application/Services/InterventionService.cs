using Microsoft.EntityFrameworkCore;
using SocialPlatform.Application.DTOs;
using SocialPlatform.Application.DTOs.Interventions;
using SocialPlatform.Application.Interfaces;
using SocialPlatform.Domain.Entities;
using SocialPlatform.Domain.Enums;

namespace SocialPlatform.Application.Services;

public class InterventionService : IInterventionService
{
    private readonly IApplicationDbContext _db;

    public InterventionService(IApplicationDbContext db) => _db = db;

    public async Task<PagedResult<InterventionListDto>> GetAllAsync(InterventionQueryDto query)
    {
        var q = _db.Interventions.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
            q = q.Where(i => i.Name.Contains(query.Search) || (i.Category != null && i.Category.Contains(query.Search)));

        if (query.Status.HasValue)
            q = q.Where(i => i.Status == query.Status);

        if (!string.IsNullOrWhiteSpace(query.Category))
            q = q.Where(i => i.Category == query.Category);

        if (query.StartDateFrom.HasValue)
            q = q.Where(i => i.StartDate >= query.StartDateFrom);

        if (query.StartDateTo.HasValue)
            q = q.Where(i => i.StartDate <= query.StartDateTo);

        var total = await q.CountAsync();

        q = query.SortDescending
            ? q.OrderByDescending(i => i.StartDate)
            : q.OrderBy(i => i.StartDate);

        var items = await q
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(i => new InterventionListDto
            {
                Id = i.Id,
                Name = i.Name,
                Category = i.Category,
                Description = i.Description,
                StartDate = i.StartDate,
                EndDate = i.EndDate,
                Status = i.Status,
                EnrolledCount = i.Participations.Count(p => !p.IsDeleted),
                MaxParticipants = i.MaxParticipants,
                MinAge = i.MinAge,
                MaxAge = i.MaxAge,
                Location = i.Location,
                ImageUrl = i.ImageUrl,
                IsPublic = i.IsPublic,
                CreatedAt = i.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<InterventionListDto>
        {
            Items = items,
            TotalCount = total,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<InterventionDetailDto?> GetByIdAsync(Guid id)
    {
        var i = await _db.Interventions
            .Include(x => x.Participations).ThenInclude(p => p.Child).ThenInclude(c => c.Church)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (i is null) return null;

        return new InterventionDetailDto
        {
            Id = i.Id,
            Name = i.Name,
            Category = i.Category,
            Description = i.Description,
            StartDate = i.StartDate,
            EndDate = i.EndDate,
            Status = i.Status,
            EnrolledCount = i.Participations.Count(p => !p.IsDeleted),
            MaxParticipants = i.MaxParticipants,
            MinAge = i.MinAge,
            MaxAge = i.MaxAge,
            Location = i.Location,
            ImageUrl = i.ImageUrl,
            IsPublic = i.IsPublic,
            Objectives = i.Objectives,
            Requirements = i.Requirements,
            CreatedAt = i.CreatedAt,
            Participants = i.Participations.Where(p => !p.IsDeleted).Select(p => new ParticipationDto
            {
                Id = p.Id,
                ChildId = p.ChildId,
                ChildName = p.Child.FullName,
                ChildDocument = p.Child.DocumentNumber,
                ChurchName = p.Child.Church.Name,
                Status = p.Status,
                EnrolledAt = p.EnrolledAt,
                CompletedAt = p.CompletedAt,
                Notes = p.Notes,
                Score = p.Score
            }).ToList()
        };
    }

    public async Task<InterventionDetailDto> CreateAsync(CreateInterventionDto dto, string userId)
    {
        var intervention = new Intervention
        {
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            MaxParticipants = dto.MaxParticipants,
            MinAge = dto.MinAge,
            MaxAge = dto.MaxAge,
            Location = dto.Location,
            Objectives = dto.Objectives,
            Requirements = dto.Requirements,
            IsPublic = dto.IsPublic,
            Status = InterventionStatus.Planning,
            CreatedBy = userId
        };

        _db.Interventions.Add(intervention);
        await _db.SaveChangesAsync();
        return (await GetByIdAsync(intervention.Id))!;
    }

    public async Task<InterventionDetailDto> UpdateAsync(Guid id, UpdateInterventionDto dto, string userId)
    {
        var intervention = await _db.Interventions.FindAsync(id)
            ?? throw new KeyNotFoundException("Intervención no encontrada.");

        intervention.Name = dto.Name;
        intervention.Description = dto.Description;
        intervention.Category = dto.Category;
        intervention.StartDate = dto.StartDate;
        intervention.EndDate = dto.EndDate;
        intervention.MaxParticipants = dto.MaxParticipants;
        intervention.MinAge = dto.MinAge;
        intervention.MaxAge = dto.MaxAge;
        intervention.Location = dto.Location;
        intervention.Objectives = dto.Objectives;
        intervention.Requirements = dto.Requirements;
        intervention.IsPublic = dto.IsPublic;
        intervention.Status = dto.Status;
        intervention.UpdatedBy = userId;

        await _db.SaveChangesAsync();
        return (await GetByIdAsync(id))!;
    }

    public async Task<bool> DeleteAsync(Guid id, string userId)
    {
        var intervention = await _db.Interventions.FindAsync(id)
            ?? throw new KeyNotFoundException("Intervención no encontrada.");

        intervention.IsDeleted = true;
        intervention.DeletedAt = DateTime.UtcNow;
        intervention.UpdatedBy = userId;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<ParticipationDto> EnrollChildAsync(EnrollChildDto dto, string userId)
    {
        var child = await _db.Children.Include(c => c.Church)
            .FirstOrDefaultAsync(c => c.Id == dto.ChildId)
            ?? throw new KeyNotFoundException("Niño no encontrado.");

        var intervention = await _db.Interventions.FindAsync(dto.InterventionId)
            ?? throw new KeyNotFoundException("Intervención no encontrada.");

        if (intervention.Status != InterventionStatus.Active && intervention.Status != InterventionStatus.Planning)
            throw new InvalidOperationException("La intervención no está disponible para inscripciones.");

        if (await _db.Participations.AnyAsync(p => p.ChildId == dto.ChildId && p.InterventionId == dto.InterventionId))
            throw new InvalidOperationException("El niño ya está inscrito en esta intervención.");

        if (intervention.MaxParticipants.HasValue)
        {
            var currentCount = await _db.Participations.CountAsync(p => p.InterventionId == dto.InterventionId && !p.IsDeleted);
            if (currentCount >= intervention.MaxParticipants)
                throw new InvalidOperationException("La intervención ha alcanzado su cupo máximo.");
        }

        var participation = new Participation
        {
            ChildId = dto.ChildId,
            InterventionId = dto.InterventionId,
            Status = ParticipationStatus.Enrolled,
            Notes = dto.Notes,
            EnrolledBy = userId,
            CreatedBy = userId
        };

        _db.Participations.Add(participation);
        await _db.SaveChangesAsync();

        return new ParticipationDto
        {
            Id = participation.Id,
            ChildId = child.Id,
            ChildName = child.FullName,
            ChildDocument = child.DocumentNumber,
            ChurchName = child.Church.Name,
            Status = participation.Status,
            EnrolledAt = participation.EnrolledAt,
            Notes = participation.Notes
        };
    }

    public async Task<bool> WithdrawChildAsync(Guid participationId, string userId)
    {
        var p = await _db.Participations.FindAsync(participationId)
            ?? throw new KeyNotFoundException("Participación no encontrada.");

        p.Status = ParticipationStatus.Withdrawn;
        p.IsDeleted = true;
        p.DeletedAt = DateTime.UtcNow;
        p.UpdatedBy = userId;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<ParticipationDto>> GetParticipantsAsync(Guid interventionId)
    {
        return await _db.Participations
            .Include(p => p.Child).ThenInclude(c => c.Church)
            .Where(p => p.InterventionId == interventionId && !p.IsDeleted)
            .Select(p => new ParticipationDto
            {
                Id = p.Id,
                ChildId = p.ChildId,
                ChildName = p.Child.FirstName + " " + p.Child.LastName,
                ChildDocument = p.Child.DocumentNumber,
                ChurchName = p.Child.Church.Name,
                Status = p.Status,
                EnrolledAt = p.EnrolledAt,
                CompletedAt = p.CompletedAt,
                Notes = p.Notes,
                Score = p.Score
            })
            .ToListAsync();
    }
}
