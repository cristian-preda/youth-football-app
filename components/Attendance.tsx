import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Check,
  X,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  ChevronDown,
  Ban,
  Calendar as CalendarIcon,
  Download,
  Bell,
  History,
} from 'lucide-react';
import {
  getTeamById,
  getPlayersByTeamId,
  getEventsByTeamId,
  events as allEvents,
} from '../data/mockData';
import type { AttendanceStatus, Player } from '../types';

export function Attendance() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPlayerHistory, setSelectedPlayerHistory] = useState<Player | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock attendance state (in real app, this would be in context/state management)
  const [attendanceRecords, setAttendanceRecords] = useState<{
    [key: string]: { status: AttendanceStatus; checkInTime?: string; excuseReason?: string };
  }>({});

  if (!currentUser) return null;

  const teamId = currentUser.teamId || 'team-1';
  const team = getTeamById(teamId);
  const teamPlayers = team ? getPlayersByTeamId(team.id) : [];
  const teamEvents = team ? getEventsByTeamId(team.id) : [];

  // Get events for selected date
  const selectedDateNormalized = new Date(selectedDate);
  selectedDateNormalized.setHours(0, 0, 0, 0);

  const dateEvents = teamEvents.filter(e => {
    const eventDate = new Date(e.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() === selectedDateNormalized.getTime();
  });

  const upcomingEvents = teamEvents
    .filter(e => {
      const eventDate = new Date(e.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() >= selectedDateNormalized.getTime();
    })
    .slice(0, 5);

  // Auto-select event based on selectedEventId or first event of the day
  const selectedEvent = selectedEventId
    ? allEvents.find(e => e.id === selectedEventId)
    : dateEvents[0] || upcomingEvents[0];

  // Export attendance report
  const exportAttendanceReport = () => {
    if (!selectedEvent) return;

    const csvContent = [
      ['Nume', 'Poziție', 'Status', 'Ora check-in', 'Motiv'],
      ...teamPlayers.map(p => {
        const status = getPlayerStatus(p.id);
        const checkInTime = getCheckInTime(p.id);
        const excuseReason = getExcuseReason(p.id);
        return [
          p.name,
          p.position,
          status,
          checkInTime || '-',
          excuseReason || '-',
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `prezenta_${selectedEvent.title}_${selectedEvent.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get attendance history for a player
  const getPlayerAttendanceHistory = (playerId: string) => {
    const history = teamEvents
      .filter(e => new Date(e.date) <= new Date())
      .map(event => {
        const record = event.attendance.find(a => a.playerId === playerId);
        return {
          event,
          status: record?.status || 'pending',
          checkInTime: record?.checkInTime,
        };
      })
      .sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());

    return history;
  };

  // Get absence notifications
  const getAbsenceNotifications = () => {
    const absences = teamPlayers
      .filter(p => {
        const status = getPlayerStatus(p.id);
        return status === 'absent' && selectedEvent;
      })
      .map(p => ({
        player: p,
        event: selectedEvent,
      }));

    return absences;
  };

  if (!selectedEvent) {
    return (
      <div className="space-y-6 pb-20">
        <h1>Prezență</h1>
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Nu există evenimente disponibile pentru prezență</p>
        </Card>
      </div>
    );
  }

  // Merge real attendance with mock local state
  const getPlayerStatus = (playerId: string): AttendanceStatus => {
    const record = selectedEvent.attendance.find(a => a.playerId === playerId);
    return attendanceRecords[playerId]?.status || record?.status || 'pending';
  };

  const getCheckInTime = (playerId: string): string | undefined => {
    const record = selectedEvent.attendance.find(a => a.playerId === playerId);
    return attendanceRecords[playerId]?.checkInTime || record?.checkInTime;
  };

  const getExcuseReason = (playerId: string): string | undefined => {
    const record = selectedEvent.attendance.find(a => a.playerId === playerId);
    return attendanceRecords[playerId]?.excuseReason || record?.excuseReason;
  };

  // Mark attendance
  const markAttendance = (playerId: string, status: AttendanceStatus) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setAttendanceRecords(prev => ({
      ...prev,
      [playerId]: {
        status,
        checkInTime: status === 'present' || status === 'late' ? timeStr : undefined,
      },
    }));
  };

  // Filter players
  const filteredPlayers = teamPlayers
    .filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || getPlayerStatus(player.id) === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Stats
  const stats = {
    present: teamPlayers.filter(p => getPlayerStatus(p.id) === 'present').length,
    late: teamPlayers.filter(p => getPlayerStatus(p.id) === 'late').length,
    absent: teamPlayers.filter(p => getPlayerStatus(p.id) === 'absent').length,
    excused: teamPlayers.filter(p => getPlayerStatus(p.id) === 'excused').length,
    pending: teamPlayers.filter(p => getPlayerStatus(p.id) === 'pending').length,
  };

  const totalConfirmed = stats.present + stats.late;
  const attendanceRate = teamPlayers.length > 0 ? Math.round((totalConfirmed / teamPlayers.length) * 100) : 0;

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'excused':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'late':
        return <Clock className="w-4 h-4" />;
      case 'absent':
        return <XCircle className="w-4 h-4" />;
      case 'excused':
        return <Ban className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'Prezent';
      case 'late':
        return 'Întârziere';
      case 'absent':
        return 'Absent';
      case 'excused':
        return 'Scuzat';
      default:
        return 'În așteptare';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const markAllPresent = () => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newRecords = { ...attendanceRecords };
    teamPlayers.forEach(player => {
      if (getPlayerStatus(player.id) === 'pending') {
        newRecords[player.id] = { status: 'present', checkInTime: timeStr };
      }
    });
    setAttendanceRecords(newRecords);
  };

  // Player History Modal
  if (selectedPlayerHistory) {
    const history = getPlayerAttendanceHistory(selectedPlayerHistory.id);
    const presentCount = history.filter(h => h.status === 'present' || h.status === 'late').length;
    const attendancePercentage = history.length > 0 ? Math.round((presentCount / history.length) * 100) : 0;

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setSelectedPlayerHistory(null)}>
              <X className="w-5 h-5" />
            </Button>
            <h2>Istoric Prezență</h2>
            <div className="w-10" />
          </div>

          <Card className="p-4">
            <div className="text-center mb-4">
              <h3>{selectedPlayerHistory.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedPlayerHistory.position}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{attendancePercentage}%</div>
                <div className="text-xs text-muted-foreground">Rata prezență</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{presentCount}/{history.length}</div>
                <div className="text-xs text-muted-foreground">Prezent/Total</div>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            {history.map((record, idx) => (
              <Card key={idx} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{record.event.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(record.event.date).toLocaleDateString('ro-RO')} • {record.event.startTime}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.checkInTime && (
                      <span className="text-xs text-muted-foreground">{record.checkInTime}</span>
                    )}
                    <Badge variant="outline" className={getStatusColor(record.status)}>
                      {getStatusLabel(record.status)}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const absenceNotifications = getAbsenceNotifications();

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1>Prezență</h1>
          <p className="text-muted-foreground">Marchează prezența jucătorilor</p>
        </div>
        <div className="flex gap-2">
          {absenceNotifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {absenceNotifications.length}
              </span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={exportAttendanceReport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Absence Notifications */}
      <AnimatePresence>
        {showNotifications && absenceNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="text-red-800">Absențe ({absenceNotifications.length})</h3>
              </div>
              <div className="space-y-2">
                {absenceNotifications.map((notif, idx) => (
                  <div key={idx} className="text-sm text-red-800">
                    <strong>{notif.player.name}</strong> - {notif.player.position}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Date Picker */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setShowDatePicker(!showDatePicker)}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          {selectedDate.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Button>
      </div>

      <AnimatePresence>
        {showDatePicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {[-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map(offset => {
                  const date = new Date();
                  date.setDate(date.getDate() + offset);
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  return (
                    <Button
                      key={offset}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedEventId(null);
                        setShowDatePicker(false);
                      }}
                    >
                      <div className="text-center">
                        <div className="text-xs">{date.toLocaleDateString('ro-RO', { weekday: 'short' })}</div>
                        <div className="font-bold">{date.getDate()}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Selection */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Eveniment selectat</Label>
          {dateEvents.length > 1 && (
            <Button variant="ghost" size="sm" className="h-auto p-0">
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={selectedEvent.type === 'match' ? 'default' : 'secondary'}>
            {selectedEvent.type === 'match' ? 'Meci' : 'Antrenament'}
          </Badge>
          <span className="font-medium">{selectedEvent.title}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {selectedEvent.date} • {selectedEvent.startTime}
        </p>
      </Card>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3>Rezumat prezență</h3>
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-4 h-4 text-green-600" />
              </motion.div>
              <motion.span
                className="font-semibold text-green-600"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
              >
                {attendanceRate}%
              </motion.span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[
              { value: stats.present, label: 'Prezenți', color: 'text-green-600' },
              { value: stats.late, label: 'Întârzieri', color: 'text-yellow-600' },
              { value: stats.absent, label: 'Absenți', color: 'text-red-600' },
              { value: stats.excused, label: 'Scuzați', color: 'text-blue-600' },
              { value: stats.pending, label: 'Așteaptă', color: 'text-gray-600' }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + idx * 0.05 }}
              >
                <motion.div
                  className={`text-xl font-bold ${stat.color}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.4 + idx * 0.05 }}
                  key={stat.value}
                >
                  {stat.value}
                </motion.div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Caută jucător..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            Toți ({teamPlayers.length})
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pending')}
          >
            În așteptare ({stats.pending})
          </Button>
          <Button
            variant={filterStatus === 'present' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('present')}
          >
            Prezenți ({stats.present})
          </Button>
          <Button
            variant={filterStatus === 'absent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('absent')}
          >
            Absenți ({stats.absent})
          </Button>
        </div>
      </div>

      {/* Quick Action */}
      {stats.pending > 0 && currentUser.role === 'coach' && (
        <Button onClick={markAllPresent} className="w-full" variant="outline">
          <Check className="w-4 h-4 mr-2" />
          Marchează toți ca prezenți ({stats.pending})
        </Button>
      )}

      {/* Players List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredPlayers.map((player, index) => {
            const status = getPlayerStatus(player.id);
            const checkInTime = getCheckInTime(player.id);
            const excuseReasonText = getExcuseReason(player.id);

            return (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(player.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="font-medium">{player.name}</div>
                  <div className="text-sm text-muted-foreground">{player.position}</div>
                  {checkInTime && (
                    <div className="text-xs text-muted-foreground">Ora sosirii: {checkInTime}</div>
                  )}
                  {excuseReasonText && (
                    <div className="text-xs text-blue-600 mt-1">Motiv: {excuseReasonText}</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedPlayerHistory(player)}
                    title="Vezi istoric"
                  >
                    <History className="w-4 h-4" />
                  </Button>
                  <Badge variant="outline" className={`${getStatusColor(status)} flex items-center gap-1`}>
                    {getStatusIcon(status)}
                    <span className="hidden sm:inline">{getStatusLabel(status)}</span>
                  </Badge>
                </div>
              </div>

              {/* Status Buttons - Only for coach or if pending */}
              {currentUser.role === 'coach' && (
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { status: 'present', icon: Check, color: 'bg-green-600 hover:bg-green-700' },
                    { status: 'late', icon: Clock, color: 'bg-yellow-600 hover:bg-yellow-700' },
                    { status: 'absent', icon: X, color: 'bg-red-600 hover:bg-red-700' },
                    { status: 'excused', icon: Ban, color: 'bg-blue-600 hover:bg-blue-700' }
                  ].map((btn) => {
                    const Icon = btn.icon;
                    const isActive = status === btn.status;
                    return (
                      <motion.div
                        key={btn.status}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="sm"
                          variant={isActive ? 'default' : 'outline'}
                          onClick={() => markAttendance(player.id, btn.status as AttendanceStatus)}
                          className={`w-full ${isActive ? btn.color : ''} transition-all`}
                        >
                          <motion.div
                            animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            <Icon className="w-4 h-4" />
                          </motion.div>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </Card>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>

      {filteredPlayers.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            {searchTerm ? 'Niciun jucător găsit' : 'Nu există jucători'}
          </p>
        </Card>
      )}
    </div>
  );
}
