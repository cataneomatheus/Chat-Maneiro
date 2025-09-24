using Server.Hubs;
using Server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
builder.Services.AddSignalR();
builder.Services.AddSingleton<ChatMessageStore>();
builder.Services.AddSingleton<ConnectedUserTracker>();

var app = builder.Build();

app.UseCors("ClientPolicy");

app.MapGet("/api/history", (ChatMessageStore messageStore) =>
{
    return Results.Ok(messageStore.GetMessages());
}).RequireCors("ClientPolicy");

app.MapHub<ChatHub>("/hubs/chat").RequireCors("ClientPolicy");

app.Run();
