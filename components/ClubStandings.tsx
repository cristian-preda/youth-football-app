import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Trophy, Shield, Calendar, MapPin, Users as UsersIcon, Award } from 'lucide-react';
import { clubs, teams } from '../data/mockData';
import type { LeagueStandings } from '../types';

interface ClubStandingsProps {
  onNavigate?: (tab: string) => void;
}

export function ClubStandings({ onNavigate }: ClubStandingsProps) {
  const { currentUser } = useAuth();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('U9');

  if (!currentUser) return null;

  const club = clubs.find(c => c.id === currentUser.clubId);
  const clubTeams = teams.filter(t => t.clubId === currentUser.clubId);

  // TODO: This will come from mockData - for now, hardcoded sample standings
  const leagueStandings: Record<string, LeagueStandings> = {
    U9: {
      id: 'league-u9',
      leagueName: 'Liga Municipală București U9',
      season: '2024/2025',
      ageGroup: 'U9',
      lastUpdated: '2025-01-15T18:00:00',
      standings: [
        {
          teamId: 'team-1',
          teamName: 'FC Steaua Academy U9',
          position: 1,
          played: 12,
          won: 8,
          drawn: 2,
          lost: 2,
          goalsFor: 28,
          goalsAgainst: 15,
          goalDifference: 13,
          points: 26,
        },
        {
          teamId: 'team-other-1',
          teamName: 'FC Rapid U9',
          position: 2,
          played: 12,
          won: 7,
          drawn: 3,
          lost: 2,
          goalsFor: 24,
          goalsAgainst: 14,
          goalDifference: 10,
          points: 24,
        },
        {
          teamId: 'team-other-2',
          teamName: 'Dinamo București U9',
          position: 3,
          played: 12,
          won: 6,
          drawn: 4,
          lost: 2,
          goalsFor: 22,
          goalsAgainst: 16,
          goalDifference: 6,
          points: 22,
        },
        {
          teamId: 'team-other-3',
          teamName: 'Progresul București U9',
          position: 4,
          played: 12,
          won: 5,
          drawn: 3,
          lost: 4,
          goalsFor: 18,
          goalsAgainst: 20,
          goalDifference: -2,
          points: 18,
        },
        {
          teamId: 'team-other-4',
          teamName: 'Sportul Studențesc U9',
          position: 5,
          played: 12,
          won: 3,
          drawn: 2,
          lost: 7,
          goalsFor: 14,
          goalsAgainst: 24,
          goalDifference: -10,
          points: 11,
        },
      ],
    },
  };

  const standings = leagueStandings[selectedAgeGroup];
  const userTeam = standings?.standings.find(s => s.teamId === currentUser.teamId);

  const getPositionColor = (position: number) => {
    if (position === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (position <= 3) return 'bg-green-100 text-green-800 border-green-200';
    if (position >= standings.standings.length - 2) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return '🏆';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return position;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Club & Clasament</h1>
        <p className="text-muted-foreground">{club?.name}</p>
      </motion.div>

      {/* Club Info Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="mb-2">{club?.name}</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{club?.city}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Fondat {club?.founded}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UsersIcon className="w-4 h-4" />
                  <span>{clubTeams.length} echipe</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>{club?.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* User's Team Highlight (if applicable) */}
          {userTeam && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Echipa ta</p>
                  <p className="font-semibold">{userTeam.teamName}</p>
                </div>
                <Badge variant="outline" className={getPositionColor(userTeam.position)}>
                  Locul {userTeam.position}
                </Badge>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Age Group Selector */}
      <div className="space-y-3">
        <h3>Echipe Club</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {clubTeams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
            >
              <Button
                variant={selectedAgeGroup === team.ageGroup ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedAgeGroup(team.ageGroup)}
                className="flex-shrink-0"
              >
                {team.name}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* League Info */}
      {standings && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-4 bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold">{standings.leagueName}</h3>
                <p className="text-xs text-muted-foreground">Sezon {standings.season}</p>
              </div>
              <Badge variant="outline">
                {standings.standings.length} echipe
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Actualizat: {new Date(standings.lastUpdated).toLocaleDateString('ro-RO', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </Card>
        </motion.div>
      )}

      {/* Standings Table */}
      {standings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-2"
        >
          <h3>Clasament</h3>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Echipă</div>
            <div className="col-span-1 text-center">M</div>
            <div className="col-span-2 text-center">Golaveraj</div>
            <div className="col-span-3 text-center">Puncte</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2">
            {standings.standings.map((team, index) => {
              const isUserTeam = team.teamId === currentUser.teamId;

              return (
                <motion.div
                  key={team.teamId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                >
                  <Card
                    className={`p-3 ${isUserTeam ? 'border-2 border-primary bg-primary/5' : ''}`}
                  >
                    <div className="grid grid-cols-12 gap-2 items-center">
                      {/* Position */}
                      <div className="col-span-1">
                        <span className="text-lg font-bold">
                          {typeof getPositionIcon(team.position) === 'string' ?
                            getPositionIcon(team.position) :
                            <span className="text-sm">{team.position}</span>
                          }
                        </span>
                      </div>

                      {/* Team Name */}
                      <div className="col-span-5">
                        <div className="font-medium text-sm leading-tight">
                          {team.teamName}
                          {isUserTeam && (
                            <Badge variant="outline" className="ml-2 text-xs bg-primary/10 border-primary">
                              Tu
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {team.won}V {team.drawn}E {team.lost}Î
                        </div>
                      </div>

                      {/* Matches Played */}
                      <div className="col-span-1 text-center text-sm">
                        {team.played}
                      </div>

                      {/* Goal Difference */}
                      <div className="col-span-2 text-center">
                        <div className="text-xs text-muted-foreground">{team.goalsFor}:{team.goalsAgainst}</div>
                        <div className={`text-sm font-semibold ${
                          team.goalDifference > 0 ? 'text-green-600' :
                          team.goalDifference < 0 ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                        </div>
                      </div>

                      {/* Points */}
                      <div className="col-span-3 text-center">
                        <Badge
                          variant="outline"
                          className={`${getPositionColor(team.position)} font-bold text-base px-3 py-1`}
                        >
                          {team.points}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <Card className="p-4 bg-muted/30">
            <p className="text-xs font-semibold mb-2">Legendă:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>M = Meciuri jucate</div>
              <div>V = Victorii</div>
              <div>E = Egaluri</div>
              <div>Î = Înfrângeri</div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card className="p-6 text-center bg-gradient-to-br from-primary/5 to-transparent">
          <Award className="w-12 h-12 mx-auto mb-3 text-primary" />
          <h3 className="mb-2">Vezi echipa ta</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Acces complet la program, jucători și statistici
          </p>
          <Button onClick={() => onNavigate?.('team')}>
            <UsersIcon className="w-4 h-4 mr-2" />
            Deschide Echipa
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
