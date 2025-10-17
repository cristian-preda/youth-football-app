// Core Types for Youth Football App

export type UserRole = 'coach' | 'director' | 'parent' | 'player';

export type EventType = 'training' | 'match';

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'pending' | 'excused';

export type PlayerPosition = 'Portar' | 'Fundaș' | 'Mijlocaș' | 'Atacant';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  clubId: string;
  teamId?: string; // For coach, player
  childrenIds?: string[]; // For parent
}

export interface Club {
  id: string;
  name: string;
  location: string;
  city: string;
  founded: number;
  teams: string[]; // Team IDs
  directorId: string;
}

export interface Team {
  id: string;
  name: string; // U7, U9, U11, etc.
  ageGroup: string;
  clubId: string;
  coachId: string;
  playerIds: string[];
  gender: 'boys' | 'girls' | 'mixed';
}

export interface Player {
  id: string;
  name: string;
  age: number;
  dateOfBirth: string;
  position: PlayerPosition;
  teamId: string;
  clubId: string;
  jerseyNumber?: number;
  parentIds: string[];
  stats: PlayerStats;
  medicalHistory: MedicalRecord[];
  avatar?: string;
}

export interface PlayerStats {
  goals: number;
  assists: number;
  minutesPlayed: number;
  matchesPlayed: number;
  yellowCards: number;
  redCards: number;
  cleanSheets?: number; // For goalkeepers
}

export interface MedicalRecord {
  id: string;
  playerId: string;
  date: string;
  type: 'injury' | 'illness' | 'medical_check' | 'recovery';
  description: string;
  severity?: 'low' | 'medium' | 'high';
  recoveryDate?: string;
  notes?: string;
}

export interface Event {
  id: string;
  type: EventType;
  title: string;
  date: string; // ISO string
  startTime: string; // HH:mm
  duration: number; // minutes
  location: string;
  address?: string;
  teamId: string;
  clubId: string;
  createdBy: string; // User ID
  attendance: AttendanceRecord[];
  matchDetails?: MatchDetails;
  notes?: string;
  notificationSent: boolean;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  playerId: string;
  status: AttendanceStatus;
  checkInTime?: string;
  markedBy?: string; // User ID
  excuseReason?: string;
  excusedBy?: string; // Parent User ID
  createdAt: string;
  updatedAt: string;
}

export interface MatchDetails {
  opponent: string;
  isHome: boolean;
  score?: {
    team: number;
    opponent: number;
  };
  lineup?: string[]; // Player IDs
  substitutions?: Substitution[];
  goalScorers?: GoalScorer[];
  assists?: string[]; // Player IDs
  result?: 'win' | 'draw' | 'loss';
  cards?: Card[]; // Yellow and red cards
  playerStats?: PlayerMatchStats[]; // Detailed stats per player
}

export interface Substitution {
  playerOut: string; // Player ID
  playerIn: string; // Player ID
  minute: number;
}

export interface GoalScorer {
  playerId: string;
  minute: number;
  assistedBy?: string; // Player ID
}

export interface Card {
  playerId: string;
  minute: number;
  type: 'yellow' | 'red';
}

export interface PlayerMatchStats {
  playerId: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

export interface Message {
  id: string;
  from: string; // User ID
  to: string[]; // User IDs
  content: string;
  timestamp: string;
  chatId: string;
  read: boolean;
  type: 'direct' | 'group_announcement';
}

export interface Chat {
  id: string;
  name: string;
  type: 'group' | 'direct';
  participants: string[]; // User IDs
  teamId?: string;
  clubId?: string;
  lastMessage?: Message;
  pinned: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'event_reminder' | 'event_change' | 'attendance_marked' | 'message' | 'stat_update';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// News & Feed Types
export type NewsPostType = 'match_result' | 'announcement' | 'training_update' | 'player_highlight';

export interface NewsPost {
  id: string;
  type: NewsPostType;
  title: string;
  content: string;
  imageUrl?: string;
  clubId: string;
  teamId?: string; // Optional: specific team or club-wide
  createdBy: string; // User ID
  createdAt: string;
  eventId?: string; // Link to event if match result
  likes?: string[]; // User IDs who liked (future)
  pinned?: boolean;
}

// League/Standings Types
export interface TeamStanding {
  teamId: string;
  teamName: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface LeagueStandings {
  id: string;
  leagueName: string;
  season: string;
  ageGroup: string;
  standings: TeamStanding[];
  lastUpdated: string;
}

// Parent Attendance Confirmation
export interface AttendanceConfirmationStatus {
  eventId: string;
  playerId: string;
  parentId: string;
  status: 'confirmed' | 'declined' | 'late' | 'pending';
  confirmedAt?: string;
  notes?: string;
}

// UI State Types
export interface DashboardData {
  user: User;
  stats: Record<string, any>;
  upcomingEvents: Event[];
  recentActivity: any[];
}
