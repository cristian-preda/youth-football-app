import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Calendar,
  Clock,
  Users,
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
  clubs,
  players,
} from '../data/mockData';
import type { Event } from '../types';

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
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

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
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Calculate attendance stats for today's events
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

  const totalExpected = teamPlayers.length * todayEvents.length;
  const attendanceRate = totalExpected > 0
    ? Math.round(((todayAttendanceStats.present + todayAttendanceStats.late) / totalExpected) * 100)
    : 0;

  const stats = [
    {
      label: 'Jucători',
      value: teamPlayers.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: 'players'
    },
    {
      label: 'Prezență azi',
      value: totalExpected > 0 ? `${attendanceRate}%` : 'N/A',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: 'attendance'
    },
    {
      label: 'Evenimente',
      value: upcomingEvents.length,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: 'schedule'
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

  const getAttendanceCount = (event: Event) => {
    const confirmed = event.attendance.filter(a =>
      a.status === 'present' || a.status === 'late' || a.status === 'excused'
    ).length;
    const total = teamPlayers.length;
    return { confirmed, total };
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
              onClick={() => onNavigate?.(stat.action)}
              className="cursor-pointer"
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

      {/* Upcoming Events */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2>Următoarele evenimente</h2>
          <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="sm" onClick={() => onNavigate?.('schedule')}>
              Vezi toate
            </Button>
          </motion.div>
        </div>
        <div className="space-y-3">
          {upcomingEvents.map((event, eventIndex) => {
            const attendance = getAttendanceCount(event);
            const isToday = formatDate(event.date) === 'Astăzi';

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.7 + eventIndex * 0.1,
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
              >
                <Card className="p-4 transition-all hover:shadow-md">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={event.type === 'match' ? 'default' : 'secondary'}
                        className={event.type === 'match' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                      >
                        {event.type === 'match' ? 'Meci' : 'Antrenament'}
                      </Badge>
                      {event.matchDetails?.opponent && (
                        <span className="text-sm font-medium truncate">
                          {event.matchDetails.opponent}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium mb-1">{event.title}</div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {event.startTime}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <div className="text-right ml-2">
                    <div className="text-sm font-medium">
                      {attendance.confirmed}/{attendance.total}
                    </div>
                    <div className="text-xs text-muted-foreground">confirmați</div>
                  </div>
                </div>

                {/* Attendance Progress */}
                <div className="mb-3">
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="bg-primary h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(attendance.confirmed / attendance.total) * 100}%` }}
                      transition={{ duration: 1, delay: 0.8 + eventIndex * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {isToday && (
                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button size="sm" className="w-full" onClick={() => onNavigate?.('attendance')}>
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Prezență
                      </Button>
                    </motion.div>
                  )}
                  <motion.div className={isToday ? 'flex-1' : 'w-full'} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => onNavigate?.('schedule')}>
                      Detalii
                    </Button>
                  </motion.div>
                </div>
              </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <h3 className="mb-3">Acțiuni rapide</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: MessageSquare, label: 'Trimite mesaj', action: 'messages' },
            { icon: Calendar, label: 'Adaugă eveniment', action: 'schedule' },
            { icon: Users, label: 'Vezi jucători', action: 'players' },
            { icon: Trophy, label: 'Adaugă rezultat', action: 'schedule' }
          ].map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: 1.1 + idx * 0.05,
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="h-14 w-full flex flex-col items-center justify-center gap-1 transition-all hover:shadow-md hover:border-primary/50"
                  onClick={() => onNavigate?.(action.action)}
                >
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Team Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        whileHover={{ scale: 1.02 }}
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
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// ========== PARENT DASHBOARD (Placeholder) ==========
function ParentDashboard() {
  const { currentUser } = useAuth();
  const children = currentUser ? getChildrenByParentId(currentUser.id) : [];
  const child = children[0]; // For now, focus on first child

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1>Bine ai venit!</h1>
        <p className="text-muted-foreground">
          Urmărește progresul lui {child?.name}
        </p>
      </div>

      <Card className="p-6 text-center">
        <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">
          Dashboard pentru părinți în dezvoltare...
        </p>
      </Card>
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
