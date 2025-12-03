// src/stores/lessonsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Lesson } from '@/types';
import { generateId, safeDate } from '@/lib/utils';

interface LessonsState {
  lessons: Lesson[];
  addLesson: (lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLesson: (id: string, updates: Partial<Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteLesson: (id: string) => void;
  getLesson: (id: string) => Lesson | undefined;
  getLessonsByStudent: (studentId: string) => Lesson[];
  getLessonsByDate: (date: Date) => Lesson[];
}

type PersistedState = LessonsState;

export const useLessonsStore = create<LessonsState>()(
  persist(
    (set, get) => ({
      lessons: [],

      addLesson: (lessonData) => {
        const newLesson: Lesson = {
          id: generateId(),
          ...lessonData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          lessons: [...state.lessons, newLesson],
        }));
      },

      updateLesson: (id, updates) => {
        set((state) => ({
          lessons: state.lessons.map((lesson) =>
            lesson.id === id
              ? { 
                  ...lesson, 
                  ...updates, 
                  updatedAt: new Date(),
                  createdAt: safeDate(lesson.createdAt),
                  date: safeDate(lesson.date),
                }
              : lesson
          ),
        }));
      },

      deleteLesson: (id) => {
        set((state) => ({
          lessons: state.lessons.filter((lesson) => lesson.id !== id),
        }));
      },

      getLesson: (id) => {
        const lesson = get().lessons.find((lesson) => lesson.id === id);
        if (!lesson) return undefined;
        
        return {
          ...lesson,
          createdAt: safeDate(lesson.createdAt),
          updatedAt: safeDate(lesson.updatedAt),
          date: safeDate(lesson.date),
        };
      },

      getLessonsByStudent: (studentId) => {
        return get().lessons
          .filter((lesson) => lesson.studentId === studentId)
          .map(lesson => ({
            ...lesson,
            createdAt: safeDate(lesson.createdAt),
            updatedAt: safeDate(lesson.updatedAt),
            date: safeDate(lesson.date),
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },

      getLessonsByDate: (date) => {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);
        
        return get().lessons
          .filter((lesson) => {
            const lessonDate = new Date(lesson.date);
            return lessonDate >= targetDate && lessonDate < nextDate;
          })
          .map(lesson => ({
            ...lesson,
            createdAt: safeDate(lesson.createdAt),
            updatedAt: safeDate(lesson.updatedAt),
            date: safeDate(lesson.date),
          }))
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
      },
    }),
    {
      name: 'lessons-storage',
      migrate: (persistedState) => {
        const state = persistedState as PersistedState;
        
        if (state?.lessons && Array.isArray(state.lessons)) {
          state.lessons = state.lessons.map(lesson => ({
            ...lesson,
            createdAt: safeDate(lesson.createdAt),
            updatedAt: safeDate(lesson.updatedAt),
            date: safeDate(lesson.date),
          }));
        }
        
        return state;
      },
    }
  )
);