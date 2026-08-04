using System.Net.Mail;
using Census.Application.Users.Repositories;
using Census.Application.Users.Security;
using Census.Domain.Users;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Census.Infrastructure.Bootstrap;

public static class InitialAdministratorSeeder
{
    public static async Task SeedInitialAdministratorAsync(
        this IServiceProvider serviceProvider,
        CancellationToken cancellationToken = default)
    {
        using var scope =
            serviceProvider.CreateScope();

        var services = scope.ServiceProvider;

        var logger = services
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger(
                nameof(InitialAdministratorSeeder));

        var options = services
            .GetRequiredService<
                IOptions<BootstrapAdminOptions>>()
            .Value;

        if (string.IsNullOrWhiteSpace(options.Email) ||
            string.IsNullOrWhiteSpace(options.Password))
        {
            logger.LogWarning(
                "Le premier administrateur n’a pas été créé : " +
                "BootstrapAdmin:Email ou BootstrapAdmin:Password est absent.");

            return;
        }

        var normalizedEmail =
            options.Email.Trim().ToLowerInvariant();

        if (!MailAddress.TryCreate(
                normalizedEmail,
                out _))
        {
            throw new InvalidOperationException(
                "L’adresse e-mail du premier administrateur est invalide.");
        }

        if (options.Password.Length < 12)
        {
            throw new InvalidOperationException(
                "Le mot de passe du premier administrateur " +
                "doit contenir au moins 12 caractères.");
        }

        var repository = services
            .GetRequiredService<
                IApplicationUserRepository>();

        var alreadyExists =
            await repository
                .ExistsByEmailIncludingDeletedAsync(
    normalizedEmail,
    excludedId: null,
    cancellationToken);

        if (alreadyExists)
        {
            logger.LogInformation(
                "Le compte administrateur initial existe déjà.");

            return;
        }

        var passwordService = services
            .GetRequiredService<IPasswordService>();

        var timeProvider = services
            .GetRequiredService<TimeProvider>();

        var passwordHash =
            passwordService.Hash(options.Password);

        var administrator = new ApplicationUser(
            options.FirstName,
            options.LastName,
            normalizedEmail,
            phoneNumber: null,
            passwordHash,
            UserRole.SystemAdministrator,
            administrativeAreaId: null,
            timeProvider.GetUtcNow());

        await repository.AddAsync(
            administrator,
            cancellationToken);

        await repository.SaveChangesAsync(
            cancellationToken);

        logger.LogInformation(
            "Le premier administrateur a été créé pour {Email}.",
            normalizedEmail);
    }
}
