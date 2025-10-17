import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar, Clock, MapPin, Plus, CheckCircle2, AlertCircle, List, CalendarDays, Bell, X, Save } from 'lucide-react';
import { getTeamById, getEventsByTeamId, getPlayersByTeamId } from '../data/mockData';
import type { Event } from '../types';

type ViewMode = 'list' | 'calendar';
type FilterMode = 'all' | 'today' | 'upcoming' | 'past';

export function Schedule() {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
                      {!isPast && currentUser.role === 'coach' && isToday && (
                        <Button size="sm" className="flex-1">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Marchează prezența
                        </Button>
                      )}
                      {!isPast && currentUser.role === 'parent' && (
                        <Button size="sm" variant="outline" className="flex-1">
                          Confirmă participare
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className={!isPast && (currentUser.role === 'coach' || currentUser.role === 'parent') ? 'flex-1' : 'w-full'}
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
