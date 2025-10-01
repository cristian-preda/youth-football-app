import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import {
  Search,
  Target,
  Activity,
  Heart,
  Phone,
  X,
  TrendingUp,
  Award,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { getTeamById, getPlayersByTeamId, getUserById } from '../data/mockData';
import type { Player } from '../types';

export function PlayerRoster() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [filterPosition, setFilterPosition] = useState<string>('all');

  if (!currentUser) return null;

  const teamId = currentUser.teamId || 'team-1';
  const team = getTeamById(teamId);
  const teamPlayers = team ? getPlayersByTeamId(team.id) : [];

  const positions = ['Portar', 'Fundaș', 'Mijlocaș', 'Atacant'];

  const filteredPlayers = teamPlayers
    .filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = filterPosition === 'all' || player.position === filterPosition;
      return matchesSearch && matchesPosition;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'Portar':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Fundaș':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Mijlocaș':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Atacant':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Player Detail Modal
  if (selectedPlayer) {
    const parent = selectedPlayer.parentIds[0] ? getUserById(selectedPlayer.parentIds[0]) : null;

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setSelectedPlayer(null)}>
              <X className="w-5 h-5" />
            </Button>
            <h2>Profil Jucător</h2>
            <div className="w-10" />
          </div>

          {/* Player Info Card */}
          <Card className="p-6">
            <div className="flex flex-col items-center text-center mb-4">
              <Avatar className="w-24 h-24 mb-3">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {getInitials(selectedPlayer.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="mb-1">{selectedPlayer.name}</h2>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={getPositionColor(selectedPlayer.position)}>
                  {selectedPlayer.position}
                </Badge>
                {selectedPlayer.jerseyNumber && (
                  <Badge variant="outline">#{selectedPlayer.jerseyNumber}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Vârsta: {selectedPlayer.age} ani • Născut: {new Date(selectedPlayer.dateOfBirth).toLocaleDateString('ro-RO')}
              </p>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold">{selectedPlayer.stats.goals}</div>
              <div className="text-xs text-muted-foreground">Goluri</div>
            </Card>
            <Card className="p-4 text-center">
              <Activity className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{selectedPlayer.stats.assists}</div>
              <div className="text-xs text-muted-foreground">Pase decisive</div>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{selectedPlayer.stats.minutesPlayed}</div>
              <div className="text-xs text-muted-foreground">Minute jucate</div>
            </Card>
            <Card className="p-4 text-center">
              <Award className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{selectedPlayer.stats.matchesPlayed}</div>
              <div className="text-xs text-muted-foreground">Meciuri</div>
            </Card>
          </div>

          {/* Additional Stats */}
          <Card className="p-4">
            <h3 className="mb-3">Statistici detaliate</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Medie minute/meci</span>
                <span className="font-medium">
                  {selectedPlayer.stats.matchesPlayed > 0
                    ? Math.round(selectedPlayer.stats.minutesPlayed / selectedPlayer.stats.matchesPlayed)
                    : 0} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Medie goluri/meci</span>
                <span className="font-medium">
                  {selectedPlayer.stats.matchesPlayed > 0
                    ? (selectedPlayer.stats.goals / selectedPlayer.stats.matchesPlayed).toFixed(1)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cartonașe galbene</span>
                <span className="font-medium">{selectedPlayer.stats.yellowCards}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cartonașe roșii</span>
                <span className="font-medium">{selectedPlayer.stats.redCards}</span>
              </div>
              {selectedPlayer.stats.cleanSheets !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Meciuri fără gol primit</span>
                  <span className="font-medium">{selectedPlayer.stats.cleanSheets}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Medical History */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-red-600" />
              <h3>Istoric medical</h3>
            </div>
            {selectedPlayer.medicalHistory.length > 0 ? (
              <div className="space-y-3">
                {selectedPlayer.medicalHistory.map((record) => (
                  <div key={record.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle
                          className={`w-4 h-4 ${
                            record.severity === 'high'
                              ? 'text-red-600'
                              : record.severity === 'medium'
                              ? 'text-yellow-600'
                              : 'text-blue-600'
                          }`}
                        />
                        <span className="font-medium text-sm">{record.description}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          record.type === 'injury'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }
                      >
                        {record.type === 'injury' ? 'Accidentare' : 'Verificare'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>
                        Data: {new Date(record.date).toLocaleDateString('ro-RO')}
                      </div>
                      {record.recoveryDate && (
                        <div>
                          Recuperare: {new Date(record.recoveryDate).toLocaleDateString('ro-RO')}
                        </div>
                      )}
                      {record.notes && <div className="mt-1 italic">{record.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Fără istoric medical</p>
            )}
          </Card>

          {/* Parent Contact */}
          {parent && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-5 h-5 text-primary" />
                <h3>Contact părinte</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Nume: </span>
                  <span className="font-medium">{parent.name}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Telefon: </span>
                  <span className="font-medium">{parent.phone}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email: </span>
                  <span className="font-medium">{parent.email}</span>
                </div>
              </div>
              <Button className="w-full mt-3">
                <MessageSquare className="w-4 h-4 mr-2" />
                Trimite mesaj
              </Button>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Players List
  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div>
        <h1>Jucători</h1>
        <p className="text-muted-foreground">
          Echipa {team?.name} • {teamPlayers.length} jucători
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Caută jucător..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Position Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filterPosition === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterPosition('all')}
        >
          Toți ({teamPlayers.length})
        </Button>
        {positions.map((pos) => (
          <Button
            key={pos}
            variant={filterPosition === pos ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterPosition(pos)}
          >
            {pos} ({teamPlayers.filter(p => p.position === pos).length})
          </Button>
        ))}
      </div>

      {/* Players Grid */}
      <div className="grid gap-3">
        {filteredPlayers.map((player) => (
          <Card
            key={player.id}
            className="p-4 cursor-pointer hover:bg-muted transition-colors"
            onClick={() => setSelectedPlayer(player)}
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-14 h-14">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(player.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{player.name}</span>
                  {player.jerseyNumber && (
                    <Badge variant="outline" className="text-xs">
                      #{player.jerseyNumber}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  {player.position} • {player.age} ani
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{player.stats.goals} goluri</span>
                  <span>•</span>
                  <span>{player.stats.assists} pase</span>
                  <span>•</span>
                  <span>{player.stats.matchesPlayed} meciuri</span>
                </div>
              </div>

              <div className="text-right">
                <Badge variant="outline" className={getPositionColor(player.position)}>
                  {player.position[0]}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <Card className="p-8 text-center">
          <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            {searchTerm ? 'Niciun jucător găsit' : 'Nu există jucători'}
          </p>
        </Card>
      )}
    </div>
  );
}
