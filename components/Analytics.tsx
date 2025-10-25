// ABOUTME: Analytics component for Director role
// ABOUTME: Displays club-wide analytics, trends, and performance insights

import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Trophy,
  Target,
  Activity,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  getTeamsByClubId,
  getPlayersByClubId,
  getEventsByClubId,
  getTeamById,
  clubs,
  players,
} from '../data/mockData';

export function Analytics() {
  const { currentUser } = useAuth();
  const club = currentUser ? clubs.find(c => c.id === currentUser.clubId) : null;
  const clubTeams = club ? getTeamsByClubId(club.id) : [];
  const allClubPlayers = club ? getPlayersByClubId(club.id) : [];
  const allClubEvents = club ? getEventsByClubId(club.id) : [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate time periods
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sixtyDaysAgo = new Date(today);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  // Attendance Trends
  const last30DaysEvents = allClubEvents.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate >= thirtyDaysAgo && eventDate <= today;
  });

  const previous30DaysEvents = allClubEvents.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate >= sixtyDaysAgo && eventDate < thirtyDaysAgo;
  });

  const calculateAttendanceRate = (events: typeof allClubEvents) => {
    const allAttendance = events.flatMap(e => e.attendance);
    const presentCount = allAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    return allAttendance.length > 0 ? Math.round((presentCount / allAttendance.length) * 100) : 0;
  };

  const currentAttendanceRate = calculateAttendanceRate(last30DaysEvents);
  const previousAttendanceRate = calculateAttendanceRate(previous30DaysEvents);
  const attendanceTrend = currentAttendanceRate - previousAttendanceRate;

  // Performance Trends
  const last30DaysMatches = last30DaysEvents.filter(e => 
    e.type === 'match' && e.matchDetails?.result
  );

  const previous30DaysMatches = previous30DaysEvents.filter(e => 
    e.type === 'match' && e.matchDetails?.result
  );

  const calculateWinRate = (matches: typeof allClubEvents) => {
    const wins = matches.filter(e => e.matchDetails?.result === 'win').length;
    return matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0;
  };

  const currentWinRate = calculateWinRate(last30DaysMatches);
  const previousWinRate = calculateWinRate(previous30DaysMatches);
  const winRateTrend = currentWinRate - previousWinRate;

  // Goals Analysis
  const currentGoalsScored = last30DaysMatches.reduce((sum, e) => sum + (e.matchDetails?.score?.team || 0), 0);
  const currentGoalsConceded = last30DaysMatches.reduce((sum, e) => sum + (e.matchDetails?.score?.opponent || 0), 0);
  const avgGoalsPerMatch = last30DaysMatches.length > 0 ? (currentGoalsScored / last30DaysMatches.length).toFixed(1) : '0';
  const avgGoalsConcededPerMatch = last30DaysMatches.length > 0 ? (currentGoalsConceded / last30DaysMatches.length).toFixed(1) : '0';

  // Top Performers
  const topScorers = allClubPlayers
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, 5)
    .map(player => {
      const team = getTeamById(player.teamId);
      return { ...player, team };
    });

  const topAssisters = allClubPlayers
    .sort((a, b) => b.stats.assists - a.stats.assists)
    .slice(0, 5)
    .map(player => {
      const team = getTeamById(player.teamId);
      return { ...player, team };
    });

  // Players with medical issues
  const playersWithMedicalHistory = allClubPlayers.filter(p => 
    p.medicalHistory && p.medicalHistory.length > 0
  );

  // Team Comparison
  const teamComparison = clubTeams.map(team => {
    const teamEvents = allClubEvents.filter(e => e.teamId === team.id);
    const teamMatches = teamEvents.filter(e => 
      e.type === 'match' && e.matchDetails?.result
    );
    const wins = teamMatches.filter(e => e.matchDetails?.result === 'win').length;
    const winRate = teamMatches.length > 0 ? Math.round((wins / teamMatches.length) * 100) : 0;
    
    const allAttendance = teamEvents.flatMap(e => e.attendance);
    const presentCount = allAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = allAttendance.length > 0 ? Math.round((presentCount / allAttendance.length) * 100) : 0;

    return {
      team,
      matchesPlayed: teamMatches.length,
      wins,
      winRate,
      attendanceRate,
    };
  }).sort((a, b) => b.winRate - a.winRate);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Analiză & Rapoarte</h1>
        <p className="text-muted-foreground">
          Statistici și tendințe pentru ultimele 30 de zile
        </p>
      </motion.div>

      {/* Key Metrics with Trends */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              {attendanceTrend !== 0 && (
                <Badge variant={attendanceTrend > 0 ? 'default' : 'destructive'} className="text-xs">
                  {attendanceTrend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(attendanceTrend)}%
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold mb-1">{currentAttendanceRate}%</div>
            <div className="text-xs text-muted-foreground">Rata de prezență</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              {winRateTrend !== 0 && (
                <Badge variant={winRateTrend > 0 ? 'default' : 'destructive'} className="text-xs">
                  {winRateTrend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(winRateTrend)}%
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold mb-1">{currentWinRate}%</div>
            <div className="text-xs text-muted-foreground">Procent victorii</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{avgGoalsPerMatch}</div>
            <div className="text-xs text-muted-foreground">Goluri/meci</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{avgGoalsConcededPerMatch}</div>
            <div className="text-xs text-muted-foreground">Goluri primite/meci</div>
          </Card>
        </motion.div>
      </div>

      {/* Team Performance Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="mb-3">Comparație echipe</h3>
        <Card className="p-4">
          <div className="space-y-3">
            {teamComparison.map((item, index) => (
              <div key={item.team.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.team.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.matchesPlayed} meciuri • {item.wins} victorii
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">{item.winRate}%</div>
                    <div className="text-xs text-muted-foreground">Victorii</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-primary">{item.attendanceRate}%</div>
                    <div className="text-xs text-muted-foreground">Prezență</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Top Scorers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="mb-3">Top golgeteri</h3>
        <Card className="p-4">
          <div className="space-y-3">
            {topScorers.map((player, index) => (
              <div key={player.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  index === 0 ? 'bg-yellow-100' : 'bg-muted'
                }`}>
                  <span className={`text-xs font-semibold ${
                    index === 0 ? 'text-yellow-700' : 'text-muted-foreground'
                  }`}>
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{player.name}</div>
                  <div className="text-xs text-muted-foreground">{player.team?.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{player.stats.goals}</div>
                  <div className="text-xs text-muted-foreground">goluri</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Top Assisters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3 className="mb-3">Top pasatori</h3>
        <Card className="p-4">
          <div className="space-y-3">
            {topAssisters.map((player, index) => (
              <div key={player.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  index === 0 ? 'bg-blue-100' : 'bg-muted'
                }`}>
                  <span className={`text-xs font-semibold ${
                    index === 0 ? 'text-blue-700' : 'text-muted-foreground'
                  }`}>
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{player.name}</div>
                  <div className="text-xs text-muted-foreground">{player.team?.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{player.stats.assists}</div>
                  <div className="text-xs text-muted-foreground">pase</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Medical Alerts */}
      {playersWithMedicalHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="mb-3">Alerte medicale</h3>
          <Card className="p-4 border-orange-200 bg-orange-50/50">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm mb-1">Jucători cu istoric medical</div>
                <div className="text-sm text-muted-foreground">
                  {playersWithMedicalHistory.length} jucători necesită atenție specială
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {playersWithMedicalHistory.slice(0, 3).map(player => {
                const latestRecord = player.medicalHistory[player.medicalHistory.length - 1];
                const team = getTeamById(player.teamId);
                return (
                  <div key={player.id} className="flex items-center justify-between text-sm p-2 bg-white rounded">
                    <div>
                      <div className="font-medium">{player.name}</div>
                      <div className="text-xs text-muted-foreground">{team?.name}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {latestRecord.type === 'injury' ? 'Accidentare' : 'Medical'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <h3 className="mb-3">Rezumat activitate (30 zile)</h3>
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Total evenimente</span>
              </div>
              <span className="font-semibold">{last30DaysEvents.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Meciuri jucate</span>
              </div>
              <span className="font-semibold">{last30DaysMatches.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Antrenamente</span>
              </div>
              <span className="font-semibold">{last30DaysEvents.length - last30DaysMatches.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Goluri marcate</span>
              </div>
              <span className="font-semibold text-green-600">{currentGoalsScored}</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

