using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Application.Errors;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace API.Middleware
{
  public class ErrorHandlingMiddleware
  {
    public RequestDelegate _next { get; }
    public ILogger<ErrorHandlingMiddleware> _logger { get; }
    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
      _logger = logger;
      _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
      try
      {
        await _next(context);
      }
      catch (Exception ex)
      {
        await HandleExcetionAsync(context, ex);
      }
    }

    private async Task HandleExcetionAsync(HttpContext context, Exception ex)
    {
      object errors = null;

      switch (ex)
      {
        case RestException re:
          _logger.LogError(ex, "REST ERROR");
          errors = re.Errors;
          context.Response.StatusCode = (int)re.Code;
          break;
        case Exception e:
          _logger.LogError(ex, "SERVER ERROR");
          errors = string.IsNullOrWhiteSpace(e.Message) ? "Error" : e.Message;
          context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
          break;

      }

      context.Response.ContentType = "application/json";
      if (errors != null)
      {
        var result = JsonSerializer.Serialize(new { errors });

        await context.Response.WriteAsync(result);
      }
    }
  }
}