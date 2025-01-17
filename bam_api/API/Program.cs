using System.Text;
using System.Text.Json.Serialization;
using System.Text.Json;
using API.Data;
using API.Extensions;
using API.Interfaces;
using API.Middleware;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplicationService(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);

builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder => 
        builder
            .SetIsOriginAllowed(_ => true) // Allow any origin
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
        c.RoutePrefix = string.Empty;
    });
}
app.UseMiddleware<ExceptionMiddleware>();

app.UseCors("CorsPolicy");
// app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod()
//     .WithOrigins(
//         "http://localhost:4200",
//         "https://localhost:4200",
//         "http://localhost:5001",
//         "https://localhost:5002",
//         "http://localhost:5003",
//         "https://localhost:5004",
//         "http://localhost:5005",
//         "https://localhost:5006",
//         "http://localhost:4999" 
//     ));


// In app configuration
app.UseAuthentication();
app.UseAuthorization();

// Configure the HTTP request pipeline.
app.MapControllers();

app.Run();
