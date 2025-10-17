import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Trophy, Calendar, Target, TrendingUp, Clock, MapPin, Users, Bell, Heart, MessageCircle } from 'lucide-react';
import { clubs } from '../data/mockData';
import type { NewsPost } from '../types';

interface NewsFeedProps {
  onNavigate?: (tab: string) => void;
}

export function NewsFeed({ onNavigate }: NewsFeedProps) {
  const { currentUser } = useAuth();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  if (!currentUser) return null;

  const club = clubs.find(c => c.id === currentUser.clubId);

  // TODO: This will come from mockData - for now, hardcoded sample news
  const newsPosts: NewsPost[] = [
    {
      id: 'news-1',
      type: 'match_result',
      title: 'Victorie impresionantă: U9 vs FC Rapid - 4-2',
      content: 'Echipa noastră U9 a obținut o victorie clară în fața FC Rapid, cu un scor de 4-2. David Stanciu a marcat 2 goluri, iar Andrei Dumitrescu și Mihai Vasile au completat tabela marcatorilor.',
      clubId: 'club-1',
      teamId: 'team-1',
      createdBy: 'user-coach-1',
      createdAt: '2025-01-15T14:30:00',
      eventId: 'event-1',
      pinned: true,
    },
    {
      id: 'news-2',
      type: 'announcement',
      title: 'Schimbare orar antrenamente',
      content: 'Începând cu săptămâna viitoare, antrenamentele echipei U9 se vor desfășura Marți și Joi de la ora 17:00 în loc de 16:30.',
      clubId: 'club-1',
      teamId: 'team-1',
      createdBy: 'user-coach-1',
      createdAt: '2025-01-14T10:00:00',
      pinned: false,
    },
    {
      id: 'news-3',
      type: 'player_highlight',
      title: 'Jucătorul săptămânii: David Stanciu',
      content: 'Felicitări lui David pentru performanța excepțională din ultimele 3 meciuri! 5 goluri și 2 pase decisive. Continuă tot așa!',
      clubId: 'club-1',
      teamId: 'team-1',
      createdBy: 'user-coach-1',
      createdAt: '2025-01-13T18:00:00',
      pinned: false,
    },
    {
      id: 'news-4',
      type: 'training_update',
      title: 'Focus pe finalizare săptămâna aceasta',
      content: 'Antrenamentele din această săptămână vor pune accent pe tehnica de finalizare și lovituri la poartă. Vom lucra și poziționarea în careu.',
      clubId: 'club-1',
      teamId: 'team-1',
      createdBy: 'user-coach-1',
      createdAt: '2025-01-12T09:00:00',
      pinned: false,
    },
  ];

  const handleLike = (postId: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  const getPostIcon = (type: NewsPost['type']) => {
    switch (type) {
      case 'match_result':
        return Trophy;
      case 'announcement':
        return Bell;
      case 'training_update':
        return Calendar;
      case 'player_highlight':
        return Target;
      default:
        return Bell;
    }
  };

  const getPostColor = (type: NewsPost['type']) => {
    switch (type) {
      case 'match_result':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'announcement':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'training_update':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'player_highlight':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPostTypeLabel = (type: NewsPost['type']) => {
    switch (type) {
      case 'match_result':
        return 'Rezultat Meci';
      case 'announcement':
        return 'Anunț';
      case 'training_update':
        return 'Antrenament';
      case 'player_highlight':
        return 'Jucător';
      default:
        return 'Știri';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return 'Acum';
    if (diffHours < 24) return `${diffHours}h în urmă`;
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return `${diffDays} zile în urmă`;
    return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1>Bine ai venit!</h1>
        <p className="text-muted-foreground">Ultimele știri de la {club?.name}</p>
      </motion.div>

      {/* Club Info Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="mb-1">{club?.name}</h2>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {club?.city}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {club?.teams.length} echipe
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Fondat {club?.founded}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Trophy, label: 'Meciuri', value: '12', color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { icon: Target, label: 'Goluri', value: '28', color: 'text-green-600', bg: 'bg-green-50' },
          { icon: TrendingUp, label: 'Victorii', value: '8', color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            >
              <Card className="p-3 text-center">
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* News Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2>Știri recente</h2>
          {currentUser.role === 'coach' && (
            <Button variant="ghost" size="sm">
              + Postare nouă
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {newsPosts.map((post, index) => {
            const Icon = getPostIcon(post.type);
            const isLiked = likedPosts.has(post.id);

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              >
                <Card className={`p-4 ${post.pinned ? 'border-2 border-primary/30' : ''}`}>
                  {/* Post Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={getPostColor(post.type)}>
                          {getPostTypeLabel(post.type)}
                        </Badge>
                        {post.pinned && (
                          <Badge variant="default" className="bg-primary">
                            Fixat
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold leading-tight mb-1">{post.title}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{post.content}</p>

                  {/* Post Actions */}
                  <div className="flex items-center gap-4 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 -ml-2"
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="text-xs">{isLiked ? 'Îmi place' : 'Like'}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">Comentează</span>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <Card className="p-6 text-center bg-muted/30">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="mb-2">Vezi programul complet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Verifică meciurile și antrenamentele viitoare
          </p>
          <Button onClick={() => onNavigate?.('schedule')}>
            <Calendar className="w-4 h-4 mr-2" />
            Vezi Programul
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
