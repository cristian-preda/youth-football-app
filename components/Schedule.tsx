import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Clock, MapPin, Users, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { getTeamById, getEventsByTeamId, getPlayersByTeamId } from '../data/mockData';
import type { Event } from '../types';

export function Schedule() {
  const { currentUser } = useAuth();

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

  const groupedEvents = groupEventsByMonth(sortedEvents);

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
        {currentUser.role === 'coach' && (
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Adaugă
          </Button>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button variant="default" size="sm">
          Listă
        </Button>
        <Button variant="outline" size="sm">
          Calendar
        </Button>
        <Button variant="outline" size="sm">
          Săptămâna
        </Button>
      </div>

      {/* Events List Grouped by Month */}
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
                    className={`p-4 ${isPast ? 'opacity-60' : ''} ${isToday ? 'border-primary border-2' : ''}`}
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

      {sortedEvents.length === 0 && (
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
