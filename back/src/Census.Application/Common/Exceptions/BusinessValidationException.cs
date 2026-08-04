namespace Census.Application.Common.Exceptions;

public sealed class BusinessValidationException(string message)
    : Exception(message);
