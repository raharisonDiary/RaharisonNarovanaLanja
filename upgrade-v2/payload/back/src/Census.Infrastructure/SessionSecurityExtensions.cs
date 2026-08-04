using Census.Application.Authentication.Sessions.Repositories;
using Census.Application.Authentication.Sessions.Security;
using Census.Application.Authentication.Sessions.Services;
using Census.Application.Authentication.PasswordRecovery.Notifications;
using Census.Application.Authentication.PasswordRecovery.Services;
using Census.Infrastructure.Authentication.PasswordRecovery;
using Census.Infrastructure.Authentication.Sessions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Census.Infrastructure;

public static class SessionSecurityExtensions
{
    public static IServiceCollection AddSessionSecurity(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddOptions<UserSessionOptions>()
            .Bind(
                configuration.GetSection(
                    UserSessionOptions.SectionName))
            .Validate(
                options => options.IsValid(),
                "La configuration des sessions est invalide.")
            .ValidateOnStart();

        services
            .AddOptions<SessionJwtOptions>()
            .Bind(
                configuration.GetSection(
                    SessionJwtOptions.SectionName))
            .Validate(
                options => options.IsValid(),
                "La configuration JWT des sessions est invalide.")
            .ValidateOnStart();

        services.AddSingleton<
            PasswordHasher<object>>();

        services.AddSingleton<
            IRefreshTokenProtector,
            RefreshTokenProtector>();

        services.AddSingleton<
            ISessionAccessTokenService,
            SessionJwtAccessTokenService>();

        services.AddScoped<
            IUserSessionRepository,
            UserSessionRepository>();

        services.AddScoped<
            IUserSessionService,
            UserSessionService>();

        services
            .AddOptions<PasswordRecoveryOptions>()
            .Bind(configuration.GetSection(PasswordRecoveryOptions.SectionName))
            .Validate(options => options.IsValid(), "La configuration de récupération de mot de passe est invalide.")
            .ValidateOnStart();

        services.AddScoped<
            IPasswordRecoveryService,
            PasswordRecoveryService>();

        services
            .AddOptions<PasswordRecoveryEmailOptions>()
            .Bind(configuration.GetSection(PasswordRecoveryEmailOptions.SectionName))
            .Validate(options => options.IsValid(), "La configuration SMTP de récupération est invalide.")
            .ValidateOnStart();

        services.AddSingleton<
            IPasswordRecoveryNotifier,
            PasswordRecoveryNotifier>();

        services.AddHostedService<
            ExpiredSessionCleanupService>();

        return services;
    }
}
