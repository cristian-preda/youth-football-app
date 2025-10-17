import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Send, Users as UsersIcon, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import { getUserById, getTeamById, getPlayersByTeamId } from '../data/mockData';

interface TeamMessage {
  id: string;
  from: string;
  content: string;
  timestamp: string;
  type: 'message' | 'attendance_question';
  responses?: {
    userId: string;
    answer: 'yes' | 'no';
    timestamp: string;
  }[];
}

export function MessagesSimplified() {
  const { currentUser } = useAuth();

  // Mock team messages - in real app, this would come from backend
  const [messages, setMessages] = useState<TeamMessage[]>([
    {
      id: 'msg-1',
      from: 'user-coach-1',
      content: 'Bună ziua! Antrenamentul de mâine se va desfășura la ora 17:00. Vă rog să confirmați prezența.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'message',
    },
    {
      id: 'msg-2',
      from: 'user-coach-1',
      content: 'Copiii vin la meciul de Sâmbătă?',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: 'attendance_question',
      responses: [
        { userId: 'user-parent-1', answer: 'yes', timestamp: new Date(Date.now() - 1500000).toISOString() },
        { userId: 'user-parent-2', answer: 'yes', timestamp: new Date(Date.now() - 1200000).toISOString() },
      ],
    },
  ]);

  const [messageInput, setMessageInput] = useState('');

  if (!currentUser) return null;

  const team = currentUser.teamId ? getTeamById(currentUser.teamId) : null;
  const teamPlayers = team ? getPlayersByTeamId(team.id) : [];

  const handleSendMessage = () => {
    if (messageInput.trim() && currentUser.role === 'coach') {
      const newMessage: TeamMessage = {
        id: `msg-${Date.now()}`,
        from: currentUser.id,
        content: messageInput.trim(),
        timestamp: new Date().toISOString(),
        type: 'message',
      };
      setMessages([...messages, newMessage]);
      setMessageInput('');
    }
  };

  const handleSendAttendanceQuestion = () => {
    if (currentUser.role === 'coach') {
      const newMessage: TeamMessage = {
        id: `msg-${Date.now()}`,
        from: currentUser.id,
        content: 'Copiii vin la următorul eveniment?',
        timestamp: new Date().toISOString(),
        type: 'attendance_question',
        responses: [],
      };
      setMessages([...messages, newMessage]);
    }
  };

  const handleAttendanceResponse = (messageId: string, answer: 'yes' | 'no') => {
    if (currentUser.role === 'parent') {
      setMessages(messages.map(msg => {
        if (msg.id === messageId) {
          const existingResponse = msg.responses?.find(r => r.userId === currentUser.id);
          if (existingResponse) {
            // Update existing response
            return {
              ...msg,
              responses: msg.responses?.map(r =>
                r.userId === currentUser.id
                  ? { ...r, answer, timestamp: new Date().toISOString() }
                  : r
              ),
            };
          } else {
            // Add new response
            return {
              ...msg,
              responses: [
                ...(msg.responses || []),
                { userId: currentUser.id, answer, timestamp: new Date().toISOString() },
              ],
            };
          }
        }
        return msg;
      }));
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
    return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUserResponse = (message: TeamMessage) => {
    return message.responses?.find(r => r.userId === currentUser.id);
  };

  return (
    <div className="flex flex-col h-screen bg-background pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-b bg-card sticky top-0 z-10"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <UsersIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2>{team?.name || 'Echipa'} - Grup</h2>
            <p className="text-sm text-muted-foreground">
              Antrenor + Jucători + Părinți
            </p>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => {
            const sender = getUserById(message.from);
            const isCoach = sender?.role === 'coach';
            const userResponse = getUserResponse(message);

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className={`p-4 ${isCoach ? 'bg-primary/5 border-primary/20' : ''}`}>
                  {/* Message Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(sender?.name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{sender?.name}</span>
                        {isCoach && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                            Antrenor
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</p>
                    </div>
                  </div>

                  {/* Message Content */}
                  <p className="text-sm mb-3">{message.content}</p>

                  {/* Attendance Question Responses */}
                  {message.type === 'attendance_question' && (
                    <div className="space-y-3 pt-3 border-t">
                      {/* Parent Response Buttons */}
                      {currentUser.role === 'parent' && (
                        <div className="flex gap-2">
                          <Button
                            variant={userResponse?.answer === 'yes' ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAttendanceResponse(message.id, 'yes')}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            DA
                          </Button>
                          <Button
                            variant={userResponse?.answer === 'no' ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAttendanceResponse(message.id, 'no')}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            NU
                          </Button>
                        </div>
                      )}

                      {/* Response Summary */}
                      {message.responses && message.responses.length > 0 && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">
                            Răspunsuri ({message.responses.length}/{teamPlayers.length})
                          </p>
                          <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-green-600">
                                {message.responses.filter(r => r.answer === 'yes').length} DA
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="font-medium text-red-600">
                                {message.responses.filter(r => r.answer === 'no').length} NU
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Niciun mesaj încă</h3>
            <p className="text-sm text-muted-foreground">
              {currentUser.role === 'coach'
                ? 'Trimite primul mesaj către echipă'
                : 'Așteptăm mesaje de la antrenor'}
            </p>
          </div>
        )}
      </div>

      {/* Input Area - Only for Coach */}
      {currentUser.role === 'coach' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t bg-card"
        >
          <div className="space-y-2">
            {/* Quick Action: Attendance Question */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleSendAttendanceQuestion}
            >
              <UsersIcon className="w-4 h-4 mr-2" />
              Întreabă cine vine
            </Button>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Trimite mesaj către echipă..."
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
        </motion.div>
      )}

      {/* Parents see info message */}
      {currentUser.role === 'parent' && (
        <div className="p-4 border-t bg-muted/30">
          <p className="text-xs text-center text-muted-foreground">
            Poți răspunde la întrebările antrenorului folosind butoanele DA/NU
          </p>
        </div>
      )}
    </div>
  );
}
