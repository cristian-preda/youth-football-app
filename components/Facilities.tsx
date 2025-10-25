// ABOUTME: Facilities Management component for Director role
// ABOUTME: Displays training field bookings and facility usage across the club

import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  Wrench,
  Plus,
} from 'lucide-react';
import {
  getFacilityBookingsByClubId,
  getTeamById,
  clubs,
} from '../data/mockData';

export function Facilities() {
  const { currentUser } = useAuth();
  const club = currentUser ? clubs.find(c => c.id === currentUser.clubId) : null;
  const bookings = club ? getFacilityBookingsByClubId(club.id) : [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group bookings by date
  const todayBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate.getTime() === today.getTime();
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tomorrowBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate.getTime() === tomorrow.getTime();
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const upcomingBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate.getTime() > tomorrow.getTime();
  }).sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  const getPurposeLabel = (purpose: string) => {
    switch (purpose) {
      case 'training': return 'Antrenament';
      case 'match': return 'Meci';
      case 'maintenance': return 'Întreținere';
      case 'other': return 'Altele';
      default: return purpose;
    }
  };

  const getPurposeColor = (purpose: string) => {
    switch (purpose) {
      case 'training': return 'secondary';
      case 'match': return 'default';
      case 'maintenance': return 'destructive';
      case 'other': return 'outline';
      default: return 'secondary';
    }
  };

  const getPurposeIcon = (purpose: string) => {
    switch (purpose) {
      case 'training': return Users;
      case 'match': return Users;
      case 'maintenance': return Wrench;
      case 'other': return MapPin;
      default: return MapPin;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
    const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const getEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const renderBookingCard = (booking: typeof bookings[0]) => {
    const team = booking.teamId ? getTeamById(booking.teamId) : null;
    const PurposeIcon = getPurposeIcon(booking.purpose);
    const endTime = getEndTime(booking.startTime, booking.duration);

    return (
      <Card key={booking.id} className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            booking.purpose === 'maintenance' ? 'bg-red-100' : 'bg-primary/10'
          }`}>
            <PurposeIcon className={`w-5 h-5 ${
              booking.purpose === 'maintenance' ? 'text-red-600' : 'text-primary'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="font-semibold text-sm mb-1">{booking.facilityName}</div>
                <div className="flex items-center gap-2">
                  <Badge variant={getPurposeColor(booking.purpose) as any} className="text-xs">
                    {getPurposeLabel(booking.purpose)}
                  </Badge>
                  {team && (
                    <span className="text-xs text-muted-foreground">{team.name}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{booking.startTime} - {endTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{booking.duration} min</span>
              </div>
            </div>

            {booking.notes && (
              <div className="flex items-start gap-1 text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded">
                <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>{booking.notes}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const totalBookings = bookings.length;
  const maintenanceBookings = bookings.filter(b => b.purpose === 'maintenance').length;
  const uniqueFacilities = [...new Set(bookings.map(b => b.facilityName))].length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Facilități</h1>
        <p className="text-muted-foreground">
          Gestionează rezervările pentru terenuri și facilități
        </p>
      </motion.div>

      {/* Add Booking Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Button className="w-full h-14" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Adaugă rezervare
        </Button>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-xl font-semibold text-center">{uniqueFacilities}</div>
            <div className="text-xs text-muted-foreground text-center">Terenuri</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card className="p-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-xl font-semibold text-center">{totalBookings}</div>
            <div className="text-xs text-muted-foreground text-center">Rezervări</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mx-auto mb-2">
              <Wrench className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-xl font-semibold text-center">{maintenanceBookings}</div>
            <div className="text-xs text-muted-foreground text-center">Întreținere</div>
          </Card>
        </motion.div>
      </div>

      {/* Today's Bookings */}
      {todayBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="mb-3">Astăzi</h3>
          <div className="space-y-2">
            {todayBookings.map(renderBookingCard)}
          </div>
        </motion.div>
      )}

      {/* Tomorrow's Bookings */}
      {tomorrowBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="mb-3">Mâine</h3>
          <div className="space-y-2">
            {tomorrowBookings.map(renderBookingCard)}
          </div>
        </motion.div>
      )}

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="mb-3">Următoare</h3>
          <div className="space-y-2">
            {upcomingBookings.slice(0, 5).map((booking) => {
              const team = booking.teamId ? getTeamById(booking.teamId) : null;
              const PurposeIcon = getPurposeIcon(booking.purpose);
              const endTime = getEndTime(booking.startTime, booking.duration);

              return (
                <Card key={booking.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      booking.purpose === 'maintenance' ? 'bg-red-100' : 'bg-primary/10'
                    }`}>
                      <PurposeIcon className={`w-4 h-4 ${
                        booking.purpose === 'maintenance' ? 'text-red-600' : 'text-primary'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{booking.facilityName}</span>
                        {team && (
                          <Badge variant="secondary" className="text-xs">{team.name}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDate(booking.date)}</span>
                        <span>{booking.startTime} - {endTime}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {bookings.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="mb-2">Nu există rezervări</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Începe prin a crea prima rezervare pentru facilități
            </p>
            <Button variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Adaugă rezervare
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

