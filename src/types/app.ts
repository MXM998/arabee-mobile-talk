export interface Student {
  id: string;
  name: string;
  phone: string;
  points: number;
  levelId: string;
}

export interface Level {
  id: string;
  name: string;
  sessionsCount: number;
  students: Student[];
}

export interface Batch {
  id: string;
  name: string;
  number: number;
  levels: Level[];
  createdAt: Date;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  levelId: string;
  completed: boolean;
}

export type PointType = 'creative' | 'good' | 'none';

export interface PointsUpdate {
  studentId: string;
  points: number;
  type: PointType;
  sessionId?: string;
  timestamp: Date;
}