using System.Security.Claims;
using Census.Application.Auditing.Models;
using Census.Application.Auditing.Services;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.Extensions.DependencyInjection;

namespace Census.Api.Common.Auditing;

public sealed class AuditTrailMiddleware(
    RequestDelegate next,
    IServiceScopeFactory serviceScopeFactory,
    ILogger<AuditTrailMiddleware> logger)
{
    public async Task InvokeAsync(
        HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        Exception? unhandledException = null;

        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            unhandledException = exception;
            throw;
        }
        finally
        {
            if (ShouldAudit(
                    context,
                    unhandledException))
            {
                await WriteAuditRecordSafelyAsync(
                    context,
                    unhandledException);
            }
        }
    }

    private async Task WriteAuditRecordSafelyAsync(
        HttpContext context,
        Exception? unhandledException)
    {
        try
        {
            await using var scope =
                serviceScopeFactory.CreateAsyncScope();

            var writer =
                scope.ServiceProvider
                    .GetRequiredService<
                        IAuditLogWriter>();

            var statusCode =
                unhandledException is null
                    ? context.Response.StatusCode
                    : StatusCodes
                        .Status500InternalServerError;

            var record =
                new AuditRecordModel(
                    OccurredAtUtc:
                        DateTimeOffset.UtcNow,

                    ActorUserId:
                        GetActorUserId(context.User),

                    ActorEmail:
                        GetFirstClaimValue(
                            context.User,
                            ClaimTypes.Email,
                            "email"),

                    ActorRole:
                        GetFirstClaimValue(
                            context.User,
                            ClaimTypes.Role,
                            "role"),

                    HttpMethod:
                        context.Request.Method,

                    RequestPath:
                        context.Request.Path.Value
                        ?? "/",

                    ActionName:
                        GetActionName(context),

                    EntityType:
                        GetEntityType(context),

                    EntityId:
                        GetEntityId(context),

                    StatusCode:
                        statusCode,

                    IpAddress:
                        context.Connection
                            .RemoteIpAddress?
                            .ToString(),

                    UserAgent:
                        context.Request
                            .Headers
                            .UserAgent
                            .ToString(),

                    TraceId:
                        context.TraceIdentifier,

                    FailureType:
                        GetFailureType(
                            statusCode,
                            unhandledException));

            await writer.WriteAsync(
                record,
                CancellationToken.None);
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Impossible d’enregistrer la trace d’audit pour {Method} {Path}.",
                context.Request.Method,
                context.Request.Path);
        }
    }

    private static bool ShouldAudit(
        HttpContext context,
        Exception? unhandledException)
    {
        var path =
            context.Request.Path;

        if (!path.StartsWithSegments(
                "/api/v1"))
        {
            return false;
        }

        if (unhandledException is not null)
        {
            return true;
        }

        if (context.Response.StatusCode >= 400)
        {
            return true;
        }

        return !HttpMethods.IsGet(
                   context.Request.Method) &&
               !HttpMethods.IsHead(
                   context.Request.Method) &&
               !HttpMethods.IsOptions(
                   context.Request.Method);
    }

    private static Guid? GetActorUserId(
        ClaimsPrincipal user)
    {
        var rawUserId =
            GetFirstClaimValue(
                user,
                ClaimTypes.NameIdentifier,
                "sub");

        return Guid.TryParse(
            rawUserId,
            out var userId)
                ? userId
                : null;
    }

    private static string? GetFirstClaimValue(
        ClaimsPrincipal user,
        params string[] claimTypes)
    {
        foreach (var claimType in claimTypes)
        {
            var value =
                user.FindFirst(claimType)?
                    .Value;

            if (!string.IsNullOrWhiteSpace(
                    value))
            {
                return value;
            }
        }

        return null;
    }

    private static string GetActionName(
        HttpContext context)
    {
        var descriptor =
            context.GetEndpoint()?
                .Metadata
                .GetMetadata<
                    ControllerActionDescriptor>();

        if (descriptor is not null)
        {
            return
                $"{descriptor.ControllerName}.{descriptor.ActionName}";
        }

        return
            $"{context.Request.Method} {context.Request.Path}";
    }

    private static string? GetEntityType(
        HttpContext context)
    {
        var descriptor =
            context.GetEndpoint()?
                .Metadata
                .GetMetadata<
                    ControllerActionDescriptor>();

        return descriptor?.ControllerName;
    }

    private static string? GetEntityId(
        HttpContext context)
    {
        string[] preferredKeys =
        [
            "id",
            "userId",
            "campaignId",
            "administrativeAreaId",
            "dwellingId",
            "householdId",
            "personId"
        ];

        foreach (var key in preferredKeys)
        {
            if (context.Request.RouteValues
                    .TryGetValue(
                        key,
                        out var value) &&
                value is not null)
            {
                return value.ToString();
            }
        }

        foreach (var routeValue in
                 context.Request.RouteValues)
        {
            if (routeValue.Key.EndsWith(
                    "Id",
                    StringComparison.OrdinalIgnoreCase) &&
                routeValue.Value is not null)
            {
                return routeValue.Value.ToString();
            }
        }

        return null;
    }

    private static string? GetFailureType(
        int statusCode,
        Exception? unhandledException)
    {
        if (unhandledException is not null)
        {
            return unhandledException
                .GetType()
                .Name;
        }

        return statusCode switch
        {
            StatusCodes.Status400BadRequest =>
                "BadRequest",

            StatusCodes.Status401Unauthorized =>
                "Unauthorized",

            StatusCodes.Status403Forbidden =>
                "Forbidden",

            StatusCodes.Status404NotFound =>
                "NotFound",

            StatusCodes.Status409Conflict =>
                "Conflict",

            >= 500 =>
                "ServerError",

            _ =>
                null
        };
    }
}
