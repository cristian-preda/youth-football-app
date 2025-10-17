import { useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Save, Plus, Minus, Target, AlertTriangle, Clock, X } from 'lucide-react';
import { getPlayersByTeamId, getPlayerById } from '../data/mockData';
import { NavigationHeader } from './NavigationHeader';
import type { Event, Card as CardType, PlayerMatchStats, GoalScorer } from '../types';

interface MatchResultFormProps {
  event: Event;
  onClose: () => void;
  onSave: (matchData: MatchResultData) => void;
}

export interface MatchResultData {
  score: {
    team: number;
    opponent: number;
  };
  goalScorers: GoalScorer[];
  cards: CardType[];
  playerStats: PlayerMatchStats[];
}

export function MatchResultForm({ event, onClose, onSave }: MatchResultFormProps) {
  const { currentUser } = useAuth();
  const teamPlayers = getPlayersByTeamId(event.teamId);

  // Initialize state
  const [teamScore, setTeamScore] = useState(event.matchDetails?.score?.team || 0);
  const [opponentScore, setOpponentScore] = useState(event.matchDetails?.score?.opponent || 0);

  // Goals tracking
  const [goals, setGoals] = useState<GoalScorer[]>(event.matchDetails?.goalScorers || []);

  // Cards tracking
  const [cards, setCards] = useState<CardType[]>(event.matchDetails?.cards || []);

  // Minutes played per player
  const [playerMinutes, setPlayerMinutes] = useState<Record<string, number>>(
    teamPlayers.reduce((acc, player) => {
      const existing = event.matchDetails?.playerStats?.find(s => s.playerId === player.id);
      acc[player.id] = existing?.minutesPlayed || 0;
      return acc;
    }, {} as Record<string, number>)
  );

  // UI State
  const [activeSection, setActiveSection] = useState<'score' | 'goals' | 'cards' | 'minutes'>('score');

  // Swipe to close gesture
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 300], [1, 0]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 150) {
      onClose();
    }
  };

  // Only coaches can access this form
  if (currentUser?.role !== 'coach') {
    return null;
  }

  const handleAddGoal = (playerId: string) => {
    setGoals([...goals, { playerId, minute: 1, assistedBy: undefined }]);
    setTeamScore(prev => prev + 1);
  };

  const handleRemoveGoal = (index: number) => {
    const newGoals = goals.filter((_, i) => i !== index);
    setGoals(newGoals);
    setTeamScore(Math.max(0, teamScore - 1));
  };

  const handleUpdateGoal = (index: number, field: 'minute' | 'assistedBy', value: number | string) => {
    const newGoals = [...goals];
    if (field === 'minute') {
      newGoals[index].minute = Number(value);
    } else {
      newGoals[index].assistedBy = value === '' ? undefined : String(value);
    }
    setGoals(newGoals);
  };

  const handleAddCard = (playerId: string, type: 'yellow' | 'red') => {
    setCards([...cards, { playerId, minute: 1, type }]);
  };

  const handleRemoveCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleUpdateCardMinute = (index: number, minute: number) => {
    const newCards = [...cards];
    newCards[index].minute = minute;
    setCards(newCards);
  };

  const handleUpdatePlayerMinutes = (playerId: string, minutes: number) => {
    setPlayerMinutes({ ...playerMinutes, [playerId]: Math.max(0, Math.min(90, minutes)) });
  };

  const handleSave = () => {
    // Calculate player stats
    const playerStats: PlayerMatchStats[] = teamPlayers.map(player => {
      const playerGoals = goals.filter(g => g.playerId === player.id).length;
      const playerAssists = goals.filter(g => g.assistedBy === player.id).length;
      const playerYellowCards = cards.filter(c => c.playerId === player.id && c.type === 'yellow').length;
      const playerRedCards = cards.filter(c => c.playerId === player.id && c.type === 'red').length;

      return {
        playerId: player.id,
        minutesPlayed: playerMinutes[player.id] || 0,
        goals: playerGoals,
        assists: playerAssists,
        yellowCards: playerYellowCards,
        redCards: playerRedCards,
      };
    });

    const matchData: MatchResultData = {
      score: { team: teamScore, opponent: opponentScore },
      goalScorers: goals,
      cards,
      playerStats,
    };

    onSave(matchData);
  };

  const getPlayerGoalCount = (playerId: string) => goals.filter(g => g.playerId === playerId).length;
  const getPlayerCardCount = (playerId: string, type: 'yellow' | 'red') =>
    cards.filter(c => c.playerId === playerId && c.type === type).length;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto pb-20"
      style={{ x, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 300 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
    >
      {/* Swipe Indicator */}
      <div className="absolute top-16 left-2 w-1 h-12 bg-muted-foreground/20 rounded-full pointer-events-none z-50" />

      <div className="space-y-4">
        {/* Header */}
        <NavigationHeader
          title="Adaugă Rezultat"
          subtitle={event.matchDetails?.opponent}
          onBack={onClose}
          variant="close"
          rightAction={
            <Button variant="ghost" size="icon" onClick={handleSave}>
              <Save className="w-5 h-5 text-primary" />
            </Button>
          }
        />

        <div className="p-4 space-y-4">

        {/* Match Info */}
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="text-center">
            <Badge variant="outline" className="mb-2 bg-red-100 text-red-800 border-red-200">
              Meci
            </Badge>
            <h3 className="mb-1">{event.title}</h3>
            <p className="text-sm text-muted-foreground">
              {event.matchDetails?.opponent} • {new Date(event.date).toLocaleDateString('ro-RO')}
            </p>
          </div>
        </Card>

        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'score', label: 'Scor', icon: Target },
            { id: 'goals', label: 'Goluri', icon: Target },
            { id: 'cards', label: 'Cartonașe', icon: AlertTriangle },
            { id: 'minutes', label: 'Minute', icon: Clock },
          ].map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSection(section.id as any)}
                className="flex-shrink-0"
              >
                <Icon className="w-4 h-4 mr-2" />
                {section.label}
              </Button>
            );
          })}
        </div>

        {/* SCORE SECTION */}
        {activeSection === 'score' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-6">
              <Label className="text-center block mb-4">Scor Final</Label>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Echipa</div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setTeamScore(Math.max(0, teamScore - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={teamScore}
                      onChange={(e) => setTeamScore(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 text-center text-3xl font-bold h-16"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setTeamScore(teamScore + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-2xl font-bold text-muted-foreground">-</div>

                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">{event.matchDetails?.opponent}</div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setOpponentScore(Math.max(0, opponentScore - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={opponentScore}
                      onChange={(e) => setOpponentScore(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 text-center text-3xl font-bold h-16"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setOpponentScore(opponentScore + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* GOALS SECTION */}
        {activeSection === 'goals' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-4">
              <h3 className="mb-3">Marcatori ({goals.length})</h3>

              {/* Existing Goals */}
              <div className="space-y-3 mb-4">
                {goals.map((goal, index) => {
                  const scorer = getPlayerById(goal.playerId);
                  return (
                    <Card key={index} className="p-3 bg-muted/50">
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-primary mt-1" />
                        <div className="flex-1 space-y-2">
                          <div className="font-medium">{scorer?.name}</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Minutul</Label>
                              <Input
                                type="number"
                                min="1"
                                max="90"
                                value={goal.minute}
                                onChange={(e) => handleUpdateGoal(index, 'minute', parseInt(e.target.value) || 1)}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Pasă de la</Label>
                              <select
                                value={goal.assistedBy || ''}
                                onChange={(e) => handleUpdateGoal(index, 'assistedBy', e.target.value)}
                                className="w-full h-8 px-2 border rounded-md text-sm"
                              >
                                <option value="">Fără asistență</option>
                                {teamPlayers
                                  .filter(p => p.id !== goal.playerId)
                                  .map(player => (
                                    <option key={player.id} value={player.id}>
                                      {player.name}
                                    </option>
                                  ))
                                }
                              </select>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveGoal(index)}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Add Goal - Player Selection */}
              <div className="space-y-2">
                <Label>Adaugă gol</Label>
                <div className="grid grid-cols-2 gap-2">
                  {teamPlayers.map(player => (
                    <Button
                      key={player.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddGoal(player.id)}
                      className="justify-start"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {player.name}
                      {getPlayerGoalCount(player.id) > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {getPlayerGoalCount(player.id)}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* CARDS SECTION */}
        {activeSection === 'cards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-4">
              <h3 className="mb-3">Cartonașe ({cards.length})</h3>

              {/* Existing Cards */}
              <div className="space-y-3 mb-4">
                {cards.map((card, index) => {
                  const player = getPlayerById(card.playerId);
                  return (
                    <Card key={index} className="p-3 bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-8 rounded ${card.type === 'yellow' ? 'bg-yellow-400' : 'bg-red-600'}`} />
                        <div className="flex-1">
                          <div className="font-medium">{player?.name}</div>
                          <div className="mt-1">
                            <Label className="text-xs">Minutul</Label>
                            <Input
                              type="number"
                              min="1"
                              max="90"
                              value={card.minute}
                              onChange={(e) => handleUpdateCardMinute(index, parseInt(e.target.value) || 1)}
                              className="h-8 w-20"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCard(index)}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Add Card */}
              <div className="space-y-3">
                <Label>Adaugă cartonaș galben</Label>
                <div className="grid grid-cols-2 gap-2">
                  {teamPlayers.map(player => (
                    <Button
                      key={player.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddCard(player.id, 'yellow')}
                      className="justify-start"
                    >
                      <div className="w-3 h-4 bg-yellow-400 rounded mr-2" />
                      {player.name}
                      {getPlayerCardCount(player.id, 'yellow') > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {getPlayerCardCount(player.id, 'yellow')}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>

                <Label className="mt-4 block">Adaugă cartonaș roșu</Label>
                <div className="grid grid-cols-2 gap-2">
                  {teamPlayers.map(player => (
                    <Button
                      key={player.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddCard(player.id, 'red')}
                      className="justify-start"
                    >
                      <div className="w-3 h-4 bg-red-600 rounded mr-2" />
                      {player.name}
                      {getPlayerCardCount(player.id, 'red') > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {getPlayerCardCount(player.id, 'red')}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* MINUTES PLAYED SECTION */}
        {activeSection === 'minutes' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3>Minute jucate</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const fullTime = teamPlayers.reduce((acc, player) => {
                      acc[player.id] = 90;
                      return acc;
                    }, {} as Record<string, number>);
                    setPlayerMinutes(fullTime);
                  }}
                >
                  Toți 90 min
                </Button>
              </div>

              <div className="space-y-3">
                {teamPlayers.map(player => (
                  <div key={player.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">{player.name}</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="range"
                          min="0"
                          max="90"
                          value={playerMinutes[player.id] || 0}
                          onChange={(e) => handleUpdatePlayerMinutes(player.id, parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          min="0"
                          max="90"
                          value={playerMinutes[player.id] || 0}
                          onChange={(e) => handleUpdatePlayerMinutes(player.id, parseInt(e.target.value) || 0)}
                          className="w-16 h-8 text-center"
                        />
                        <span className="text-sm text-muted-foreground w-8">min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Save Button (Sticky Bottom) */}
        <div className="p-4 sticky bottom-0 bg-background pt-4 pb-2">
          <Button className="w-full" size="lg" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvează rezultatul
          </Button>
        </div>
        </div>
      </div>
    </motion.div>
  );
}
