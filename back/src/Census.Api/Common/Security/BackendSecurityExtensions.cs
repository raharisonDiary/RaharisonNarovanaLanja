using System.Text.Json;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Census.Api.Common.Security;

public static class BackendSecurityExtensions
{
    private const int DefaultApiRequestsPerMinute = 120;
    private const int DefaultLoginAttemptsPerMinute = 10;

    private const long DefaultMaximumRequestBodySizeBytes =
        10 * 1024 * 1024;

    public static IServiceCollection AddBackendSecurity(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        var apiRequestsPerMinute =
            ReadPositiveInteger(
                configuration,
                "Security:ApiRequestsPerMinute",
                DefaultApiRequestsPerMinute);

        var loginAttemptsPerMinute =
            ReadPositiveInteger(
                configuration,
                "Security:LoginAttemptsPerMinute",
                DefaultLoginAttemptsPerMinute);

        var maximumRequestBodySizeBytes =
            ReadPositiveLong(
                configuration,
                "Security:MaximumRequestBodySizeBytes",
                DefaultMaximumRequestBodySizeBytes);

        services.Configure<KestrelServerOptions>(
            options =>
            {
                options.Limits.MaxRequestBodySize =
                    maximumRequestBodySizeBytes;
            });

        services.AddRateLimiter(
            options =>
            {
                options.RejectionStatusCode =
                    StatusCodes.Status429TooManyRequests;

                options.GlobalLimiter =
                    PartitionedRateLimiter.Create<
                        HttpContext,
                        string>(
                        context =>
                        {
                            var requestPath =
                                context.Request.Path.Value;

                            var isLoginRequest =
                                string.Equals(
                                    requestPath,
                                    "/api/v1/auth/login",
                                    StringComparison.OrdinalIgnoreCase) ||
                                string.Equals(
                                    requestPath,
                                    "/api/v1/sessions/login",
                                    StringComparison.OrdinalIgnoreCase) ||
                                string.Equals(
                                    requestPath,
                                    "/api/v1/sessions/refresh",
                                    StringComparison.OrdinalIgnoreCase);

                            var remoteAddress =
                                context.Connection
                                    .RemoteIpAddress?
                                    .ToString()
                                ?? "unknown";

                            var limiterCategory =
                                isLoginRequest
                                    ? "authentication"
                                    : "api";

                            var permitLimit =
                                isLoginRequest
                                    ? loginAttemptsPerMinute
                                    : apiRequestsPerMinute;

                            return RateLimitPartition
                                .GetFixedWindowLimiter(
                                    partitionKey:
                                        $"{remoteAddress}:{limiterCategory}",
                                    factory:
                                        _ =>
                                            new FixedWindowRateLimiterOptions
                                            {
                                                PermitLimit =
                                                    permitLimit,

                                                Window =
                                                    TimeSpan.FromMinutes(1),

                                                QueueLimit = 0,

                                                QueueProcessingOrder =
                                                    QueueProcessingOrder
                                                        .OldestFirst,

                                                AutoReplenishment = true
                                            });
                        });

                options.OnRejected =
                    async (
                        context,
                        cancellationToken) =>
                    {
                        var response =
                            context.HttpContext.Response;

                        response.StatusCode =
                            StatusCodes
                                .Status429TooManyRequests;

                        response.ContentType =
                            "application/problem+json";

                        response.Headers.RetryAfter =
                            "60";

                        var problem = new
                        {
                            type =
                                "https://httpstatuses.com/429",

                            title =
                                "Trop de requêtes.",

                            status =
                                StatusCodes
                                    .Status429TooManyRequests,

                            detail =
                                "La limite temporaire de requêtes a été atteinte. Réessayez dans une minute.",

                            traceId =
                                context.HttpContext
                                    .TraceIdentifier
                        };

                        await JsonSerializer.SerializeAsync(
                            response.Body,
                            problem,
                            cancellationToken:
                                cancellationToken);
                    };
            });

        return services;
    }

    private static int ReadPositiveInteger(
        IConfiguration configuration,
        string key,
        int defaultValue)
    {
        var value =
            configuration.GetValue<int?>(
                key)
            ?? defaultValue;

        if (value <= 0)
        {
            throw new InvalidOperationException(
                $"La configuration '{key}' doit être supérieure à zéro.");
        }

        return value;
    }

    private static long ReadPositiveLong(
        IConfiguration configuration,
        string key,
        long defaultValue)
    {
        var value =
            configuration.GetValue<long?>(
                key)
            ?? defaultValue;

        if (value <= 0)
        {
            throw new InvalidOperationException(
                $"La configuration '{key}' doit être supérieure à zéro.");
        }

        return value;
    }
}
