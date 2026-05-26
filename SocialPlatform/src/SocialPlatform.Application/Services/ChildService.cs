using Microsoft.EntityFrameworkCore;
using SocialPlatform.Application.DTOs;
using SocialPlatform.Application.DTOs.Children;
using SocialPlatform.Application.Interfaces;
using SocialPlatform.Domain.Entities;

namespace SocialPlatform.Application.Services;

public class ChildService : IChildService
{
    private readonly IApplicationDbContext _db;

    public ChildService(IApplicationDbContext db) => _db = db;

    public async Task<PagedResult<ChildListDto>> GetAllAsync(ChildQueryDto query)
    {
        var q = BuildQuery(query);
        return await ExecutePagedAsync(q, query);
    }

    public async Task<PagedResult<ChildListDto>> GetByChurchAsync(Guid churchId, ChildQueryDto query)
    {
        var q = BuildQuery(query).Where(c => c.ChurchId == churchId);
        return await ExecutePagedAsync(q, query);
    }

    private IQueryable<Child> BuildQuery(ChildQueryDto query)
    {
        var q = _db.Children.Include(c => c.Church).AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
            q = q.Where(c => c.FirstName.Contains(query.Search) || c.LastName.Contains(query.Search) || c.DocumentNumber.Contains(query.Search));

        if (query.ChurchId.HasValue)
            q = q.Where(c => c.ChurchId == query.ChurchId);

        if (query.Gender.HasValue)
            q = q.Where(c => c.Gender == query.Gender);

        if (query.IsActive.HasValue)
            q = q.Where(c => c.IsActive == query.IsActive);

        if (query.MinAge.HasValue)
            q = q.Where(c => c.BirthDate <= DateTime.Today.AddYears(-query.MinAge.Value));

        if (query.MaxAge.HasValue)
            q = q.Where(c => c.BirthDate >= DateTime.Today.AddYears(-(query.MaxAge.Value + 1)));

        return q;
    }

    private async Task<PagedResult<ChildListDto>> ExecutePagedAsync(IQueryable<Child> q, ChildQueryDto query)
    {
        var total = await q.CountAsync();

        q = query.SortBy?.ToLower() switch
        {
            "name" => query.SortDescending ? q.OrderByDescending(c => c.FirstName) : q.OrderBy(c => c.FirstName),
            "age" => query.SortDescending ? q.OrderBy(c => c.BirthDate) : q.OrderByDescending(c => c.BirthDate),
            _ => q.OrderByDescending(c => c.CreatedAt)
        };

        var items = await q
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(c => new ChildListDto
            {
                Id = c.Id,
                FullName = c.FirstName + " " + c.LastName,
                DocumentNumber = c.DocumentNumber,
                DocumentType = c.DocumentType,
                Age = DateTime.Today.Year - c.BirthDate.Year,
                Gender = c.Gender,
                PhotoUrl = c.PhotoUrl,
                ChurchName = c.Church.Name,
                ChurchId = c.ChurchId,
                IsActive = c.IsActive,
                ActiveInterventions = c.Participations.Count(p => p.Status == Domain.Enums.ParticipationStatus.Active && !p.IsDeleted),
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<ChildListDto>
        {
            Items = items,
            TotalCount = total,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<ChildDetailDto?> GetByIdAsync(Guid id)
    {
        var c = await _db.Children
            .Include(x => x.Church)
            .Include(x => x.Participations).ThenInclude(p => p.Intervention)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (c is null) return null;

        return new ChildDetailDto
        {
            Id = c.Id,
            FirstName = c.FirstName,
            LastName = c.LastName,
            FullName = c.FullName,
            DocumentNumber = c.DocumentNumber,
            DocumentType = c.DocumentType,
            BirthDate = c.BirthDate,
            Age = c.Age,
            Gender = c.Gender,
            PhotoUrl = c.PhotoUrl,
            Address = c.Address,
            Phone = c.Phone,
            Email = c.Email,
            GuardianName = c.GuardianName,
            GuardianPhone = c.GuardianPhone,
            GuardianRelationship = c.GuardianRelationship,
            MedicalNotes = c.MedicalNotes,
            Notes = c.Notes,
            ChurchName = c.Church.Name,
            ChurchId = c.ChurchId,
            IsActive = c.IsActive,
            ActiveInterventions = c.Participations.Count(p => p.Status == Domain.Enums.ParticipationStatus.Active),
            CreatedAt = c.CreatedAt,
            Participations = c.Participations.Select(p => new ParticipationSummaryDto
            {
                ParticipationId = p.Id,
                InterventionId = p.InterventionId,
                InterventionName = p.Intervention.Name,
                Status = p.Status.ToString(),
                EnrolledAt = p.EnrolledAt
            }).ToList()
        };
    }

    public async Task<ChildDetailDto> CreateAsync(CreateChildDto dto, string userId)
    {
        if (await _db.Children.AnyAsync(c => c.DocumentNumber == dto.DocumentNumber && c.ChurchId == dto.ChurchId))
            throw new InvalidOperationException("Ya existe un niño con ese documento en esta iglesia.");

        var child = new Child
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            DocumentNumber = dto.DocumentNumber,
            DocumentType = dto.DocumentType,
            BirthDate = dto.BirthDate,
            Gender = dto.Gender,
            ChurchId = dto.ChurchId,
            Address = dto.Address,
            Phone = dto.Phone,
            Email = dto.Email,
            GuardianName = dto.GuardianName,
            GuardianPhone = dto.GuardianPhone,
            GuardianRelationship = dto.GuardianRelationship,
            MedicalNotes = dto.MedicalNotes,
            Notes = dto.Notes,
            CreatedBy = userId
        };

        _db.Children.Add(child);
        await _db.SaveChangesAsync();
        return (await GetByIdAsync(child.Id))!;
    }

    public async Task<ChildDetailDto> UpdateAsync(Guid id, UpdateChildDto dto, string userId)
    {
        var child = await _db.Children.FindAsync(id)
            ?? throw new KeyNotFoundException("Niño no encontrado.");

        child.FirstName = dto.FirstName;
        child.LastName = dto.LastName;
        child.DocumentNumber = dto.DocumentNumber;
        child.DocumentType = dto.DocumentType;
        child.BirthDate = dto.BirthDate;
        child.Gender = dto.Gender;
        child.Address = dto.Address;
        child.Phone = dto.Phone;
        child.Email = dto.Email;
        child.GuardianName = dto.GuardianName;
        child.GuardianPhone = dto.GuardianPhone;
        child.GuardianRelationship = dto.GuardianRelationship;
        child.MedicalNotes = dto.MedicalNotes;
        child.Notes = dto.Notes;
        child.IsActive = dto.IsActive;
        child.UpdatedBy = userId;

        await _db.SaveChangesAsync();
        return (await GetByIdAsync(id))!;
    }

    public async Task<bool> DeleteAsync(Guid id, string userId)
    {
        var child = await _db.Children.FindAsync(id)
            ?? throw new KeyNotFoundException("Niño no encontrado.");

        child.IsDeleted = true;
        child.DeletedAt = DateTime.UtcNow;
        child.UpdatedBy = userId;
        await _db.SaveChangesAsync();
        return true;
    }
}
