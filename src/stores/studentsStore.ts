// src/stores/studentsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Student } from '@/types';
import { generateId, safeDate } from '@/lib/utils';

interface StudentsState {
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStudent: (id: string, updates: Partial<Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteStudent: (id: string) => void;
  getStudent: (id: string) => Student | undefined;
}

// Тип для персистентного состояния
type PersistedState = StudentsState;

export const useStudentsStore = create<StudentsState>()(
  persist(
    (set, get) => ({
      students: [],

      addStudent: (studentData) => {
        const newStudent: Student = {
          id: generateId(),
          ...studentData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          students: [...state.students, newStudent],
        }));
      },

      updateStudent: (id, updates) => {
        set((state) => ({
          students: state.students.map((student) =>
            student.id === id
              ? { 
                  ...student, 
                  ...updates, 
                  updatedAt: new Date(),
                  createdAt: safeDate(student.createdAt),
                }
              : student
          ),
        }));
      },

      deleteStudent: (id) => {
        set((state) => ({
          students: state.students.filter((student) => student.id !== id),
        }));
      },

      getStudent: (id) => {
        const student = get().students.find((student) => student.id === id);
        if (!student) return undefined;
        
        return {
          ...student,
          createdAt: safeDate(student.createdAt),
          updatedAt: safeDate(student.updatedAt),
        };
      },
    }),
    {
      name: 'students-storage',
      migrate: (persistedState) => {
        const state = persistedState as PersistedState;
        
        if (state?.students && Array.isArray(state.students)) {
          state.students = state.students.map(student => ({
            ...student,
            createdAt: safeDate(student.createdAt),
            updatedAt: safeDate(student.updatedAt),
          }));
        }
        
        return state;
      },
    }
  )
);