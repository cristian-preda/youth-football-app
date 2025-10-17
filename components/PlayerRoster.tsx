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
  ArrowUpDown,
  Download,
  Edit,
  ChevronDown,
  BarChart3,
  Save,
} from 'lucide-react';
import { getTeamById, getPlayersByTeamId, getUserById } from '../data/mockData';
import type { Player } from '../types';

type SortOption = 'name' | 'position' | 'goals' | 'assists' | 'matches';

interface PlayerRosterProps {
  initialPlayerId?: string;
}

export function PlayerRoster({ initialPlayerId }: PlayerRosterProps = {}) {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedPlayer, setEditedPlayer] = useState<Player | null>(null);
  const [showPerformanceChart, setShowPerformanceChart] = useState(false);

  if (!currentUser) return null;

  const teamId = currentUser.teamId || 'team-1';
  const team = getTeamById(teamId);
  const teamPlayers = team ? getPlayersByTeamId(team.id) : [];

  // If initialPlayerId is provided, set that player as selected
  if (initialPlayerId && !selectedPlayer) {
    const player = teamPlayers.find(p => p.id === initialPlayerId);
    if (player) {
      setSelectedPlayer(player);
    }
  }

  const positions = ['Portar', 'Fundaș', 'Mijlocaș', 'Atacant'];

  // Sorting logic
  const getSortValue = (player: Player, sortBy: SortOption) => {
    switch (sortBy) {
      case 'name':
        return player.name;
      case 'position':
        return player.position;
      case 'goals':
        return player.stats.goals;
      case 'assists':
        return player.stats.assists;
      case 'matches':
        return player.stats.matchesPlayed;
      default:
        return player.name;
    }
  };

  const filteredPlayers = teamPlayers
    .filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = filterPosition === 'all' || player.position === filterPosition;
      return matchesSearch && matchesPosition;
    })
    .sort((a, b) => {
      const aValue = getSortValue(a, sortBy);
      const bValue = getSortValue(b, sortBy);

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

  // Export functionality
  const exportPlayerList = () => {
    const csvContent = [
      ['Nume', 'Poziție', 'Vârstă', 'Goluri', 'Pase', 'Meciuri', 'Minute', 'Cartonașe galbene', 'Cartonașe roșii'],
      ...filteredPlayers.map(p => [
        p.name,
        p.position,
        p.age,
        p.stats.goals,
        p.stats.assists,
        p.stats.matchesPlayed,
        p.stats.minutesPlayed,
        p.stats.yellowCards,
        p.stats.redCards,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `jucatori_${team?.name}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save edited player
  const handleSavePlayer = () => {
    if (editedPlayer) {
      // In a real app, this would update the backend
      console.log('Saving player:', editedPlayer);
      setSelectedPlayer(editedPlayer);
      setIsEditMode(false);
    }
  };

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
    const displayPlayer = isEditMode && editedPlayer ? editedPlayer : selectedPlayer;

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedPlayer(null);
                setIsEditMode(false);
                setEditedPlayer(null);
                setShowPerformanceChart(false);
              }}
            >
              <X className="w-5 h-5" />
            </Button>
            <h2>{isEditMode ? 'Editează Jucător' : 'Profil Jucător'}</h2>
            {!isEditMode ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditMode(true);
                  setEditedPlayer(selectedPlayer);
                }}
              >
                <Edit className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSavePlayer}
              >
                <Save className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Player Info Card */}
          <Card className="p-6">
            <div className="flex flex-col items-center text-center mb-4">
              <Avatar className="w-24 h-24 mb-3">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {getInitials(displayPlayer.name)}
                </AvatarFallback>
              </Avatar>
              {isEditMode && editedPlayer ? (
                <div className="w-full space-y-3">
                  <div>
                    <Label htmlFor="name">Nume</Label>
                    <Input
                      id="name"
                      value={editedPlayer.name}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jerseyNumber">Număr tricou</Label>
                    <Input
                      id="jerseyNumber"
                      type="number"
                      value={editedPlayer.jerseyNumber || ''}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, jerseyNumber: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Poziție</Label>
                    <select
                      id="position"
                      className="w-full p-2 border rounded-md"
                      value={editedPlayer.position}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, position: e.target.value as any })}
                    >
                      {positions.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="mb-1">{displayPlayer.name}</h2>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={getPositionColor(displayPlayer.position)}>
                      {displayPlayer.position}
                    </Badge>
                    {displayPlayer.jerseyNumber && (
                      <Badge variant="outline">#{displayPlayer.jerseyNumber}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Vârsta: {displayPlayer.age} ani • Născut: {new Date(displayPlayer.dateOfBirth).toLocaleDateString('ro-RO')}
                  </p>
                </>
              )}
            </div>
          </Card>

          {/* Performance Chart Toggle */}
          {!isEditMode && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowPerformanceChart(!showPerformanceChart)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showPerformanceChart ? 'Ascunde grafic' : 'Arată grafic performanță'}
            </Button>
          )}

          {/* Performance Chart */}
          <AnimatePresence>
            {showPerformanceChart && !isEditMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="p-4">
                  <h3 className="mb-4">Evoluție performanță</h3>
                  <div className="space-y-4">
                    {/* Goals Trend */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Goluri</span>
                        <span className="text-sm font-medium">{displayPlayer.stats.goals}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          className="bg-red-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((displayPlayer.stats.goals / 20) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: 0.1 }}
                        />
                      </div>
                    </div>

                    {/* Assists Trend */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Pase decisive</span>
                        <span className="text-sm font-medium">{displayPlayer.stats.assists}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          className="bg-blue-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((displayPlayer.stats.assists / 15) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </div>

                    {/* Minutes Played */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Minute jucate</span>
                        <span className="text-sm font-medium">{displayPlayer.stats.minutesPlayed}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          className="bg-green-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((displayPlayer.stats.minutesPlayed / 1000) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>

                    {/* Match Participation Rate */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Rata participare meciuri</span>
                        <span className="text-sm font-medium">
                          {displayPlayer.stats.matchesPlayed > 0
                            ? `${Math.round((displayPlayer.stats.minutesPlayed / (displayPlayer.stats.matchesPlayed * 90)) * 100)}%`
                            : '0%'}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          className="bg-purple-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: displayPlayer.stats.matchesPlayed > 0
                              ? `${Math.min((displayPlayer.stats.minutesPlayed / (displayPlayer.stats.matchesPlayed * 90)) * 100, 100)}%`
                              : '0%'
                          }}
                          transition={{ duration: 1, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-red-600" />
              {isEditMode && editedPlayer ? (
                <Input
                  type="number"
                  value={editedPlayer.stats.goals}
                  onChange={(e) => setEditedPlayer({
                    ...editedPlayer,
                    stats: { ...editedPlayer.stats, goals: parseInt(e.target.value) || 0 }
                  })}
                  className="text-center"
                />
              ) : (
                <div className="text-2xl font-bold">{displayPlayer.stats.goals}</div>
              )}
              <div className="text-xs text-muted-foreground">Goluri</div>
            </Card>
            <Card className="p-4 text-center">
              <Activity className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              {isEditMode && editedPlayer ? (
                <Input
                  type="number"
                  value={editedPlayer.stats.assists}
                  onChange={(e) => setEditedPlayer({
                    ...editedPlayer,
                    stats: { ...editedPlayer.stats, assists: parseInt(e.target.value) || 0 }
                  })}
                  className="text-center"
                />
              ) : (
                <div className="text-2xl font-bold">{displayPlayer.stats.assists}</div>
              )}
              <div className="text-xs text-muted-foreground">Pase decisive</div>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
              {isEditMode && editedPlayer ? (
                <Input
                  type="number"
                  value={editedPlayer.stats.minutesPlayed}
                  onChange={(e) => setEditedPlayer({
                    ...editedPlayer,
                    stats: { ...editedPlayer.stats, minutesPlayed: parseInt(e.target.value) || 0 }
                  })}
                  className="text-center"
                />
              ) : (
                <div className="text-2xl font-bold">{displayPlayer.stats.minutesPlayed}</div>
              )}
              <div className="text-xs text-muted-foreground">Minute jucate</div>
            </Card>
            <Card className="p-4 text-center">
              <Award className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              {isEditMode && editedPlayer ? (
                <Input
                  type="number"
                  value={editedPlayer.stats.matchesPlayed}
                  onChange={(e) => setEditedPlayer({
                    ...editedPlayer,
                    stats: { ...editedPlayer.stats, matchesPlayed: parseInt(e.target.value) || 0 }
                  })}
                  className="text-center"
                />
              ) : (
                <div className="text-2xl font-bold">{displayPlayer.stats.matchesPlayed}</div>
              )}
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
      <div className="flex items-start justify-between">
        <div>
          <h1>Jucători</h1>
          <p className="text-muted-foreground">
            Echipa {team?.name} • {teamPlayers.length} jucători
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportPlayerList}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Search and Sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Caută jucător..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowSortMenu(!showSortMenu)}
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Sortează
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
          <AnimatePresence>
            {showSortMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg z-50 p-2"
              >
                <div className="space-y-1">
                  {[
                    { value: 'name' as SortOption, label: 'Nume' },
                    { value: 'position' as SortOption, label: 'Poziție' },
                    { value: 'goals' as SortOption, label: 'Goluri' },
                    { value: 'assists' as SortOption, label: 'Pase' },
                    { value: 'matches' as SortOption, label: 'Meciuri' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-muted ${
                        sortBy === option.value ? 'bg-muted font-medium' : ''
                      }`}
                      onClick={() => {
                        if (sortBy === option.value) {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy(option.value);
                          setSortOrder('asc');
                        }
                        setShowSortMenu(false);
                      }}
                    >
                      {option.label} {sortBy === option.value && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
