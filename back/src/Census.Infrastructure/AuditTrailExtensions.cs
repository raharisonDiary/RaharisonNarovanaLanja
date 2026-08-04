using Census.Application.Auditing.Services;
using Census.Application.Auditing.Queries;
using Census.Infrastructure.Auditing;
using Microsoft.Extensions.DependencyInjection;

namespace Census.Infrastructure;

public static class AuditTrailExtensions
{
    public static IServiceCollection AddAuditTrail(
        this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddScoped<
            IAuditLogWriter,
            AuditLogWriter>();

        services.AddScoped<
            IAuditLogQuery,
            AuditLogQuery>();

        return services;
    }
}
