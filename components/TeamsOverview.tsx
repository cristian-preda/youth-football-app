// ABOUTME: Teams Overview component for Director role
// ABOUTME: Displays all club teams with performance metrics, player counts, and coach information

import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Users,
  Trophy,
  TrendingUp,
  Calendar,
  ChevronRight,
  Mail,
  Phone,
} from 'lucide-react';
import {
  getTeamsByClubId,
  getPlayersByTeamId,
  getEventsByTeamId,
  getUserById,
  clubs,
} from '../data/mockData';

export function TeamsOverview() {
  const { currentUser } = useAuth();
  const club = currentUser ? clubs.find(c => c.id === currentUser.clubId) : null;
  const clubTeams = club ? getTeamsByClubId(club.id) : [];

  // Calculate metrics for each team
  const teamsWithMetrics = clubTeams.map(team => {
    const players = getPlayersByTeamId(team.id);
    const events = getEventsByTeamId(team.id);
    const coach = getUserById(team.coachId);

    // Calculate match performance
    const matches = events.filter(e => 
      e.type === 'match' && 
      new Date(e.date) < new Date() && 
      e.matchDetails?.result
    );
    const wins = matches.filter(e => e.matchDetails?.result === 'win').length;
    const draws = matches.filter(e => e.matchDetails?.result === 'draw').length;
    const losses = matches.filter(e => e.matchDetails?.result === 'loss').length;
    const points = wins * 3 + draws;

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
      team,
      coach,
      playerCount: players.length,
      wins,
      draws,
      losses,
      points,
      matchesPlayed: matches.length,
      attendanceRate,
      goalsScored,
      goalsConceded,
      goalDifference: goalsScored - goalsConceded,
    };
  }).sort((a, b) => b.points - a.points);

  const getGenderLabel = (gender: 'boys' | 'girls' | 'mixed') => {
    switch (gender) {
      case 'boys': return 'Băieți';
      case 'girls': return 'Fete';
      case 'mixed': return 'Mixt';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Echipe</h1>
        <p className="text-muted-foreground">
          Privire de ansamblu asupra tuturor echipelor clubului
        </p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-xl font-semibold text-center">{clubTeams.length}</div>
            <div className="text-xs text-muted-foreground text-center">Total echipe</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className="p-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-xl font-semibold text-center">
              {teamsWithMetrics.reduce((sum, t) => sum + t.playerCount, 0)}
            </div>
            <div className="text-xs text-muted-foreground text-center">Jucători</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-xl font-semibold text-center">
              {teamsWithMetrics.reduce((sum, t) => sum + t.wins, 0)}
            </div>
            <div className="text-xs text-muted-foreground text-center">Victorii totale</div>
          </Card>
        </motion.div>
      </div>

      {/* Teams List */}
      <div className="space-y-3">
        {teamsWithMetrics.map((item, index) => (
          <motion.div
            key={item.team.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow">
              {/* Team Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base">{item.team.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {getGenderLabel(item.team.gender)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.playerCount} jucători • {item.team.ageGroup}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Coach Info */}
              {item.coach && (
                <div className="mb-3 p-2 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Antrenor</div>
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{item.coach.name}</div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Phone className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Mail className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <div className="text-lg font-semibold">{item.attendanceRate}%</div>
                  <div className="text-xs text-muted-foreground">Prezență</div>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <div className="text-lg font-semibold">{item.matchesPlayed}</div>
                  <div className="text-xs text-muted-foreground">Meciuri</div>
                </div>
              </div>

              {/* Match Results */}
              {item.matchesPlayed > 0 && (
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-green-600">{item.wins}V</div>
                    <div className="text-xs text-muted-foreground">Victorii</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-yellow-600">{item.draws}E</div>
                    <div className="text-xs text-muted-foreground">Egaluri</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-red-600">{item.losses}Î</div>
                    <div className="text-xs text-muted-foreground">Înfrângeri</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-primary">{item.points}P</div>
                    <div className="text-xs text-muted-foreground">Puncte</div>
                  </div>
                </div>
              )}

              {/* Goals */}
              {item.matchesPlayed > 0 && (
                <div className="flex items-center justify-around pt-3 mt-3 border-t border-border text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Goluri:</span>
                    <span className="font-semibold">{item.goalsScored}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Primite:</span>
                    <span className="font-semibold">{item.goalsConceded}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Golaveraj:</span>
                    <span className={`font-semibold ${item.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.goalDifference >= 0 ? '+' : ''}{item.goalDifference}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {clubTeams.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="mb-2">Nu există echipe</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Începe prin a crea prima echipă a clubului
            </p>
            <Button variant="default">
              <Users className="w-4 h-4 mr-2" />
              Adaugă echipă
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

