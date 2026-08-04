using Census.Application.Users.Models;

namespace Census.Api.Contracts.Users;

public sealed record ProvisionedApplicationUserResponse(
    ApplicationUserDto User,
    string GeneratedEmail,
    string EmailNotificationStatus,
    string WhatsAppNotificationStatus,
    bool AllNotificationsSent,
    string? TemporaryPasswordFallback);
