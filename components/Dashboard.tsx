import { useAuth } from '../contexts/AuthContext';

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
  AlertCircle,
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
  events,
  clubs,
  teams,
  players,
} from '../data/mockData';
import type { Event, Player } from '../types';

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
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Prezență azi',
      value: totalExpected > 0 ? `${attendanceRate}%` : 'N/A',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Evenimente',
      value: upcomingEvents.length,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
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
      <div className="flex items-center justify-between">
        <div>
          <h1>{team?.name || 'Echipa'}</h1>
          <p className="text-muted-foreground">
            Bine ai revenit, {currentUser?.name?.split(' ')[0]}!
          </p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-xl font-semibold text-center">{stat.value}</div>
              <div className="text-xs text-muted-foreground text-center">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Today's Highlight */}
      {todayEvents.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-5 h-5 text-primary" />
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
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {todayAttendanceStats.present}
              </div>
              <div className="text-xs text-muted-foreground">Prezenți</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">
                {todayAttendanceStats.late}
              </div>
              <div className="text-xs text-muted-foreground">Întârzieri</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {todayAttendanceStats.excused}
              </div>
              <div className="text-xs text-muted-foreground">Scuzați</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-600">
                {todayAttendanceStats.pending}
              </div>
              <div className="text-xs text-muted-foreground">Așteaptă</div>
            </div>
          </div>

          <Button className="w-full" size="sm" onClick={() => onNavigate?.('attendance')}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Marchează prezența
          </Button>
        </Card>
      )}

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2>Următoarele evenimente</h2>
          <Button variant="ghost" size="sm" onClick={() => onNavigate?.('schedule')}>
            Vezi toate
          </Button>
        </div>
        <div className="space-y-3">
          {upcomingEvents.map((event) => {
            const attendance = getAttendanceCount(event);
            const isToday = formatDate(event.date) === 'Astăzi';

            return (
              <Card key={event.id} className="p-4">
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
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${(attendance.confirmed / attendance.total) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {isToday && (
                    <Button size="sm" className="flex-1" onClick={() => onNavigate?.('attendance')}>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Prezență
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className={isToday ? 'flex-1' : 'w-full'} onClick={() => onNavigate?.('schedule')}>
                    Detalii
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-3">Acțiuni rapide</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-14 flex flex-col items-center justify-center gap-1"
            onClick={() => onNavigate?.('messages')}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs">Trimite mesaj</span>
          </Button>
          <Button
            variant="outline"
            className="h-14 flex flex-col items-center justify-center gap-1"
            onClick={() => onNavigate?.('schedule')}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Adaugă eveniment</span>
          </Button>
          <Button
            variant="outline"
            className="h-14 flex flex-col items-center justify-center gap-1"
            onClick={() => onNavigate?.('players')}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Vezi jucători</span>
          </Button>
          <Button
            variant="outline"
            className="h-14 flex flex-col items-center justify-center gap-1"
            onClick={() => onNavigate?.('schedule')}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-xs">Adaugă rezultat</span>
          </Button>
        </div>
      </div>

      {/* Team Info */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="font-medium">{club?.name}</div>
            <div className="text-sm text-muted-foreground">
              Echipa {team?.name} • {club?.city}
            </div>
          </div>
        </div>
      </Card>
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
  const { currentUser } = useAuth();

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
