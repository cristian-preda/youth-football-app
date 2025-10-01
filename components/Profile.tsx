import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { LogOut, Users, Trophy, Mail, Phone } from 'lucide-react';
import { getTeamById, getPlayersByTeamId, clubs } from '../data/mockData';

export function Profile() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  const team = currentUser.teamId ? getTeamById(currentUser.teamId) : null;
  const teamPlayers = team ? getPlayersByTeamId(team.id) : [];
  const club = clubs.find(c => c.id === currentUser.clubId);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'coach':
        return 'Antrenor';
      case 'director':
        return 'Director';
      case 'parent':
        return 'Părinte';
      case 'player':
        return 'Jucător';
      default:
        return role;
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1>Profil</h1>
        <p className="text-muted-foreground">Informații personale și setări</p>
      </div>

      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="mb-1">{currentUser.name}</h2>
            <Badge variant="secondary" className="mb-2">
              {getRoleLabel(currentUser.role)}
            </Badge>
            {team && (
              <p className="text-sm text-muted-foreground">
                Echipa {team.name}
              </p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div>
              <span className="text-muted-foreground">Email: </span>
              <span className="font-medium">{currentUser.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <div>
              <span className="text-muted-foreground">Telefon: </span>
              <span className="font-medium">{currentUser.phone}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Team Info for Coaches */}
      {currentUser.role === 'coach' && team && (
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3>Informații echipă</h3>
              <p className="text-sm text-muted-foreground">{club?.name}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Echipa:</span>
              <span className="font-medium">{team.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Număr jucători:</span>
              <span className="font-medium">{teamPlayers.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Categorie:</span>
              <span className="font-medium">{team.ageGroup}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Locație:</span>
              <span className="font-medium">{club?.city}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Club Info */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Users className="w-5 h-5 text-primary" />
          <h3>Club</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Nume:</span>
            <span className="font-medium">{club?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Oraș:</span>
            <span className="font-medium">{club?.city}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Locație:</span>
            <span className="font-medium text-right">{club?.location}</span>
          </div>
        </div>
      </Card>

      {/* Logout */}
      <Card className="p-4">
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Deconectare
        </Button>
      </Card>

      {/* App Info */}
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>Youth Football App v1.0.0</p>
        <p>© 2025 {club?.name}. Toate drepturile rezervate.</p>
      </div>
    </div>
  );
}