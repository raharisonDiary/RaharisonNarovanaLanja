using System.Globalization;
using System.Security.Cryptography;
using System.Text;
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
    WhatsAppCredentialNotifier notifier)
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

        var email = string.IsNullOrWhiteSpace(request.Email)
            ? GenerateEmail(request.FirstName, request.LastName)
            : request.Email.Trim().ToLowerInvariant();
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

        var status = await notifier.SendAsync(
            request.WhatsAppNumber,
            created.FullName,
            email,
            password,
            cancellationToken);

        var response = new ProvisionedApplicationUserResponse(
            created,
            email,
            password,
            status,
            WhatsAppCredentialNotifier.BuildPreviewUrl(
                request.WhatsAppNumber,
                created.FullName,
                email,
                password));

        return Created($"/api/v1/users/{created.Id}", response);
    }

    private async Task<ApplicationUser> GetActorAsync(
        CancellationToken cancellationToken)
    {
        var actorId = CurrentUserId.GetRequired(User);
        return await userRepository.GetByIdAsync(actorId, cancellationToken)
            ?? throw new AuthenticationFailedException("Le compte connecté est introuvable.");
    }

    private async Task EnsureCanProvisionAsync(
        ApplicationUser actor,
        ProvisionApplicationUserRequest request,
        CancellationToken cancellationToken)
    {
        if (!request.AdministrativeAreaId.HasValue)
        {
            throw new BusinessValidationException("Le territoire d'affectation est obligatoire.");
        }

        var targetArea = await areaRepository.GetByIdAsync(
            request.AdministrativeAreaId.Value,
            cancellationToken)
            ?? throw new EntityNotFoundException("Le territoire sélectionné est introuvable.");

        if (actor.Role == UserRole.SystemAdministrator)
        {
            if (request.Role != UserRole.RegionalSupervisor)
            {
                throw new BusinessValidationException(
                    "L'administrateur crée ici uniquement les chefs de région.");
            }

            if (targetArea.Type != Census.Domain.AdministrativeAreas.AdministrativeAreaType.Region)
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

    private static string GenerateEmail(string firstName, string lastName)
    {
        var local = $"{Slug(firstName)}.{Slug(lastName)}.{RandomNumberGenerator.GetInt32(1000, 10000)}";
        return $"{local}@census.mg";
    }

    private static string Slug(string value)
    {
        var normalized = value.Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder();
        foreach (var character in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) == UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            if (char.IsLetterOrDigit(character))
            {
                builder.Append(char.ToLowerInvariant(character));
            }
        }

        return builder.Length == 0 ? "user" : builder.ToString();
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
            chars.Add(all[RandomNumberGenerator.GetInt32(all.Length)]);
        }

        for (var index = chars.Count - 1; index > 0; index--)
        {
            var target = RandomNumberGenerator.GetInt32(index + 1);
            (chars[index], chars[target]) = (chars[target], chars[index]);
        }

        return new string(chars.ToArray());
    }
}
