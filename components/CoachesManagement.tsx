// ABOUTME: Coaches Management component for Director role
// ABOUTME: Displays all club coaches with their teams, performance metrics, and contact information

import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  User,
  Trophy,
  Users,
  Mail,
  Phone,
  TrendingUp,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import {
  getCoachesByClubId,
  getTeamById,
  getPlayersByTeamId,
  getEventsByTeamId,
  clubs,
} from '../data/mockData';

export function CoachesManagement() {
  const { currentUser } = useAuth();
  const club = currentUser ? clubs.find(c => c.id === currentUser.clubId) : null;
  const coaches = club ? getCoachesByClubId(club.id) : [];

  // Calculate metrics for each coach
  const coachesWithMetrics = coaches.map(coach => {
    const team = coach.teamId ? getTeamById(coach.teamId) : null;
    const players = team ? getPlayersByTeamId(team.id) : [];
    const events = team ? getEventsByTeamId(team.id) : [];

    // Calculate match performance
    const matches = events.filter(e => 
      e.type === 'match' && 
      new Date(e.date) < new Date() && 
      e.matchDetails?.result
    );
    const wins = matches.filter(e => e.matchDetails?.result === 'win').length;
    const draws = matches.filter(e => e.matchDetails?.result === 'draw').length;
    const losses = matches.filter(e => e.matchDetails?.result === 'loss').length;
    const winRate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0;

    // Calculate attendance rate
    const allAttendance = events.flatMap(e => e.attendance);
    const presentCount = allAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = allAttendance.length > 0
      ? Math.round((presentCount / allAttendance.length) * 100)
      : 0;

    // Calculate goals
    const goalsScored = matches.reduce((sum, e) => sum + (e.matchDetails?.score?.team || 0), 0);
    const goalsConceded = matches.reduce((sum, e) => sum + (e.matchDetails?.score?.opponent || 0), 0);

    return {
      coach,
      team,
      playerCount: players.length,
      matchesPlayed: matches.length,
      wins,
      draws,
      losses,
      winRate,
      attendanceRate,
      goalsScored,
      goalsConceded,
    };
  }).sort((a, b) => b.winRate - a.winRate);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Antrenori</h1>
        <p className="text-muted-foreground">
          Gestionează antrenorii clubului și performanțele lor
        </p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-2">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-xl font-semibold text-center">{coaches.length}</div>
            <div className="text-xs text-muted-foreground text-center">Total antrenori</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className="p-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-xl font-semibold text-center">
              {coachesWithMetrics.reduce((sum, c) => sum + c.wins, 0)}
            </div>
            <div className="text-xs text-muted-foreground text-center">Victorii totale</div>
          </Card>
        </motion.div>
      </div>

      {/* Coaches List */}
      <div className="space-y-4">
        {coachesWithMetrics.map((item, index) => (
          <motion.div
            key={item.coach.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow">
              {/* Coach Header */}
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="w-14 h-14 flex-shrink-0">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {getInitials(item.coach.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold mb-1">{item.coach.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {item.team && (
                      <Badge variant="secondary" className="text-xs">
                        {item.team.name}
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {item.playerCount} jucători
                    </span>
                  </div>
                  {/* Contact Buttons */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8">
                      <Phone className="w-3.5 h-3.5 mr-1.5" />
                      <span className="text-xs">Apel</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      <Mail className="w-3.5 h-3.5 mr-1.5" />
                      <span className="text-xs">Email</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                      <span className="text-xs">Mesaj</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1 mb-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{item.coach.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{item.coach.phone}</span>
                </div>
              </div>

              {/* Performance Metrics */}
              {item.matchesPlayed > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-center p-2 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{item.winRate}%</div>
                      <div className="text-xs text-muted-foreground">Procent victorii</div>
                    </div>
                    <div className="text-center p-2 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{item.attendanceRate}%</div>
                      <div className="text-xs text-muted-foreground">Prezență echipă</div>
                    </div>
                  </div>

                  {/* Match Results */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <div className="text-sm font-semibold">{item.matchesPlayed}</div>
                      <div className="text-xs text-muted-foreground">Meciuri</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="text-sm font-semibold text-green-600">{item.wins}</div>
                      <div className="text-xs text-muted-foreground">Victorii</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded-lg">
                      <div className="text-sm font-semibold text-yellow-600">{item.draws}</div>
                      <div className="text-xs text-muted-foreground">Egaluri</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                      <div className="text-sm font-semibold text-red-600">{item.losses}</div>
                      <div className="text-xs text-muted-foreground">Înfrângeri</div>
                    </div>
                  </div>

                  {/* Goals Stats */}
                  <div className="flex items-center justify-around pt-3 border-t border-border text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{item.goalsScored}</div>
                      <div className="text-xs text-muted-foreground">Goluri marcate</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-red-600">{item.goalsConceded}</div>
                      <div className="text-xs text-muted-foreground">Goluri primite</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold ${item.goalsScored - item.goalsConceded >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.goalsScored - item.goalsConceded >= 0 ? '+' : ''}{item.goalsScored - item.goalsConceded}
                      </div>
                      <div className="text-xs text-muted-foreground">Golaveraj</div>
                    </div>
                  </div>
                </>
              )}

              {/* No matches played yet */}
              {item.matchesPlayed === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nu s-au jucat încă meciuri</p>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {coaches.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 text-center">
            <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="mb-2">Nu există antrenori</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Începe prin a adăuga primul antrenor al clubului
            </p>
            <Button variant="default">
              <User className="w-4 h-4 mr-2" />
              Adaugă antrenor
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      {coaches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Acțiuni rapide</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Trimite mesaj tuturor antrenorilor
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Vezi programul antrenorilor
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

