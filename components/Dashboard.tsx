import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface DashboardProps {
  onNavigate?: (tab: string, playerId?: string) => void;
}
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Calendar,
  Clock,
  Users,
  User,
  TrendingUp,
  Bell,
  MapPin,
  CheckCircle2,
  MessageSquare,
  Trophy,
  Target,
  Activity
} from 'lucide-react';
import {
  getTeamById,
  getPlayersByTeamId,
  getEventsByTeamId,
  getChildrenByParentId,
  getUserById,
  clubs,
  players,
} from '../data/mockData';

export function Dashboard({ onNavigate }: DashboardProps) {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  // Route to role-specific dashboard
  switch (currentUser.role) {
    case 'coach':
      return <CoachDashboard onNavigate={onNavigate} />;
    case 'parent':
      return <ParentDashboard />;
    case 'player':
      return <PlayerDashboard />;
    case 'director':
      return <DirectorDashboard />;
    default:
      return <CoachDashboard onNavigate={onNavigate} />;
  }
}

// ========== COACH DASHBOARD ==========
function CoachDashboard({ onNavigate }: DashboardProps) {
  const { currentUser } = useAuth();
  const team = currentUser?.teamId ? getTeamById(currentUser.teamId) : null;
  const teamPlayers = team ? getPlayersByTeamId(team.id) : [];
  const teamEvents = team ? getEventsByTeamId(team.id) : [];
  const club = currentUser ? clubs.find(c => c.id === currentUser.clubId) : null;

  // Get today's and upcoming events
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEvents = teamEvents.filter(e => {
    const eventDate = new Date(e.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() === today.getTime();
  });

  const upcomingEvents = teamEvents
    .filter(e => {
      const eventDate = new Date(e.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() >= today.getTime();
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate overall attendance rate
  const allAttendanceRecords = teamEvents.flatMap(e => e.attendance);
  const presentCount = allAttendanceRecords.filter(a => a.status === 'present' || a.status === 'late').length;
  const overallAttendanceRate = allAttendanceRecords.length > 0
    ? Math.round((presentCount / allAttendanceRecords.length) * 100)
    : 0;

  // Calculate team performance from past matches
  const pastMatches = teamEvents.filter(e => 
    e.type === 'match' && 
    new Date(e.date) < new Date() && 
    e.matchDetails?.result
  );
  const wins = pastMatches.filter(e => e.matchDetails?.result === 'win').length;
  const draws = pastMatches.filter(e => e.matchDetails?.result === 'draw').length;
  const losses = pastMatches.filter(e => e.matchDetails?.result === 'loss').length;
  
  const totalGoalsScored = pastMatches.reduce((sum, e) => sum + (e.matchDetails?.score?.team || 0), 0);
  const totalGoalsConceded = pastMatches.reduce((sum, e) => sum + (e.matchDetails?.score?.opponent || 0), 0);

  // Calculate today's attendance stats
  const todayAttendanceStats = todayEvents.reduce((acc, event) => {
    const present = event.attendance.filter(a => a.status === 'present').length;
    const late = event.attendance.filter(a => a.status === 'late').length;
    const absent = event.attendance.filter(a => a.status === 'absent').length;
    const excused = event.attendance.filter(a => a.status === 'excused').length;
    const pending = event.attendance.filter(a => a.status === 'pending').length;

    return {
      present: acc.present + present,
      late: acc.late + late,
      absent: acc.absent + absent,
      excused: acc.excused + excused,
      pending: acc.pending + pending,
    };
  }, { present: 0, late: 0, absent: 0, excused: 0, pending: 0 });

  const stats = [
    {
      label: 'Jucători',
      value: teamPlayers.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Prezență',
      value: `${overallAttendanceRate}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Evenimente',
      value: upcomingEvents.length,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'Astăzi';
    if (date.getTime() === tomorrow.getTime()) return 'Mâine';

    const days = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
    const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {team?.name || 'Echipa'}
          </motion.h1>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Bine ai revenit, {currentUser?.name?.split(' ')[0]}!
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <motion.span
              className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </Button>
        </motion.div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1 + index * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="p-3 transition-shadow hover:shadow-lg">
                <motion.div
                  className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mx-auto mb-2`}
                  whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
                >
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </motion.div>
                <div className="text-xl font-semibold text-center">{stat.value}</div>
                <div className="text-xs text-muted-foreground text-center">{stat.label}</div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Today's Highlight */}
      {todayEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 overflow-hidden relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Activity className="w-5 h-5 text-primary" />
                    </motion.div>
                    <h3 className="text-primary">Eveniment astăzi</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {todayEvents[0].title} • {todayEvents[0].startTime}
                  </p>
                </div>
                <Badge variant="default" className="bg-primary">
                  {formatDate(todayEvents[0].date)}
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { value: todayAttendanceStats.present, label: 'Prezenți', color: 'text-green-600' },
                  { value: todayAttendanceStats.late, label: 'Întârzieri', color: 'text-yellow-600' },
                  { value: todayAttendanceStats.excused, label: 'Scuzați', color: 'text-blue-600' },
                  { value: todayAttendanceStats.pending, label: 'Așteaptă', color: 'text-gray-600' }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
                  >
                    <motion.div
                      className={`text-lg font-semibold ${stat.color}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.6 + idx * 0.1 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="w-full" size="sm" onClick={() => onNavigate?.('attendance')}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Marchează prezența
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Team Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3 className="mb-3">Performanță echipă</h3>
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{wins}</div>
              <div className="text-xs text-muted-foreground">Victorii</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{draws}</div>
              <div className="text-xs text-muted-foreground">Egaluri</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{losses}</div>
              <div className="text-xs text-muted-foreground">Înfrângeri</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-semibold">{totalGoalsScored}</div>
              <div className="text-xs text-muted-foreground">Goluri marcate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{totalGoalsConceded}</div>
              <div className="text-xs text-muted-foreground">Goluri primite</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Player Roster */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3>Jucători</h3>
          <Button variant="ghost" size="sm" onClick={() => onNavigate?.('players')}>
            Vezi toți
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {teamPlayers.slice(0, 6).map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate?.('players', player.id)}
            >
              <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{player.name}</div>
                    <div className="text-xs text-muted-foreground">#{player.jerseyNumber}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{player.position}</span>
                  <span className="font-semibold text-primary">
                    {player.position === 'Portar' ? `${player.stats.cleanSheets || 0} CS` : `${player.stats.goals}G`}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h3 className="mb-3">Acțiuni rapide</h3>
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="default"
              className="h-16 w-full flex flex-col items-center justify-center gap-1"
              onClick={() => onNavigate?.('add-event')}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Adaugă eveniment</span>
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="default"
              className="h-16 w-full flex flex-col items-center justify-center gap-1"
              onClick={() => onNavigate?.('messages')}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm">Trimite mesaj</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Team/Club Info - Clickable */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onNavigate?.('club')}
        className="cursor-pointer"
      >
        <Card className="p-4 bg-muted/50 transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"
              whileHover={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Trophy className="w-6 h-6 text-primary" />
            </motion.div>
            <div className="flex-1">
              <div className="font-medium">{club?.name}</div>
              <div className="text-sm text-muted-foreground">
                Echipa {team?.name} • {club?.city}
              </div>
            </div>
            <div className="text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// ========== PARENT DASHBOARD ==========
function ParentDashboard() {
  const { currentUser } = useAuth();
  const children = currentUser ? getChildrenByParentId(currentUser.id) : [];
  const child = children[0]; // For MVP, focus on first child

  if (!child) {
    return (
      <div className="space-y-6 pb-20">
        <div>
          <h1>Bine ai venit!</h1>
          <p className="text-muted-foreground">Nu există informații despre copil</p>
        </div>
      </div>
    );
  }

  const team = getTeamById(child.teamId);
  const coach = team ? getUserById(team.coachId) : null;
  const teamEvents = team ? getEventsByTeamId(team.id) : [];

  // Get upcoming events
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = teamEvents
    .filter(e => {
      const eventDate = new Date(e.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() >= today.getTime();
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const nextEvent = upcomingEvents[0];

  // Get recent match results
  const pastMatches = teamEvents
    .filter(e => e.type === 'match' && new Date(e.date) < new Date() && e.matchDetails?.score)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recentMatch = pastMatches[0];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'Astăzi';
    if (date.getTime() === tomorrow.getTime()) return 'Mâine';

    const days = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
    const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Bine ai venit!</h1>
        <p className="text-muted-foreground">
          Urmărește progresul lui {child.name}
        </p>
      </motion.div>

      {/* Child Quick Info */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="mb-1">{child.name}</h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Echipa {team?.name} • {child.position}</div>
                <div>Antrenor: {coach?.name}</div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-xl font-semibold text-center">{child.stats.goals}</div>
            <div className="text-xs text-muted-foreground text-center">Goluri</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card className="p-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-xl font-semibold text-center">{child.stats.assists}</div>
            <div className="text-xs text-muted-foreground text-center">Pase</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-xl font-semibold text-center">{child.stats.matchesPlayed}</div>
            <div className="text-xs text-muted-foreground text-center">Meciuri</div>
          </Card>
        </motion.div>
      </div>

      {/* Next Event */}
      {nextEvent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="mb-3">Următorul eveniment</h3>
          <Card className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={nextEvent.type === 'match' ? 'default' : 'secondary'}>
                    {nextEvent.type === 'match' ? 'Meci' : 'Antrenament'}
                  </Badge>
                  {nextEvent.matchDetails?.opponent && (
                    <span className="text-sm font-medium">vs {nextEvent.matchDetails.opponent}</span>
                  )}
                </div>
                <div className="text-sm font-medium mb-2">{nextEvent.title}</div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(nextEvent.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {nextEvent.startTime}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{nextEvent.location}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Recent Match Result */}
      {recentMatch && recentMatch.matchDetails?.score && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="mb-3">Ultimul meci</h3>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">
                {formatDate(recentMatch.date)}
              </div>
              <Badge
                variant={
                  recentMatch.matchDetails.result === 'win'
                    ? 'default'
                    : recentMatch.matchDetails.result === 'draw'
                    ? 'secondary'
                    : 'destructive'
                }
              >
                {recentMatch.matchDetails.result === 'win'
                  ? 'Victorie'
                  : recentMatch.matchDetails.result === 'draw'
                  ? 'Egalitate'
                  : 'Înfrângere'}
              </Badge>
            </div>
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="text-center flex-1">
                <div className="text-sm text-muted-foreground mb-1">
                  {team?.name}
                </div>
                <div className="text-3xl font-bold">
                  {recentMatch.matchDetails.score.team}
                </div>
              </div>
              <div className="text-2xl font-bold text-muted-foreground">-</div>
              <div className="text-center flex-1">
                <div className="text-sm text-muted-foreground mb-1">
                  {recentMatch.matchDetails.opponent}
                </div>
                <div className="text-3xl font-bold">
                  {recentMatch.matchDetails.score.opponent}
                </div>
              </div>
            </div>
            {recentMatch.matchDetails.goalScorers && recentMatch.matchDetails.goalScorers.length > 0 && (
              <div className="border-t border-border pt-3 mt-3">
                <div className="text-xs font-medium text-muted-foreground mb-2">Goluri marcate:</div>
                {recentMatch.matchDetails.goalScorers.map((scorer, idx) => {
                  const scorerPlayer = players.find(p => p.id === scorer.playerId);
                  return (
                    <div key={idx} className="text-sm flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-yellow-600" />
                      <span>{scorerPlayer?.name}</span>
                      <span className="text-muted-foreground">({scorer.minute}')</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// ========== PLAYER DASHBOARD (Placeholder) ==========
function PlayerDashboard() {
  const { currentUser } = useAuth();
  const player = players.find(p => p.id === currentUser?.id);

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1>Salut, {player?.name}!</h1>
        <p className="text-muted-foreground">Vezi-ți statisticile și progresul</p>
      </div>

      <Card className="p-6 text-center">
        <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">
          Dashboard pentru jucători în dezvoltare...
        </p>
      </Card>
    </div>
  );
}

// ========== DIRECTOR DASHBOARD (Placeholder) ==========
function DirectorDashboard() {

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1>Dashboard Director</h1>
        <p className="text-muted-foreground">
          Privire de ansamblu asupra clubului
        </p>
      </div>

      <Card className="p-6 text-center">
        <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">
          Dashboard pentru director în dezvoltare...
        </p>
      </Card>
    </div>
  );
}
