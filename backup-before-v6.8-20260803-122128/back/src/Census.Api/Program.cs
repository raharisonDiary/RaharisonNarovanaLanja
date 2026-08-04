using System.Text.Json.Serialization;
using Census.Api.Common.Auditing;
using Census.Api.Common.Campaigns;
using Census.Api.Common.Errors;
using Census.Api.Common.Notifications;
using Census.Api.Common.Security;
using Census.Infrastructure;
using Census.Infrastructure.Bootstrap;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .AddJsonOptions(
        options =>
        {
            options.JsonSerializerOptions
                .Converters
                .Add(
                    new JsonStringEnumConverter(
                        namingPolicy: null,
                        allowIntegerValues: false));
        });

builder.Services.AddOpenApi();

builder.Services.AddProblemDetails();

builder.Services
    .AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddHealthChecks();

builder.Services.AddHttpClient<WhatsAppCredentialNotifier>();

builder.Services.AddHostedService<CampaignLifecycleHostedService>();

builder.Services.AddInfrastructure(
    builder.Configuration);

builder.Services.AddBackendCompletion(
    builder.Configuration);

builder.Services.AddBackendSecurity(
    builder.Configuration);

builder.Services.AddSessionSecurity(
    builder.Configuration);

builder.Services.AddAuditTrail();

var app = builder.Build();

app.UseMiddleware<AuditTrailMiddleware>();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    app.UseHsts();
}

app.UseMiddleware<SecurityHeadersMiddleware>();

app.UseHttpsRedirection();

app.UseCors(
    BackendCompletionExtensions.FrontendCorsPolicy);

app.UseRateLimiter();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapHealthChecks("/health");

await app.Services
    .SeedInitialAdministratorAsync();

app.Run();

public partial class Program;
