// src/lib/utils.ts
import { Lesson } from '@/types';

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatDate(date: Date | string | number): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Дата не указана';
    }
    
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
  } catch {
    return 'Дата не указана';
  }
}

export function formatDateTime(date: Date | string | number): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Дата не указана';
    }
    
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch {
    return 'Дата не указана';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Новая функция для безопасного создания даты
export function safeDate(date: Date | string | number | undefined): Date {
  if (!date) return new Date();
  
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    if (isNaN(dateObj.getTime())) {
      return new Date();
    }
    
    return dateObj;
  } catch {
    return new Date();
  }
}

// Функции для работы со временем
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}

export function calculateDuration(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;
  
  return endTotal - startTotal;
}

export function timeToDate(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

export function getTimeFromDate(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

export function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

// Генерация временных слотов
export function generateTimeSlots(startHour: number = 8, endHour: number = 22, interval: number = 30): string[] {
  const slots: string[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }
  
  return slots;
}

// Форматирование для календаря
export function lessonToCalendarEvent(lesson: Lesson, studentName: string) {
  const start = timeToDate(lesson.date, lesson.startTime);
  const end = timeToDate(lesson.date, lesson.endTime);
  
  return {
    id: lesson.id,
    title: `${studentName} - ${lesson.subject || 'Занятие'}`,
    start,
    end,
    resource: {
      lesson,
      studentName,
    },
  };
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

export function getMonthName(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  const date = new Date(year, monthNum - 1, 1);
  return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

export function generateMonths(startMonth: string, count: number = 12): string[] {
  const [startYear, startMonthNum] = startMonth.split('-').map(Number);
  const months: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startYear, startMonthNum - 1 + i, 1);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    months.push(`${year}-${month}`);
  }
  
  return months;
}

export function roundToNearest(value: number, step: number = 100): number {
  return Math.round(value / step) * step;
}

export function formatAmountInput(value: string): number {
  const num = parseInt(value.replace(/\D/g, '')) || 0;
  return roundToNearest(num, 100);
}