using Census.Application.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Census.Api.Common.Errors;

public sealed class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var error = MapException(exception);

        if (error.StatusCode >=
            StatusCodes.Status500InternalServerError)
        {
            logger.LogError(
                exception,
                "Unhandled exception while processing {Method} {Path}",
                httpContext.Request.Method,
                httpContext.Request.Path);
        }
        else
        {
            logger.LogWarning(
                exception,
                "Request rejected while processing {Method} {Path}",
                httpContext.Request.Method,
                httpContext.Request.Path);
        }

        var problemDetails = new ProblemDetails
        {
            Status = error.StatusCode,
            Title = error.Title,
            Detail = error.Detail,
            Instance = httpContext.Request.Path
        };

        problemDetails.Extensions["traceId"] =
            httpContext.TraceIdentifier;

        httpContext.Response.StatusCode =
            error.StatusCode;

        await httpContext.Response.WriteAsJsonAsync(
            problemDetails,
            cancellationToken);

        return true;
    }

    private static ErrorDetails MapException(
        Exception exception)
    {
        return exception switch
        {
            AuthenticationFailedException =>
                new ErrorDetails(
                    StatusCodes.Status401Unauthorized,
                    "Authentification refusée.",
                    exception.Message),

            EntityNotFoundException =>
                new ErrorDetails(
                    StatusCodes.Status404NotFound,
                    "Ressource introuvable.",
                    exception.Message),

            ConflictException =>
                new ErrorDetails(
                    StatusCodes.Status409Conflict,
                    "Conflit de données.",
                    exception.Message),

            BusinessValidationException =>
                new ErrorDetails(
                    StatusCodes.Status400BadRequest,
                    "Règle métier invalide.",
                    exception.Message),

            ArgumentException =>
                new ErrorDetails(
                    StatusCodes.Status400BadRequest,
                    "Données invalides.",
                    exception.Message),

            _ =>
                new ErrorDetails(
                    StatusCodes.Status500InternalServerError,
                    "Une erreur interne est survenue.",
                    "La requête n’a pas pu être traitée.")
        };
    }

    private sealed record ErrorDetails(
        int StatusCode,
        string Title,
        string Detail);
}
