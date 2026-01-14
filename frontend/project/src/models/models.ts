export interface User {
  id: number;
  externalId: string;  // Keycloak user ID (sub claim)
  avatarColor: string;
  profileImageUrl?: string;
  biography?: string;
  hasSolarPanels?: boolean;
  hasHeatPump?: boolean;
  totalCo2: number;
  totalWater: number;
  totalElectricity: number;
  // Optional profile fields (from Keycloak token)
  username?: string;
  email?: string;
  fullName?: string;
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
  isNew: boolean;
  isUnlocked: boolean;
}
