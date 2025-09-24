using System.Collections.Concurrent;
using Server.Models;

namespace Server.Services;

public class ChatMessageStore
{
    private const int MaxMessages = 50;
    private readonly ConcurrentQueue<ChatMessage> _messages = new();

    public ChatMessage AddMessage(string user, string message, DateTime timestampUtc)
    {
        var chatMessage = new ChatMessage(user, message, timestampUtc);
        _messages.Enqueue(chatMessage);
        TrimExcess();
        return chatMessage;
    }

    public IReadOnlyList<ChatMessage> GetMessages()
    {
        return _messages.ToArray();
    }

    private void TrimExcess()
    {
        while (_messages.Count > MaxMessages && _messages.TryDequeue(out _))
        {
        }
    }
}
