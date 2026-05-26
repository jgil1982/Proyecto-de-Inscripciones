using Microsoft.EntityFrameworkCore;
using SocialPlatform.Application.DTOs;
using SocialPlatform.Application.DTOs.Auth;
using SocialPlatform.Application.DTOs.Churches;
using SocialPlatform.Application.Interfaces;
using SocialPlatform.Domain.Entities;
using SocialPlatform.Domain.Enums;

namespace SocialPlatform.Application.Services;

public class ChurchService : IChurchService
{
    private readonly IApplicationDbContext _db;
    private readonly IAuthService _authService;

    public ChurchService(IApplicationDbContext db, IAuthService authService)
    {
        _db = db;
        _authService = authService;
    }

    public async Task<PagedResult<ChurchListDto>> GetAllAsync(ChurchQueryDto query)
    {
        var q = _db.Churches.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
            q = q.Where(c => c.Name.Contains(query.Search) || c.City.Contains(query.Search) || c.Email.Contains(query.Search));

        if (query.Status.HasValue)
            q = q.Where(c => c.Status == query.Status.Value);

        if (!string.IsNullOrWhiteSpace(query.City))
            q = q.Where(c => c.City.Contains(query.City));

        var total = await q.CountAsync();

        q = query.SortBy?.ToLower() switch
        {
            "name" => query.SortDescending ? q.OrderByDescending(c => c.Name) : q.OrderBy(c => c.Name),
            "city" => query.SortDescending ? q.OrderByDescending(c => c.City) : q.OrderBy(c => c.City),
            _ => q.OrderByDescending(c => c.CreatedAt)
        };

        var items = await q
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(c => new ChurchListDto
            {
                Id = c.Id,
                Name = c.Name,
                City = c.City,
                State = c.State,
                Email = c.Email,
                Phone = c.Phone,
                PastorName = c.PastorName,
                Status = c.Status,
                ChildrenCount = c.Children.Count(ch => !ch.IsDeleted),
                CreatedAt = c.CreatedAt,
                LogoUrl = c.LogoUrl
            })
            .ToListAsync();

        return new PagedResult<ChurchListDto>
        {
            Items = items,
            TotalCount = total,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<ChurchDetailDto?> GetByIdAsync(Guid id)
    {
        var c = await _db.Churches
            .Include(x => x.Children)
            .Include(x => x.Users)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (c is null) return null;

        return new ChurchDetailDto
        {
            Id = c.Id,
            Name = c.Name,
            LegalName = c.LegalName,
            TaxId = c.TaxId,
            Address = c.Address,
            City = c.City,
            State = c.State,
            Country = c.Country,
            Phone = c.Phone,
            Email = c.Email,
            Website = c.Website,
            PastorName = c.PastorName,
            Description = c.Description,
            Status = c.Status,
            LogoUrl = c.LogoUrl,
            ChildrenCount = c.Children.Count(ch => !ch.IsDeleted),
            UsersCount = c.Users.Count,
            ApprovedAt = c.ApprovedAt,
            ApprovedBy = c.ApprovedBy,
            RejectionReason = c.RejectionReason,
            CreatedAt = c.CreatedAt,
            ActiveInterventions = await _db.Participations
                .CountAsync(p => p.Child.ChurchId == id && p.Status == Domain.Enums.ParticipationStatus.Active)
        };
    }

    public async Task<ChurchDetailDto> CreateAsync(CreateChurchDto dto, string userId)
    {
        if (await _db.Churches.AnyAsync(c => c.Email == dto.Email))
            throw new InvalidOperationException("Ya existe una iglesia con ese correo electrónico.");

        var church = new Church
        {
            Name = dto.Name,
            LegalName = dto.LegalName,
            TaxId = dto.TaxId,
            Address = dto.Address,
            City = dto.City,
            State = dto.State,
            Country = dto.Country,
            Phone = dto.Phone,
            Email = dto.Email,
            Website = dto.Website,
            PastorName = dto.PastorName,
            Description = dto.Description,
            Status = ChurchStatus.Pending,
            CreatedBy = userId
        };

        _db.Churches.Add(church);
        await _db.SaveChangesAsync();

        await _authService.RegisterChurchAdminAsync(new RegisterChurchAdminDto(
            dto.AdminEmail, dto.AdminPassword,
            dto.AdminFirstName, dto.AdminLastName,
            church.Id
        ));

        return (await GetByIdAsync(church.Id))!;
    }

    public async Task<ChurchDetailDto> UpdateAsync(Guid id, UpdateChurchDto dto, string userId)
    {
        var church = await _db.Churches.FindAsync(id)
            ?? throw new KeyNotFoundException("Iglesia no encontrada.");

        church.Name = dto.Name;
        church.LegalName = dto.LegalName;
        church.TaxId = dto.TaxId;
        church.Address = dto.Address;
        church.City = dto.City;
        church.State = dto.State;
        church.Phone = dto.Phone;
        church.Website = dto.Website;
        church.PastorName = dto.PastorName;
        church.Description = dto.Description;
        church.UpdatedBy = userId;

        await _db.SaveChangesAsync();
        return (await GetByIdAsync(id))!;
    }

    public async Task<bool> ApproveAsync(Guid id, string adminId)
    {
        var church = await _db.Churches.FindAsync(id)
            ?? throw new KeyNotFoundException("Iglesia no encontrada.");

        church.Status = ChurchStatus.Active;
        church.ApprovedAt = DateTime.UtcNow;
        church.ApprovedBy = adminId;
        church.UpdatedBy = adminId;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectAsync(Guid id, string adminId, string reason)
    {
        var church = await _db.Churches.FindAsync(id)
            ?? throw new KeyNotFoundException("Iglesia no encontrada.");

        church.Status = ChurchStatus.Rejected;
        church.RejectionReason = reason;
        church.UpdatedBy = adminId;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SuspendAsync(Guid id, string adminId)
    {
        var church = await _db.Churches.FindAsync(id)
            ?? throw new KeyNotFoundException("Iglesia no encontrada.");

        church.Status = ChurchStatus.Suspended;
        church.UpdatedBy = adminId;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, string userId)
    {
        var church = await _db.Churches.FindAsync(id)
            ?? throw new KeyNotFoundException("Iglesia no encontrada.");

        church.IsDeleted = true;
        church.DeletedAt = DateTime.UtcNow;
        church.UpdatedBy = userId;
        await _db.SaveChangesAsync();
        return true;
    }
}
