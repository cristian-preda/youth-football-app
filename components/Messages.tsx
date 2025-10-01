import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Send, Search, Plus, Pin, Users as UsersIcon, ArrowLeft, MoreVertical } from 'lucide-react';
import { chats, messages as allMessages, getMessagesByChatId, getUserById } from '../data/mockData';

export function Messages() {
  const { currentUser } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [localMessages, setLocalMessages] = useState<Array<{
    id: string;
    from: string;
    content: string;
    timestamp: string;
    chatId: string;
  }>>([]);

  if (!currentUser) return null;

  // Filter chats based on user role and team
  const userChats = chats.filter(chat => {
    // Show all chats for coach
    if (currentUser.role === 'coach') {
      return chat.clubId === currentUser.clubId &&
             (!chat.teamId || chat.teamId === currentUser.teamId);
    }
    // Parents see team chats and their direct messages
    if (currentUser.role === 'parent') {
      return chat.participants.includes(currentUser.id);
    }
    return false;
  });

  const selectedChat = selectedChatId ? chats.find(c => c.id === selectedChatId) : null;

  // Get messages for selected chat
  const chatMessages = selectedChat
    ? [...getMessagesByChatId(selectedChat.id), ...localMessages.filter(m => m.chatId === selectedChat.id)]
    : [];

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedChat && currentUser) {
      const newMessage = {
        id: `msg-${Date.now()}`,
        from: currentUser.id,
        content: messageInput.trim(),
        timestamp: new Date().toISOString(),
        chatId: selectedChat.id,
      };

      setLocalMessages([...localMessages, newMessage]);
      setMessageInput('');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Acum';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} h`;
    return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getChatName = (chat: typeof chats[0]) => {
    if (chat.type === 'direct') {
      // For direct chats, show the other person's name
      const otherParticipant = chat.participants.find(p => p !== currentUser.id);
      const user = otherParticipant ? getUserById(otherParticipant) : null;
      return user?.name || chat.name;
    }
    return chat.name;
  };

  const getUnreadCount = (chatId: string) => {
    // Mock unread logic - in real app this would check message.read status
    const chatMsgs = getMessagesByChatId(chatId);
    return chatMsgs.filter(m => !m.read && m.from !== currentUser.id).length;
  };

  const filteredChats = userChats.filter(chat =>
    getChatName(chat).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mobile: Show chat list or conversation
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  if (!selectedChat || mobileView === 'list') {
    return (
      <div className="space-y-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1>Mesaje</h1>
            <p className="text-muted-foreground">
              Comunică cu echipa
            </p>
          </div>
          {currentUser.role === 'coach' && (
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nou
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Caută conversații..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Chats List */}
        <div className="space-y-2">
          {filteredChats.map((chat) => {
            const lastMsg = [...getMessagesByChatId(chat.id), ...localMessages.filter(m => m.chatId === chat.id)].pop();
            const unreadCount = getUnreadCount(chat.id);
            const chatName = getChatName(chat);

            return (
              <Card
                key={chat.id}
                className={`p-4 cursor-pointer transition-colors hover:bg-muted ${
                  selectedChatId === chat.id ? 'bg-primary/5 border-primary' : ''
                }`}
                onClick={() => {
                  setSelectedChatId(chat.id);
                  setMobileView('chat');
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {chat.type === 'group' ? (
                          <UsersIcon className="w-5 h-5" />
                        ) : (
                          getInitials(chatName)
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {chat.pinned && <Pin className="w-3 h-3 text-muted-foreground" />}
                      <span className="font-medium truncate">{chatName}</span>
                      {chat.type === 'group' && (
                        <span className="text-xs text-muted-foreground">
                          ({chat.participants.length})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMsg?.content || 'Niciun mesaj'}
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {lastMsg && formatTimestamp(lastMsg.timestamp)}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredChats.length === 0 && (
          <Card className="p-8 text-center">
            <UsersIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Nicio conversație găsită' : 'Nu există conversații'}
            </p>
          </Card>
        )}
      </div>
    );
  }

  // Chat View
  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50">
      {/* Chat Header */}
      <div className="p-4 border-b bg-card flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedChatId(null);
            setMobileView('list');
          }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            {selectedChat.type === 'group' ? (
              <UsersIcon className="w-5 h-5" />
            ) : (
              getInitials(getChatName(selectedChat))
            )}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="truncate">{getChatName(selectedChat)}</h3>
          {selectedChat.type === 'group' && (
            <p className="text-sm text-muted-foreground">
              {selectedChat.participants.length} membri
            </p>
          )}
        </div>

        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {chatMessages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Niciun mesaj încă. Începe conversația!
            </p>
          </div>
        )}

        {chatMessages.map((message) => {
          const sender = getUserById(message.from);
          const isOwn = message.from === currentUser.id;

          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                {!isOwn && selectedChat.type === 'group' && (
                  <p className="text-xs font-medium mb-1 px-3 text-muted-foreground">
                    {sender?.name || 'Unknown'}
                  </p>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isOwn
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-card rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}
                  >
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            placeholder="Scrie un mesaj..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
