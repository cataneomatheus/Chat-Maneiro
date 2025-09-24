using System.Collections.Concurrent;
using System.Linq;

namespace Server.Services;

public class ConnectedUserTracker
{
    private readonly ConcurrentDictionary<string, string> _connections = new();

    public IReadOnlyCollection<string> RegisterConnection(string connectionId, string user)
    {
        var sanitizedUser = string.IsNullOrWhiteSpace(user) ? "Anonymous" : user.Trim();
        _connections[connectionId] = sanitizedUser;
        return GetOnlineUsers();
    }

    public IReadOnlyCollection<string> RemoveConnection(string connectionId)
    {
        _connections.TryRemove(connectionId, out _);
        return GetOnlineUsers();
    }

    public IReadOnlyCollection<string> GetOnlineUsers()
    {
        return _connections.Values
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Select(name => name.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(name => name, StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }
}
