namespace Census.Application.Authentication.Models;

public sealed record LoginModel(
    string Email,
    string Password);
