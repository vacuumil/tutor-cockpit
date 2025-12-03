// src/types/index.ts
export type Student = {
  id: string;
  name: string;
  grade: string;
  subject: 'math' | 'physics' | 'both';
  goal: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Lesson = {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  price: number;
  paid: boolean;
  subject?: 'math' | 'physics';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Payment = {
  id: string;
  lessonId: string;
  amount: number;
  date: Date;
  method: 'cash' | 'card' | 'transfer';
  notes?: string; // ДОБАВЛЕНО
};

export type AppData = {
  students: Student[];
  lessons: Lesson[];
  payments: Payment[];
  version: string;
  notes?: string;
  createdAt?: Date; 
};

// Добавить к существующим типам:
export type FinancialStat = {
  period: string; // '2024-01', '2024-02', etc.
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  lessonsCompleted: number;
  studentsCount: number;
};

export type Expense = {
  id: string;
  date: Date;
  category: 'materials' | 'software' | 'advertising' | 'office' | 'other';
  description: string;
  amount: number;
  receipt?: string; // URL to receipt image
};

export type MaterialCategory = {
  id: string;
  name: string;
  subject: 'math' | 'physics';
  parentId?: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Problem = {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  solution?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points?: number;
  tags: string[];
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type Theory = {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  examples?: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type VariantTemplate = {
  id: string;
  name: string;
  subject: 'math' | 'physics';
  description?: string;
  problems: Array<{
    problemId: string;
    points: number;
  }>;
  totalPoints: number;
  timeLimit?: number; // в минутах
  createdAt: Date;
  updatedAt: Date;
};

export type GeneratedVariant = {
  id: string;
  name: string;
  subject: 'math' | 'physics';
  problems: Problem[];
  createdAt: Date;
};