using System.Security.Cryptography;
using Census.Api.Common.Auth;
using Census.Api.Common.Notifications;
using Census.Api.Contracts.Users;
using Census.Application.AdministrativeAreas.Repositories;
using Census.Application.Common.Exceptions;
using Census.Application.FieldWork.Security;
using Census.Application.Users.Models;
using Census.Application.Users.Repositories;
using Census.Application.Users.Services;
using Census.Domain.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Census.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/managed-users")]
public sealed class ManagedUsersController(
    IApplicationUserService userService,
    IApplicationUserRepository userRepository,
    IAdministrativeAreaRepository areaRepository,
    IAreaHierarchyQuery areaHierarchyQuery,
    CredentialEmailNotifier emailNotifier,
    WhatsAppCredentialNotifier whatsAppNotifier)
    : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ApplicationUserDto>>> GetAsync(
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var actor = await GetActorAsync(cancellationToken);
        var all = await userService.GetAllAsync(
            new ApplicationUserQueryModel(null, null, null, search),
            cancellationToken);

        if (actor.Role == UserRole.SystemAdministrator)
        {
            return Ok(all.Where(user =>
                    user.Role is UserRole.RegionalSupervisor or UserRole.Enumerator)
                .ToList());
        }

        if (actor.Role != UserRole.RegionalSupervisor ||
            !actor.AdministrativeAreaId.HasValue)
        {
            throw new BusinessValidationException(
                "Seuls l'administrateur et les chefs de région peuvent gérer des comptes.");
        }

        var result = new List<ApplicationUserDto>();
        foreach (var user in all.Where(value =>
                     value.Role == UserRole.Enumerator &&
                     value.AdministrativeAreaId.HasValue))
        {
            if (await areaHierarchyQuery.IsDescendantOrSelfAsync(
                    user.AdministrativeAreaId!.Value,
                    actor.AdministrativeAreaId.Value,
                    cancellationToken))
            {
                result.Add(user);
            }
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ProvisionedApplicationUserResponse>> CreateAsync(
        [FromBody] ProvisionApplicationUserRequest request,
        CancellationToken cancellationToken)
    {
        var actor = await GetActorAsync(cancellationToken);
        await EnsureCanProvisionAsync(actor, request, cancellationToken);

        var email = request.Email.Trim().ToLowerInvariant();
        var password = GeneratePassword();

        var created = await userService.CreateAsync(
            new CreateApplicationUserModel(
                request.FirstName,
                request.LastName,
                email,
                request.WhatsAppNumber,
                password,
                request.Role,
                request.AdministrativeAreaId),
            cancellationToken);

        // Un seul clic côté client déclenche automatiquement les deux canaux.
        var deliveryResults = await Task.WhenAll(
            emailNotifier.SendAsync(
                email,
                created.FullName,
                email,
                password,
                cancellationToken),
            whatsAppNotifier.SendAsync(
                request.WhatsAppNumber,
                created.FullName,
                email,
                password,
                cancellationToken));

        var emailStatus = deliveryResults[0];
        var whatsAppStatus = deliveryResults[1];

        var response = new ProvisionedApplicationUserResponse(
            created,
            email,
            emailStatus,
            whatsAppStatus,
            emailStatus == "Sent" && whatsAppStatus == "Sent",
            emailStatus == "Sent" && whatsAppStatus == "Sent"
                ? null
                : password);

        return Created(
            $"/api/v1/users/{created.Id}",
            response);
    }

    private async Task<ApplicationUser> GetActorAsync(
        CancellationToken cancellationToken)
    {
        var actorId = CurrentUserId.GetRequired(User);
        return await userRepository.GetByIdAsync(actorId, cancellationToken)
            ?? throw new AuthenticationFailedException(
                "Le compte connecté est introuvable.");
    }

    private async Task EnsureCanProvisionAsync(
        ApplicationUser actor,
        ProvisionApplicationUserRequest request,
        CancellationToken cancellationToken)
    {
        if (!request.AdministrativeAreaId.HasValue)
        {
            throw new BusinessValidationException(
                "Le territoire d'affectation est obligatoire.");
        }

        var targetArea = await areaRepository.GetByIdAsync(
            request.AdministrativeAreaId.Value,
            cancellationToken)
            ?? throw new EntityNotFoundException(
                "Le territoire sélectionné est introuvable.");

        if (actor.Role == UserRole.SystemAdministrator)
        {
            if (request.Role != UserRole.RegionalSupervisor)
            {
                throw new BusinessValidationException(
                    "L'administrateur crée ici uniquement les chefs de région.");
            }

            if (targetArea.Type !=
                Census.Domain.AdministrativeAreas.AdministrativeAreaType.Region)
            {
                throw new BusinessValidationException(
                    "Un chef de région doit être affecté à une région.");
            }

            return;
        }

        if (actor.Role != UserRole.RegionalSupervisor ||
            !actor.AdministrativeAreaId.HasValue)
        {
            throw new BusinessValidationException(
                "Vous n'êtes pas autorisé à créer ce compte.");
        }

        if (request.Role != UserRole.Enumerator)
        {
            throw new BusinessValidationException(
                "Un chef de région crée uniquement des comptes agents.");
        }

        var allowed = await areaHierarchyQuery.IsDescendantOrSelfAsync(
            targetArea.Id,
            actor.AdministrativeAreaId.Value,
            cancellationToken);
        if (!allowed)
        {
            throw new BusinessValidationException(
                "Le territoire de l'agent est en dehors de votre région.");
        }
    }

    private static string GeneratePassword()
    {
        const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const string lower = "abcdefghijkmnopqrstuvwxyz";
        const string digits = "23456789";
        const string symbols = "!@#$%";
        const string all = upper + lower + digits + symbols;

        var chars = new List<char>
        {
            upper[RandomNumberGenerator.GetInt32(upper.Length)],
            lower[RandomNumberGenerator.GetInt32(lower.Length)],
            digits[RandomNumberGenerator.GetInt32(digits.Length)],
            symbols[RandomNumberGenerator.GetInt32(symbols.Length)]
        };

        while (chars.Count < 14)
        {
            chars.Add(
                all[RandomNumberGenerator.GetInt32(all.Length)]);
        }

        for (var index = chars.Count - 1; index > 0; index--)
        {
            var target = RandomNumberGenerator.GetInt32(index + 1);
            (chars[index], chars[target]) =
                (chars[target], chars[index]);
        }

        return new string(chars.ToArray());
    }
}
