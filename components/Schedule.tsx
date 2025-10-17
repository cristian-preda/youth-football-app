import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar, Clock, MapPin, Plus, CheckCircle2, AlertCircle, List, CalendarDays, Bell, X, Save, Edit, Share2, Trash2, MapPinIcon, Trophy, Target } from 'lucide-react';
import { getTeamById, getEventsByTeamId, getPlayersByTeamId, getPlayerById, getChildrenByParentId } from '../data/mockData';
import { MatchResultForm, type MatchResultData } from './MatchResultForm';
import { AttendanceConfirmation } from './AttendanceConfirmation';
import type { Event } from '../types';

type ViewMode = 'list' | 'calendar';
type FilterMode = 'all' | 'today' | 'upcoming' | 'past';

export function Schedule() {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showMatchResultForm, setShowMatchResultForm] = useState(false);

  if (!currentUser) return null;

  // Get user's team events
  const teamId = currentUser.teamId || (currentUser.childrenIds && currentUser.childrenIds.length > 0 ? 'team-1' : null);
  const events = teamId ? getEventsByTeamId(teamId) : [];
  const team = teamId ? getTeamById(teamId) : null;
  const teamPlayers = team ? getPlayersByTeamId(team.id) : [];

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date + 'T' + a.startTime);
    const dateB = new Date(b.date + 'T' + b.startTime);
    return dateA.getTime() - dateB.getTime();
  });

  // Filter events based on filterMode
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredEvents = sortedEvents.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    switch (filterMode) {
      case 'today':
        return eventDate.getTime() === today.getTime();
      case 'upcoming':
        return eventDate.getTime() >= today.getTime();
      case 'past':
        return eventDate.getTime() < today.getTime();
      default:
        return true;
    }
  });

  // Get upcoming events for notifications (next 7 days)
  const upcomingNotifications = sortedEvents.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    const next7Days = new Date(today);
    next7Days.setDate(next7Days.getDate() + 7);
    return eventDate.getTime() >= today.getTime() && eventDate.getTime() <= next7Days.getTime();
  });

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'match':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'training':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getAttendanceCount = (event: Event) => {
    const confirmed = event.attendance.filter(a =>
      a.status === 'present' || a.status === 'late' || a.status === 'excused'
    ).length;
    const total = teamPlayers.length;
    return { confirmed, total };
  };

  const isPastEvent = (event: Event) => {
    const eventDate = new Date(event.date + 'T' + event.startTime);
    return eventDate < new Date();
  };

  const groupEventsByMonth = (events: Event[]) => {
    const grouped: { [key: string]: Event[] } = {};

    events.forEach(event => {
      const monthYear = formatFullDate(event.date).split(' ').slice(1).join(' '); // "Ian 2025"
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(event);
    });

    return grouped;
  };

  const groupedEvents = groupEventsByMonth(filteredEvents);

  // Handle match result save
  const handleMatchResultSave = (matchData: MatchResultData) => {
    // TODO: In real app, this would save to backend/state
    console.log('Match result saved:', matchData);
    // Close the form
    setShowMatchResultForm(false);
    setShowEventDetail(false);
    setSelectedEvent(null);
    // Show success message (you could add a toast notification here)
    alert('Rezultatul a fost salvat cu succes!');
  };

  // Handle parent attendance confirmation
  const handleAttendanceConfirmation = (status: 'confirmed' | 'declined' | 'late', notes?: string) => {
    // TODO: In real app, this would save to backend/state
    console.log('Attendance confirmed:', status, notes);
    alert(`Confirmarea a fost trimisă! Status: ${status === 'confirmed' ? 'Va participa' : status === 'declined' ? 'Nu va participa' : 'Va întârzia'}`);
  };

  // Match Result Form
  if (showMatchResultForm && selectedEvent) {
    return (
      <MatchResultForm
        event={selectedEvent}
        onClose={() => setShowMatchResultForm(false)}
        onSave={handleMatchResultSave}
      />
    );
  }

  // Event Detail Modal
  if (showEventDetail && selectedEvent) {
    const isPast = isPastEvent(selectedEvent);
    const isToday = formatDate(selectedEvent.date) === 'Astăzi';
    const isMatch = selectedEvent.type === 'match';
    const attendance = getAttendanceCount(selectedEvent);

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => { setShowEventDetail(false); setSelectedEvent(null); }}>
              <X className="w-5 h-5" />
            </Button>
            <h2>{isPast && isMatch ? 'Rezultat Meci' : 'Detalii Eveniment'}</h2>
            {currentUser.role === 'coach' && (
              <Button variant="ghost" size="icon">
                <Edit className="w-5 h-5" />
              </Button>
            )}
            {currentUser.role !== 'coach' && <div className="w-10" />}
          </div>

          {/* Event Info Card */}
          <Card className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={getEventTypeColor(selectedEvent.type)}>
                    {selectedEvent.type === 'match' ? 'Meci' : 'Antrenament'}
                  </Badge>
                  {isToday && (
                    <Badge variant="default" className="bg-primary">Astăzi</Badge>
                  )}
                  {isPast && <Badge variant="outline" className="bg-muted">Trecut</Badge>}
                </div>
                <h2 className="mb-2">{selectedEvent.title}</h2>
                {selectedEvent.matchDetails?.opponent && (
                  <p className="text-muted-foreground mb-2">vs {selectedEvent.matchDetails.opponent}</p>
                )}
              </div>
            </div>

            {/* Match Score - For Past Matches */}
            {isPast && isMatch && selectedEvent.matchDetails?.score && (
              <Card className="p-6 mb-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="text-center mb-4">
                  <div className="text-sm text-muted-foreground mb-2">Scor Final</div>
                  <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">{selectedEvent.matchDetails.score.team}</div>
                      <div className="text-sm text-muted-foreground mt-1">{team?.name}</div>
                    </div>
                    <div className="text-2xl text-muted-foreground">-</div>
                    <div className="text-center">
                      <div className="text-4xl font-bold">{selectedEvent.matchDetails.score.opponent}</div>
                      <div className="text-sm text-muted-foreground mt-1">{selectedEvent.matchDetails.opponent}</div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`mt-4 ${
                      selectedEvent.matchDetails.result === 'win' ? 'bg-green-100 text-green-800 border-green-200' :
                      selectedEvent.matchDetails.result === 'loss' ? 'bg-red-100 text-red-800 border-red-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    {selectedEvent.matchDetails.result === 'win' ? 'Victorie' :
                     selectedEvent.matchDetails.result === 'loss' ? 'Înfrângere' : 'Egalitate'}
                  </Badge>
                </div>

                {/* Goal Scorers */}
                {selectedEvent.matchDetails.goalScorers && selectedEvent.matchDetails.goalScorers.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-center mb-3">Marcatori</div>
                    {selectedEvent.matchDetails.goalScorers.map((goal, idx) => {
                      const player = getPlayerById(goal.playerId);
                      const assister = goal.assistedBy ? getPlayerById(goal.assistedBy) : null;
                      return (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-background rounded-lg">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <Target className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{player?.name}</div>
                            {assister && (
                              <div className="text-xs text-muted-foreground">Pasă: {assister.name}</div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{goal.minute}'</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            )}

            {/* Date & Time */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDate(selectedEvent.date)} - {new Date(selectedEvent.date).toLocaleDateString('ro-RO', { weekday: 'long' })}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{selectedEvent.startTime} ({selectedEvent.duration} minute)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <div>{selectedEvent.location}</div>
                  {selectedEvent.address && (
                    <div className="text-xs text-muted-foreground">{selectedEvent.address}</div>
                  )}
                </div>
              </div>
            </div>

            {selectedEvent.notes && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">{selectedEvent.notes}</div>
                </div>
              </div>
            )}
          </Card>

          {/* Parent Attendance Confirmation (for future matches) */}
          {currentUser.role === 'parent' && !isPast && isMatch && (
            <div className="mb-4">
              {(() => {
                const children = getChildrenByParentId(currentUser.id);
                const child = children[0]; // For now, first child
                return child ? (
                  <AttendanceConfirmation
                    event={selectedEvent}
                    playerName={child.name}
                    playerId={child.id}
                    parentId={currentUser.id}
                    currentStatus="pending"
                    onConfirm={handleAttendanceConfirmation}
                  />
                ) : null;
              })()}
            </div>
          )}

          {/* Attendance Stats */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3>Prezență</h3>
              <div className="text-sm text-muted-foreground">
                {attendance.confirmed}/{attendance.total} confirmați
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(attendance.confirmed / attendance.total) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div>
                <div className="font-medium text-green-600">
                  {selectedEvent.attendance.filter(a => a.status === 'present').length}
                </div>
                <div className="text-xs text-muted-foreground">Prezenți</div>
              </div>
              <div>
                <div className="font-medium text-yellow-600">
                  {selectedEvent.attendance.filter(a => a.status === 'late').length}
                </div>
                <div className="text-xs text-muted-foreground">Întârzieri</div>
              </div>
              <div>
                <div className="font-medium text-red-600">
                  {selectedEvent.attendance.filter(a => a.status === 'absent').length}
                </div>
                <div className="text-xs text-muted-foreground">Absenți</div>
              </div>
              <div>
                <div className="font-medium text-blue-600">
                  {selectedEvent.attendance.filter(a => a.status === 'excused').length}
                </div>
                <div className="text-xs text-muted-foreground">Scuzați</div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            {/* Coach: Add/Edit Result for past matches */}
            {currentUser.role === 'coach' && isPast && isMatch && (
              <Button
                className="w-full bg-primary"
                size="lg"
                onClick={() => setShowMatchResultForm(true)}
              >
                <Trophy className="w-4 h-4 mr-2" />
                {selectedEvent.matchDetails?.score ? 'Editează rezultat' : 'Adaugă rezultat'}
              </Button>
            )}

            {/* Coach: Mark attendance for today's events */}
            {currentUser.role === 'coach' && !isPast && (
              <Button className="w-full" size="lg">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Marchează prezența
              </Button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="lg">
                <Share2 className="w-4 h-4 mr-2" />
                Distribuie
              </Button>
              <Button variant="outline" size="lg">
                <MapPinIcon className="w-4 h-4 mr-2" />
                Direcții
              </Button>
            </div>

            {/* Coach: Cancel event */}
            {currentUser.role === 'coach' && !isPast && (
              <Button variant="outline" size="lg" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Anulează eveniment
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Event Creation Form
  if (showCreateForm) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setShowCreateForm(false)}>
              <X className="w-5 h-5" />
            </Button>
            <h2>Eveniment nou</h2>
            <Button variant="ghost" size="icon">
              <Save className="w-5 h-5" />
            </Button>
          </div>

          <Card className="p-4 space-y-4">
            <div>
              <Label htmlFor="eventType">Tip eveniment</Label>
              <select id="eventType" className="w-full p-2 border rounded-md mt-1">
                <option value="training">Antrenament</option>
                <option value="match">Meci</option>
              </select>
            </div>

            <div>
              <Label htmlFor="eventTitle">Titlu</Label>
              <Input id="eventTitle" placeholder="Ex: Antrenament săptămânal" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="eventDate">Data</Label>
              <Input id="eventDate" type="date" className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="eventTime">Ora</Label>
                <Input id="eventTime" type="time" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="eventDuration">Durata (min)</Label>
                <Input id="eventDuration" type="number" placeholder="90" className="mt-1" />
              </div>
            </div>

            <div>
              <Label htmlFor="eventLocation">Locație</Label>
              <Input id="eventLocation" placeholder="Stadium" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="eventNotes">Note</Label>
              <textarea
                id="eventNotes"
                className="w-full p-2 border rounded-md mt-1"
                rows={3}
                placeholder="Note adiționale..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="recurring" />
              <Label htmlFor="recurring">Eveniment recurent (săptămânal)</Label>
            </div>

            <Button className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Salvează eveniment
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Program</h1>
          <p className="text-muted-foreground">
            Echipa {team?.name || 'ta'}
          </p>
        </div>
        <div className="flex gap-2">
          {upcomingNotifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                {upcomingNotifications.length}
              </span>
            </Button>
          )}
          {currentUser.role === 'coach' && (
            <Button size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adaugă
            </Button>
          )}
        </div>
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && upcomingNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-blue-800">Evenimente următoare ({upcomingNotifications.length})</h3>
              </div>
              <div className="space-y-2">
                {upcomingNotifications.map((event) => (
                  <div key={event.id} className="text-sm text-blue-800">
                    <strong>{event.title}</strong> - {formatDate(event.date)} la {event.startTime}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filterMode === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterMode('all')}
        >
          Toate ({sortedEvents.length})
        </Button>
        <Button
          variant={filterMode === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterMode('today')}
        >
          Astăzi
        </Button>
        <Button
          variant={filterMode === 'upcoming' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterMode('upcoming')}
        >
          Viitoare
        </Button>
        <Button
          variant={filterMode === 'past' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterMode('past')}
        >
          Trecute
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
        >
          <List className="w-4 h-4 mr-2" />
          Listă
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('calendar')}
        >
          <CalendarDays className="w-4 h-4 mr-2" />
          Calendar
        </Button>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
              <div key={idx} className="text-center font-medium text-sm text-muted-foreground p-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, idx) => {
              const date = new Date(today);
              date.setDate(date.getDate() - date.getDay() + 1 + idx);
              const dayEvents = filteredEvents.filter(e => {
                const eventDate = new Date(e.date);
                eventDate.setHours(0, 0, 0, 0);
                const checkDate = new Date(date);
                checkDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() === checkDate.getTime();
              });
              const isToday = date.toDateString() === today.toDateString();

              return (
                <div
                  key={idx}
                  className={`aspect-square p-2 border rounded-lg text-center ${
                    isToday ? 'border-primary bg-primary/5' : ''
                  } ${dayEvents.length > 0 ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm ${isToday ? 'font-bold text-primary' : ''}`}>
                    {date.getDate()}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary mx-auto" />
                      <div className="text-xs text-muted-foreground mt-1">{dayEvents.length}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Events List Grouped by Month */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
          <div key={monthYear}>
            <h3 className="mb-3 sticky top-0 bg-background py-2 z-10">{monthYear}</h3>
            <div className="space-y-3">
              {monthEvents.map((event) => {
                const attendance = getAttendanceCount(event);
                const isPast = isPastEvent(event);
                const isToday = formatDate(event.date) === 'Astăzi';

                return (
                  <Card
                    key={event.id}
                    className={`p-4 ${isPast ? 'bg-muted/30 border-muted-foreground/20' : ''} ${isToday ? 'border-primary border-2' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={getEventTypeColor(event.type)}
                          >
                            {event.type === 'match' ? 'Meci' : 'Antrenament'}
                          </Badge>
                          {isToday && (
                            <Badge variant="default" className="bg-primary">
                              Astăzi
                            </Badge>
                          )}
                          {isPast && event.matchDetails?.score && (
                            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                              {event.matchDetails.score.team} - {event.matchDetails.score.opponent}
                            </Badge>
                          )}
                        </div>

                        <div className="font-medium mb-1">{event.title}</div>
                        {event.matchDetails?.opponent && (
                          <div className="text-sm text-muted-foreground mb-2">
                            {event.matchDetails.opponent}
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {event.startTime} ({event.duration} min)
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate">{event.location}</span>
                        </div>

                        {event.notes && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                            <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                            {event.notes}
                          </div>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-sm font-medium">
                          {attendance.confirmed}/{attendance.total}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isPast ? 'prezent' : 'confirmați'}
                        </div>
                      </div>
                    </div>

                    {/* Attendance Progress */}
                    {!isPast && (
                      <div className="mb-3">
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{
                              width: `${(attendance.confirmed / attendance.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {/* Coach: Add result for past matches without score */}
                      {isPast && currentUser.role === 'coach' && event.type === 'match' && !event.matchDetails?.score && (
                        <Button
                          size="sm"
                          className="flex-1 bg-primary"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowMatchResultForm(true);
                          }}
                        >
                          <Trophy className="w-4 h-4 mr-1" />
                          Adaugă rezultat
                        </Button>
                      )}

                      {/* Coach: Mark attendance for today's events */}
                      {!isPast && currentUser.role === 'coach' && isToday && (
                        <Button size="sm" className="flex-1">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Marchează prezența
                        </Button>
                      )}

                      {/* View details button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className={!isPast && currentUser.role === 'coach' && isToday ? 'flex-1' :
                                   isPast && currentUser.role === 'coach' && event.type === 'match' && !event.matchDetails?.score ? 'flex-1' : 'w-full'}
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventDetail(true);
                        }}
                      >
                        {isPast && event.matchDetails?.score ? 'Vezi rezultat' : 'Detalii'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
        </div>
      )}

      {filteredEvents.length === 0 && (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            Nu există evenimente programate
          </p>
          {currentUser.role === 'coach' && (
            <Button className="mt-4" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adaugă primul eveniment
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
