// ABOUTME: Club Announcements component for Director role
// ABOUTME: Allows director to create and manage club-wide announcements for all teams

import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Bell,
  Pin,
  Users,
  User,
  Baby,
  Calendar,
  Eye,
  Plus,
  Megaphone,
} from 'lucide-react';
import {
  getAnnouncementsByClubId,
  clubs,
} from '../data/mockData';

export function ClubAnnouncements() {
  const { currentUser } = useAuth();
  const club = currentUser ? clubs.find(c => c.id === currentUser.clubId) : null;
  const announcements = club ? getAnnouncementsByClubId(club.id) : [];

  // Sort: pinned first, then by date
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'all': return 'Toată lumea';
      case 'coaches': return 'Antrenori';
      case 'parents': return 'Părinți';
      case 'players': return 'Jucători';
      default: return audience;
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'all': return Users;
      case 'coaches': return User;
      case 'parents': return Baby;
      case 'players': return Users;
      default: return Users;
    }
  };

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'all': return 'text-primary';
      case 'coaches': return 'text-blue-600';
      case 'parents': return 'text-green-600';
      case 'players': return 'text-purple-600';
      default: return 'text-primary';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const announcementDate = new Date(date);
    announcementDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - announcementDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Astăzi';
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return `Acum ${diffDays} zile`;

    const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const pinnedCount = announcements.filter(a => a.pinned).length;
  const totalReads = announcements.reduce((sum, a) => sum + a.readBy.length, 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Anunțuri Club</h1>
        <p className="text-muted-foreground">
          Comunică cu toți membrii clubului
        </p>
      </motion.div>

      {/* Create Announcement Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Button className="w-full h-14" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Creează anunț nou
        </Button>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Megaphone className="w-5 h-5 text-primary" />
            </div>
            <div className="text-xl font-semibold text-center">{announcements.length}</div>
            <div className="text-xs text-muted-foreground text-center">Total anunțuri</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card className="p-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center mx-auto mb-2">
              <Pin className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-xl font-semibold text-center">{pinnedCount}</div>
            <div className="text-xs text-muted-foreground text-center">Fixate</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mx-auto mb-2">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-xl font-semibold text-center">{totalReads}</div>
            <div className="text-xs text-muted-foreground text-center">Citite</div>
          </Card>
        </motion.div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {sortedAnnouncements.map((announcement, index) => {
          const AudienceIcon = getAudienceIcon(announcement.targetAudience);
          const audienceColor = getAudienceColor(announcement.targetAudience);
          
          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <Card className={`p-4 hover:shadow-md transition-shadow ${
                announcement.pinned ? 'border-yellow-200 bg-yellow-50/30' : ''
              }`}>
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    announcement.pinned ? 'bg-yellow-100' : 'bg-primary/10'
                  }`}>
                    {announcement.pinned ? (
                      <Pin className="w-5 h-5 text-yellow-700" />
                    ) : (
                      <Bell className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold leading-tight">{announcement.title}</h3>
                      {announcement.pinned && (
                        <Badge variant="default" className="bg-yellow-500 text-yellow-950 text-xs flex-shrink-0">
                          Fixat
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(announcement.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {announcement.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <AudienceIcon className={`w-4 h-4 ${audienceColor}`} />
                    <span className="text-xs font-medium">
                      {getAudienceLabel(announcement.targetAudience)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{announcement.readBy.length} citit</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                    Editează
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                    {announcement.pinned ? 'Anulează fixare' : 'Fixează'}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                    Șterge
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {announcements.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 text-center">
            <Megaphone className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="mb-2">Nu există anunțuri</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Începe prin a crea primul anunț pentru club
            </p>
            <Button variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Creează anunț
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      {announcements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Șabloane rapide</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-sm h-9">
                <Calendar className="w-4 h-4 mr-2" />
                Schimbare program
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm h-9">
                <Users className="w-4 h-4 mr-2" />
                Eveniment club
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm h-9">
                <Bell className="w-4 h-4 mr-2" />
                Anunț important
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

