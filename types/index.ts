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

// UI State Types
export interface DashboardData {
  user: User;
  stats: Record<string, any>;
  upcomingEvents: Event[];
  recentActivity: any[];
}
