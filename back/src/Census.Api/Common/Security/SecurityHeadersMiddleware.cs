using Microsoft.AspNetCore.Http;

namespace Census.Api.Common.Security;

public sealed class SecurityHeadersMiddleware(
    RequestDelegate next)
{
    public async Task InvokeAsync(
        HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        var headers = context.Response.Headers;

        headers["X-Content-Type-Options"] =
            "nosniff";

        headers["X-Frame-Options"] =
            "DENY";

        headers["Referrer-Policy"] =
            "no-referrer";

        headers["Content-Security-Policy"] =
            "default-src 'none'; " +
            "frame-ancestors 'none'; " +
            "base-uri 'none'; " +
            "form-action 'none'";

        headers["Permissions-Policy"] =
            "camera=(), " +
            "microphone=(), " +
            "geolocation=(), " +
            "payment=(), " +
            "usb=()";

        if (context.Request.Path.StartsWithSegments(
                "/api/v1/auth"))
        {
            headers["Cache-Control"] =
                "no-store, no-cache, max-age=0";

            headers["Pragma"] =
                "no-cache";

            headers["Expires"] =
                "0";
        }

        await next(context);
    }
}
