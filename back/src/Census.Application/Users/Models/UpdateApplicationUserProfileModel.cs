namespace Census.Application.Users.Models;

public sealed record UpdateApplicationUserProfileModel(
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber);
