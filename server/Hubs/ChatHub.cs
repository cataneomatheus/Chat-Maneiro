using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Server.Services;

namespace Server.Hubs;

public class ChatHub : Hub
{
    private readonly ChatMessageStore _messageStore;
    private readonly ConnectedUserTracker _userTracker;

    public ChatHub(ChatMessageStore messageStore, ConnectedUserTracker userTracker)
    {
        _messageStore = messageStore;
        _userTracker = userTracker;
    }

    public async Task SendMessage(string user, string message)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            return;
        }

        var sanitizedUser = string.IsNullOrWhiteSpace(user) ? "Anonymous" : user.Trim();
        var sanitizedMessage = message.Trim();
        var timestamp = DateTime.UtcNow;
        var chatMessage = _messageStore.AddMessage(sanitizedUser, sanitizedMessage, timestamp);
        await Clients.All.SendAsync("ReceiveMessage", chatMessage.User, chatMessage.Message, chatMessage.Timestamp);
    }

    public Task StartTyping(string user)
    {
        var sanitizedUser = string.IsNullOrWhiteSpace(user) ? "Anonymous" : user.Trim();
        return Clients.Others.SendAsync("UserStartedTyping", sanitizedUser);
    }

    public Task StopTyping(string user)
    {
        var sanitizedUser = string.IsNullOrWhiteSpace(user) ? "Anonymous" : user.Trim();
        return Clients.Others.SendAsync("UserStoppedTyping", sanitizedUser);
    }

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var user = httpContext?.Request.Query["user"].ToString() ?? "Anonymous";
        var sanitizedUser = string.IsNullOrWhiteSpace(user) ? "Anonymous" : user.Trim();
        var users = _userTracker.RegisterConnection(Context.ConnectionId, sanitizedUser);
        await Clients.All.SendAsync("UsersOnlineChanged", new { count = users.Count, users });
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var users = _userTracker.RemoveConnection(Context.ConnectionId);
        await Clients.All.SendAsync("UsersOnlineChanged", new { count = users.Count, users });
        await base.OnDisconnectedAsync(exception);
    }
}
