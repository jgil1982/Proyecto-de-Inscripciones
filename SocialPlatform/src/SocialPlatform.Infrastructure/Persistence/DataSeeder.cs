using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SocialPlatform.Domain.Entities;
using SocialPlatform.Domain.Enums;

namespace SocialPlatform.Infrastructure.Persistence;

public static class DataSeeder
{
    public const string SuperAdminRole = "SuperAdmin";
    public const string ChurchAdminRole = "ChurchAdmin";
    public const string ViewerRole = "Viewer";

    public static async Task SeedAsync(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        await SeedRolesAsync(roleManager);
        await SeedSuperAdminAsync(userManager);
        await SeedDemoDataAsync(context, userManager);
    }

    private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
    {
        string[] roles = [SuperAdminRole, ChurchAdminRole, ViewerRole];
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    private static async Task SeedSuperAdminAsync(UserManager<ApplicationUser> userManager)
    {
        const string email = "admin@spi.ci.org";
        if (await userManager.FindByEmailAsync(email) is not null) return;

        var admin = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FirstName = "Super",
            LastName = "Administrador",
            EmailConfirmed = true,
            IsActive = true
        };

        var result = await userManager.CreateAsync(admin, "Admin@123456!");
        if (result.Succeeded)
            await userManager.AddToRoleAsync(admin, SuperAdminRole);
    }

    private static async Task SeedDemoDataAsync(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        if (await context.Churches.AnyAsync()) return;

        var church = new Church
        {
            Name = "Iglesia Central Demo",
            LegalName = "Iglesia Central Demo S.A.S.",
            Address = "Calle 123 #45-67",
            City = "Bogotá",
            State = "Cundinamarca",
            Country = "Colombia",
            Phone = "+57 300 123 4567",
            Email = "demo@iglesiacentral.org",
            PastorName = "Pastor Juan García",
            Status = ChurchStatus.Active,
            ApprovedAt = DateTime.UtcNow
        };
        context.Churches.Add(church);
        await context.SaveChangesAsync();

        var churchAdmin = new ApplicationUser
        {
            UserName = "iglesia@spi.ci.org",
            Email = "iglesia@spi.ci.org",
            FirstName = "Admin",
            LastName = "Iglesia Demo",
            EmailConfirmed = true,
            IsActive = true,
            ChurchId = church.Id
        };

        var result = await userManager.CreateAsync(churchAdmin, "Church@123456!");
        if (result.Succeeded)
            await userManager.AddToRoleAsync(churchAdmin, ChurchAdminRole);

        var interventions = new List<Intervention>
        {
            new()
            {
                Name = "Programa Alimentación Escolar",
                Category = "Alimentación",
                Description = "Apoyo nutricional para niños en edad escolar",
                StartDate = DateTime.UtcNow.AddMonths(-3),
                EndDate = DateTime.UtcNow.AddMonths(9),
                Status = InterventionStatus.Active,
                MinAge = 5,
                MaxAge = 14,
                Location = "Sede Principal",
                IsPublic = true
            },
            new()
            {
                Name = "Refuerzo Educativo",
                Category = "Educación",
                Description = "Clases de apoyo en matemáticas y español",
                StartDate = DateTime.UtcNow.AddMonths(-1),
                Status = InterventionStatus.Active,
                MinAge = 6,
                MaxAge = 16,
                MaxParticipants = 50,
                IsPublic = true
            },
            new()
            {
                Name = "Taller de Arte y Cultura",
                Category = "Arte",
                Description = "Desarrollo de habilidades artísticas",
                StartDate = DateTime.UtcNow.AddMonths(1),
                Status = InterventionStatus.Planning,
                MinAge = 4,
                MaxAge = 18,
                MaxParticipants = 30,
                IsPublic = true
            }
        };
        context.Interventions.AddRange(interventions);

        var children = new List<Child>
        {
            new() { FirstName = "María", LastName = "González", DocumentNumber = "1234567890", BirthDate = DateTime.UtcNow.AddYears(-10), Gender = Gender.Female, ChurchId = church.Id, GuardianName = "Ana González", GuardianPhone = "+57 310 000 0001" },
            new() { FirstName = "Carlos", LastName = "Martínez", DocumentNumber = "1234567891", BirthDate = DateTime.UtcNow.AddYears(-8), Gender = Gender.Male, ChurchId = church.Id, GuardianName = "Luis Martínez", GuardianPhone = "+57 310 000 0002" },
            new() { FirstName = "Sofía", LastName = "Rodríguez", DocumentNumber = "1234567892", BirthDate = DateTime.UtcNow.AddYears(-12), Gender = Gender.Female, ChurchId = church.Id, GuardianName = "Carmen Rodríguez", GuardianPhone = "+57 310 000 0003" },
            new() { FirstName = "Andrés", LastName = "López", DocumentNumber = "1234567893", BirthDate = DateTime.UtcNow.AddYears(-7), Gender = Gender.Male, ChurchId = church.Id, GuardianName = "Pedro López", GuardianPhone = "+57 310 000 0004" },
            new() { FirstName = "Valentina", LastName = "Pérez", DocumentNumber = "1234567894", BirthDate = DateTime.UtcNow.AddYears(-9), Gender = Gender.Female, ChurchId = church.Id, GuardianName = "Rosa Pérez", GuardianPhone = "+57 310 000 0005" },
        };
        context.Children.AddRange(children);
        await context.SaveChangesAsync();

        var participations = new List<Participation>
        {
            new() { ChildId = children[0].Id, InterventionId = interventions[0].Id, Status = ParticipationStatus.Active },
            new() { ChildId = children[0].Id, InterventionId = interventions[1].Id, Status = ParticipationStatus.Active },
            new() { ChildId = children[1].Id, InterventionId = interventions[0].Id, Status = ParticipationStatus.Active },
            new() { ChildId = children[2].Id, InterventionId = interventions[1].Id, Status = ParticipationStatus.Completed, CompletedAt = DateTime.UtcNow.AddDays(-15) },
            new() { ChildId = children[3].Id, InterventionId = interventions[0].Id, Status = ParticipationStatus.Active },
            new() { ChildId = children[4].Id, InterventionId = interventions[1].Id, Status = ParticipationStatus.Active },
        };
        context.Participations.AddRange(participations);
        await context.SaveChangesAsync();
    }
}
