export interface User {
  id: number;
  username?: string;
  email?: string;
  fullName?: string;
  avatarColor: string;
  totalCo2: number;
  totalWater: number;
  totalElectricity: number;
  externalId?: string;
  isAdmin?: boolean;
  profileImageUrl?: string;
}

export interface Activity {
  id: number;
  name: string;
  category: string;
  co2PerUnit: number;
  waterPerUnit: number;
  electricityPerUnit: number;
  unit: string;
  icon: string;
  description: string;
}

export interface UserActivity {
  id: number;
  userId: number;
  activityName: string;
  category: string;
  quantity: number;
  unit: string;
  co2Impact: number;
  waterImpact: number;
  electricityImpact: number;
  date: string;
}

export interface CreateUserActivityRequest {
  activityName: string;
  category: string;
  quantity: number;
  unit: string;
  co2Impact?: number;
  waterImpact?: number;
  electricityImpact?: number;
  date: string;
}

export interface Friendship {
  id: number;
  user: User;
  friend: User;
  status: string;
}

export interface Stats {
  co2: number;
  water: number;
  electricity: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  targetValue: number;
  targetType: string;
  specificActivity?: string;
  badgeColor: string;
  points: number;
  unlockedAt?: string;
  progress: number;
  isNew?: boolean;
  isUnlocked: boolean;
}

export interface FriendRequest {
  id: number;
  sender: User;
  receiver: User;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface League {
  id: number;
  name: string;
  description: string;
  leagueType: 'PUBLIC' | 'PRIVATE';
  host: User;
  startDate: string;
  endDate?: string;
  maxParticipants: number;
  isPermanent: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  isFull?: boolean;
  isUserMember?: boolean;
  currentMembers?: number;
}

export interface LeagueMember {
  id: number;
  league: League;
  user: User;
  score: number;
  rank: number;
  joinedAt: string;
  totalCo2?: number;
  totalWater?: number;
  totalElectricity?: number;
}

export interface CreateLeagueRequest {
  name: string;
  description: string;
  leagueType: 'PUBLIC' | 'PRIVATE';
  startDate: string;
  endDate?: string;
  maxParticipants: number;
  isPermanent: boolean;
}
