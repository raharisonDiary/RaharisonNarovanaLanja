using Census.Domain.AdministrativeAreas;
using Census.Domain.Authentication;
using Census.Domain.Campaigns;
using Census.Domain.Dwellings;
using Census.Domain.Households;
using Census.Domain.Persons;
using Census.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Census.Domain.Auditing;

namespace Census.Infrastructure.Persistence;

public sealed class CensusDbContext(
    DbContextOptions<CensusDbContext> options)
    : DbContext(options)
{
    public DbSet<AdministrativeArea>
        AdministrativeAreas =>
        Set<AdministrativeArea>();

    public DbSet<ApplicationUser> Users =>
        Set<ApplicationUser>();

    public DbSet<CensusCampaign> CensusCampaigns =>
        Set<CensusCampaign>();

    public DbSet<Dwelling> Dwellings =>
        Set<Dwelling>();

    public DbSet<Household> Households =>
        Set<Household>();

    public DbSet<Person> Persons =>
        Set<Person>();

    public DbSet<UserSession> UserSessions =>
        Set<UserSession>();

    public DbSet<AuditLog> AuditLogs =>
        Set<AuditLog>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasPostgresExtension(
            "postgis");

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(CensusDbContext).Assembly);
    }
}
