namespace SocialPlatform.Application.DTOs.Dashboard;

public record GlobalDashboardDto
{
    public int TotalChurches { get; init; }
    public int ActiveChurches { get; init; }
    public int PendingChurches { get; init; }
    public int TotalChildren { get; init; }
    public int ActiveChildren { get; init; }
    public int TotalInterventions { get; init; }
    public int ActiveInterventions { get; init; }
    public int TotalParticipations { get; init; }
    public int CompletedParticipations { get; init; }
    public List<ChurchKpiDto> TopChurches { get; init; } = new();
    public List<InterventionKpiDto> TopInterventions { get; init; } = new();
    public List<MonthlyStatsDto> MonthlyStats { get; init; } = new();
    public List<ChurchStatusChartDto> ChurchStatusChart { get; init; } = new();
    public List<GenderChartDto> GenderChart { get; init; } = new();
    public List<AgeGroupChartDto> AgeGroupChart { get; init; } = new();
}

public record ChurchDashboardDto
{
    public string ChurchName { get; init; } = string.Empty;
    public int TotalChildren { get; init; }
    public int ActiveChildren { get; init; }
    public int TotalParticipations { get; init; }
    public int ActiveParticipations { get; init; }
    public int CompletedParticipations { get; init; }
    public int AvailableInterventions { get; init; }
    public List<InterventionKpiDto> MyInterventions { get; init; } = new();
    public List<GenderChartDto> GenderChart { get; init; } = new();
    public List<AgeGroupChartDto> AgeGroupChart { get; init; } = new();
    public List<MonthlyStatsDto> MonthlyRegistrations { get; init; } = new();
}

public record ChurchKpiDto
{
    public Guid ChurchId { get; init; }
    public string ChurchName { get; init; } = string.Empty;
    public int ChildrenCount { get; init; }
    public int ParticipationsCount { get; init; }
}

public record InterventionKpiDto
{
    public Guid InterventionId { get; init; }
    public string InterventionName { get; init; } = string.Empty;
    public string? Category { get; init; }
    public int ParticipantsCount { get; init; }
    public string Status { get; init; } = string.Empty;
}

public record MonthlyStatsDto
{
    public string Month { get; init; } = string.Empty;
    public int Children { get; init; }
    public int Participations { get; init; }
    public int Completions { get; init; }
}

public record ChurchStatusChartDto
{
    public string Name { get; init; } = string.Empty;
    public int Value { get; init; }
    public string Color { get; init; } = string.Empty;
}

public record GenderChartDto
{
    public string Name { get; init; } = string.Empty;
    public int Value { get; init; }
    public string Color { get; init; } = string.Empty;
}

public record AgeGroupChartDto
{
    public string Group { get; init; } = string.Empty;
    public int Count { get; init; }
}
