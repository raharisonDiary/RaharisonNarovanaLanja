using System.IdentityModel.Tokens.Jwt;
using Census.Application.AdministrativeAreas.Repositories;
using Census.Application.AdministrativeAreas.Services;
using Census.Application.Authentication.Security;
using Census.Application.Authentication.Services;
using Census.Application.Users.Repositories;
using Census.Application.Users.Security;
using Census.Infrastructure.AdministrativeAreas.Repositories;
using Census.Infrastructure.Bootstrap;
using Census.Infrastructure.Persistence;
using Census.Infrastructure.Security;
using Census.Infrastructure.Users.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Census.Application.Authorization;
using Census.Domain.Users;
using Census.Application.Users.Services;
using Census.Application.Campaigns.Repositories;
using Census.Application.Campaigns.Services;
using Census.Infrastructure.Campaigns.Repositories;

namespace Census.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        AddDatabase(
            services,
            configuration);

        AddPasswordSecurity(services);

        AddJwtAuthentication(
            services,
            configuration);

        services.Configure<BootstrapAdminOptions>(
            configuration.GetSection(
                BootstrapAdminOptions.SectionName));

        services.AddSingleton<TimeProvider>(
            TimeProvider.System);

        services.AddScoped<
            IAdministrativeAreaRepository,
            AdministrativeAreaRepository>();

        services.AddScoped<
            IAdministrativeAreaService,
            AdministrativeAreaService>();

        services.AddScoped<
            IApplicationUserRepository,
            ApplicationUserRepository>();

        services.AddScoped<
            IPasswordService,
            AspNetPasswordService>();

        services.AddScoped<
            IAuthenticationService,
            AuthenticationService>();

        services.AddSingleton<
            IAccessTokenService,
            JwtAccessTokenService>();

        services.AddScoped<
            IApplicationUserService,
            ApplicationUserService>();

        services.AddScoped<
    ICensusCampaignRepository,
    CensusCampaignRepository>();

services.AddScoped<
    ICensusCampaignService,
    CensusCampaignService>();

        return services;
    }

    private static void AddDatabase(
        IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString =
            configuration.GetConnectionString(
                "CensusDatabase")
            ?? throw new InvalidOperationException(
                "La chaîne de connexion " +
                "'CensusDatabase' est introuvable.");

        services.AddDbContext<CensusDbContext>(
            options =>
                options.UseNpgsql(
                    connectionString,
                    postgreSqlOptions =>
                    {
                        postgreSqlOptions
                            .UseNetTopologySuite();

                        postgreSqlOptions
                            .EnableRetryOnFailure(
                                maxRetryCount: 5,
                                maxRetryDelay:
                                    TimeSpan.FromSeconds(10),
                                errorCodesToAdd: null);
                    }));
    }

    private static void AddPasswordSecurity(
        IServiceCollection services)
    {
        services.Configure<PasswordHasherOptions>(
            options =>
            {
                options.CompatibilityMode =
                    PasswordHasherCompatibilityMode
                        .IdentityV3;
            });
    }

    private static void AddJwtAuthentication(
        IServiceCollection services,
        IConfiguration configuration)
    {
        var jwtSection =
            configuration.GetSection(
                JwtOptions.SectionName);

        var jwtOptions =
            jwtSection.Get<JwtOptions>()
            ?? throw new InvalidOperationException(
                "La configuration JWT est introuvable.");

        jwtOptions.Validate();

        services.Configure<JwtOptions>(
            jwtSection);

        var signingKey =
            new SymmetricSecurityKey(
                jwtOptions.GetSigningKeyBytes());

        services
            .AddAuthentication(
                JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
{
    options.MapInboundClaims = false;
    options.SaveToken = false;

    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,

            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,

            ValidateLifetime = true,
            RequireExpirationTime = true,
            RequireSignedTokens = true,

            ClockSkew = TimeSpan.FromSeconds(30),

            NameClaimType =
                JwtRegisteredClaimNames.Sub,

            RoleClaimType = "role"
        };

    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var subject = context.Principal?
                .FindFirst(
                    JwtRegisteredClaimNames.Sub)?
                .Value;

            if (!Guid.TryParse(
                    subject,
                    out var userId))
            {
                context.Fail(
                    "Le jeton ne contient pas un identifiant valide.");

                return;
            }

            var userRepository =
                context.HttpContext.RequestServices
                    .GetRequiredService<
                        IApplicationUserRepository>();

            var user =
                await userRepository.GetByIdAsync(
                    userId,
                    context.HttpContext
                        .RequestAborted);

            if (user is null || !user.IsActive)
            {
                context.Fail(
                    "Le compte utilisateur est indisponible.");
            }
        }
    };
});

        services.AddAuthorization(options =>
{
    options.AddPolicy(
        AuthorizationPolicies.ManageAdministrativeAreas,
        policy =>
        {
            policy.RequireAuthenticatedUser();

            policy.RequireRole(
                UserRole.SystemAdministrator.ToString(),
                UserRole.NationalCoordinator.ToString());
        });

    options.AddPolicy(
        AuthorizationPolicies.ManageUsers,
        policy =>
        {
            policy.RequireAuthenticatedUser();

            policy.RequireRole(
                UserRole.SystemAdministrator.ToString());
        });

    options.AddPolicy(
        AuthorizationPolicies.AccessNationalData,
        policy =>
        {
            policy.RequireAuthenticatedUser();

            policy.RequireRole(
                UserRole.SystemAdministrator.ToString(),
                UserRole.NationalCoordinator.ToString(),
                UserRole.Analyst.ToString());
        });

        options.AddPolicy(
    AuthorizationPolicies.ManageCampaigns,
    policy =>
    {
        policy.RequireAuthenticatedUser();

        policy.RequireRole(
            UserRole.SystemAdministrator.ToString(),
            UserRole.NationalCoordinator.ToString());
    });

    options.AddPolicy(
        AuthorizationPolicies.AccessRegionalData,
        policy =>
        {
            policy.RequireAuthenticatedUser();

            policy.RequireRole(
                UserRole.SystemAdministrator.ToString(),
                UserRole.NationalCoordinator.ToString(),
                UserRole.RegionalSupervisor.ToString(),
                UserRole.Enumerator.ToString(),
                UserRole.Analyst.ToString());
        });
});
    }
}
