using Census.Application.Dashboard;
using Census.Application.Dwellings.Repositories;
using Census.Application.Dwellings.Services;
using Census.Application.FieldWork.Security;
using Census.Application.Households.Repositories;
using Census.Application.Households.Services;
using Census.Application.Persons.Repositories;
using Census.Application.Persons.Services;
using Census.Domain.Users;
using Census.Infrastructure.Dashboard;
using Census.Infrastructure.Dwellings.Repositories;
using Census.Infrastructure.FieldWork;
using Census.Infrastructure.Households.Repositories;
using Census.Infrastructure.Persons.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Census.Infrastructure;

public static class BackendCompletionExtensions
{
    public const string FrontendCorsPolicy =
        "FrontendClients";

    public static IServiceCollection AddBackendCompletion(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var allowedOrigins =
            configuration
                .GetSection("Cors:AllowedOrigins")
                .Get<string[]>()
            ??
            [
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:8080",
                "http://localhost:8081",
                "http://localhost:19006"
            ];

        services.AddScoped<
            IAreaHierarchyQuery,
            AreaHierarchyQuery>();

        services.AddScoped<
            IFieldAuthorizationService,
            FieldAuthorizationService>();

        services.AddScoped<
            IDwellingRepository,
            DwellingRepository>();

        services.AddScoped<
            IDwellingService,
            DwellingService>();

        services.AddScoped<
            IHouseholdRepository,
            HouseholdRepository>();

        services.AddScoped<
            IHouseholdService,
            HouseholdService>();

        services.AddScoped<
            IPersonRepository,
            PersonRepository>();

        services.AddScoped<
            IPersonService,
            PersonService>();

        services.AddScoped<
            ICensusDashboardQuery,
            CensusDashboardQuery>();

        services.AddCors(
            options =>
            {
                options.AddPolicy(
                    FrontendCorsPolicy,
                    policy =>
                    {
                        policy
                            .WithOrigins(allowedOrigins)
                            .AllowAnyHeader()
                            .AllowAnyMethod();
                    });
            });

        services.AddAuthorization(
            options =>
            {
                options.AddPolicy(
                    FieldAuthorizationPolicies
                        .ManageFieldData,
                    policy =>
                    {
                        policy.RequireAuthenticatedUser();

                        policy.RequireRole(
                            UserRole.SystemAdministrator
                                .ToString(),
                            UserRole.NationalCoordinator
                                .ToString(),
                            UserRole.RegionalSupervisor
                                .ToString(),
                            UserRole.Enumerator
                                .ToString());
                    });

                options.AddPolicy(
                    FieldAuthorizationPolicies
                        .ValidateFieldData,
                    policy =>
                    {
                        policy.RequireAuthenticatedUser();

                        policy.RequireRole(
                            UserRole.SystemAdministrator
                                .ToString(),
                            UserRole.NationalCoordinator
                                .ToString(),
                            UserRole.RegionalSupervisor
                                .ToString());
                    });

                options.AddPolicy(
                    FieldAuthorizationPolicies
                        .ViewCensusDashboard,
                    policy =>
                    {
                        policy.RequireAuthenticatedUser();

                        policy.RequireRole(
                            UserRole.SystemAdministrator
                                .ToString(),
                            UserRole.NationalCoordinator
                                .ToString(),
                            UserRole.RegionalSupervisor
                                .ToString(),
                            UserRole.Analyst
                                .ToString());
                    });
            });

        return services;
    }
}
