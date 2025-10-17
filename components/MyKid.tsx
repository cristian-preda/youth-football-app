// ABOUTME: Parent-focused view of their child's profile, stats, and medical history
// ABOUTME: Shows comprehensive information including attendance, performance trends, and team context

import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';
import {
  User,
  Trophy,
  TrendingUp,
  Calendar,
  Heart,
  Target,
  Clock,
  Shield,
  Activity,
  Award,
} from 'lucide-react';
import {
  getChildrenByParentId,
  getTeamById,
  getUserById,
  getEventsByTeamId,
} from '../data/mockData';

export function MyKid() {
  const { currentUser } = useAuth();

  if (!currentUser || currentUser.role !== 'parent') {
    return null;
  }

  const children = getChildrenByParentId(currentUser.id);
  const child = children[0]; // For MVP, focus on first child

  if (!child) {
    return (
      <div className="space-y-6 pb-20">
        <h1>Copilul meu</h1>
        <Card className="p-6 text-center">
          <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            Nu există informații despre copil.
          </p>
        </Card>
      </div>
    );
  }

  const team = getTeamById(child.teamId);
  const coach = team ? getUserById(team.coachId) : null;
  const teamEvents = team ? getEventsByTeamId(team.id) : [];

  // Calculate attendance statistics
  const attendanceRecords = teamEvents.flatMap(event =>
    event.attendance.filter(a => a.playerId === child.id)
  );
  const presentCount = attendanceRecords.filter(
    a => a.status === 'present' || a.status === 'late'
  ).length;
  const attendanceRate =
    attendanceRecords.length > 0
      ? Math.round((presentCount / attendanceRecords.length) * 100)
      : 0;

  // Recent attendance pattern (last 5 events)
  const recentEvents = teamEvents
    .filter(e => new Date(e.date) <= new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
    const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'present':
        return '✓';
      case 'late':
        return '⏱';
      case 'absent':
        return '✗';
      case 'excused':
        return '📋';
      default:
        return '?';
    }
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-green-600';
      case 'late':
        return 'text-yellow-600';
      case 'absent':
        return 'text-red-600';
      case 'excused':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
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
        <h1>Copilul meu</h1>
        <p className="text-muted-foreground">Profilul complet al lui {child.name}</p>
      </motion.div>

      {/* Child Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="mb-1">{child.name}</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary">
                  {child.age} ani
                </Badge>
                <Badge variant="secondary">
                  #{child.jerseyNumber}
                </Badge>
                <Badge variant="outline">
                  {child.position}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Echipa: {team?.name}</div>
                <div>Antrenor: {coach?.name}</div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{child.stats.goals}</div>
                <div className="text-xs text-muted-foreground">Goluri</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{child.stats.assists}</div>
                <div className="text-xs text-muted-foreground">Pase decisive</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{child.stats.matchesPlayed}</div>
                <div className="text-xs text-muted-foreground">Meciuri</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{child.stats.minutesPlayed}</div>
                <div className="text-xs text-muted-foreground">Minute</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Attendance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="mb-3">Prezență</h3>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-semibold text-green-600">{attendanceRate}%</div>
              <div className="text-sm text-muted-foreground">Rată de prezență</div>
            </div>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {recentEvents.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Ultimele evenimente:</div>
              <div className="space-y-2">
                {recentEvents.map(event => {
                  const attendance = event.attendance.find(a => a.playerId === child.id);
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex-1 truncate">
                        <span className="text-muted-foreground">{formatDate(event.date)}</span>
                        <span className="mx-2">•</span>
                        <span>{event.title}</span>
                      </div>
                      <span className={`ml-2 ${getAttendanceColor(attendance?.status || 'pending')}`}>
                        {getAttendanceIcon(attendance?.status || 'pending')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Performance Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3 className="mb-3">Statistici detaliate</h3>
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Goluri marcate</span>
              </div>
              <span className="font-semibold">{child.stats.goals}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Pase decisive</span>
              </div>
              <span className="font-semibold">{child.stats.assists}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-sm">Meciuri jucate</span>
              </div>
              <span className="font-semibold">{child.stats.matchesPlayed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-sm">Minute jucate</span>
              </div>
              <span className="font-semibold">{child.stats.minutesPlayed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-orange-600" />
                <span className="text-sm">Cartonașe galbene</span>
              </div>
              <span className="font-semibold">{child.stats.yellowCards}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-600" />
                <span className="text-sm">Cartonașe roșii</span>
              </div>
              <span className="font-semibold">{child.stats.redCards}</span>
            </div>
            {child.position === 'Portar' && child.stats.cleanSheets !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Meciuri fără gol primit</span>
                </div>
                <span className="font-semibold">{child.stats.cleanSheets}</span>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Medical History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3 className="mb-3">Istoric medical</h3>
        <Card className="p-4">
          {child.medicalHistory.length > 0 ? (
            <div className="space-y-3">
              {child.medicalHistory.map(record => (
                <div key={record.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{record.description}</span>
                        {record.severity && (
                          <Badge
                            variant={
                              record.severity === 'high'
                                ? 'destructive'
                                : record.severity === 'medium'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {record.severity === 'high'
                              ? 'Gravitate mare'
                              : record.severity === 'medium'
                              ? 'Gravitate medie'
                              : 'Gravitate mică'}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>Data: {new Date(record.date).toLocaleDateString('ro-RO')}</div>
                        {record.recoveryDate && (
                          <div>
                            Recuperare: {new Date(record.recoveryDate).toLocaleDateString('ro-RO')}
                          </div>
                        )}
                        {record.notes && <div className="mt-1">{record.notes}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Heart className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nu există înregistrări medicale
              </p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

