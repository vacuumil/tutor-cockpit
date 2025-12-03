import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MaterialCategory, Problem, Theory, GeneratedVariant } from '@/types';
import { generateId, safeDate } from '@/lib/utils';

interface MaterialsState {
  categories: MaterialCategory[];
  problems: Problem[];
  theories: Theory[];
  variants: GeneratedVariant[];
  
  // Categories CRUD
  addCategory: (category: Omit<MaterialCategory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategory: (id: string, updates: Partial<Omit<MaterialCategory, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteCategory: (id: string) => void;
  getCategory: (id: string) => MaterialCategory | undefined;
  getCategoriesBySubject: (subject: 'math' | 'physics') => MaterialCategory[];
  getSubcategories: (parentId: string) => MaterialCategory[];
  
  // Problems CRUD
  addProblem: (problem: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProblem: (id: string, updates: Partial<Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteProblem: (id: string) => void;
  getProblem: (id: string) => Problem | undefined;
  getProblemsByCategory: (categoryId: string) => Problem[];
  searchProblems: (query: string, subject?: 'math' | 'physics') => Problem[];
  
  // Theories CRUD
  addTheory: (theory: Omit<Theory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTheory: (id: string, updates: Partial<Omit<Theory, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteTheory: (id: string) => void;
  getTheory: (id: string) => Theory | undefined;
  getTheoriesByCategory: (categoryId: string) => Theory[];
  
  // Variants
  addVariant: (variant: Omit<GeneratedVariant, 'id' | 'createdAt'>) => void;
  deleteVariant: (id: string) => void;
  generateVariant: (options: {
    subject: 'math' | 'physics';
    categoryIds?: string[];
    difficulty?: ('easy' | 'medium' | 'hard')[];
    count: number;
    name: string;
  }) => GeneratedVariant;
  
  // Helpers
  getCategoryTree: (subject: 'math' | 'physics') => Array<MaterialCategory & { children: MaterialCategory[] }>;
}

type PersistedState = MaterialsState;

export const useMaterialsStore = create<MaterialsState>()(
  persist(
    (set, get) => ({
      categories: [],
      problems: [],
      theories: [],
      variants: [],

      // Categories CRUD
      addCategory: (categoryData) => {
        const newCategory: MaterialCategory = {
          id: generateId(),
          ...categoryData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id
              ? { 
                  ...category, 
                  ...updates, 
                  updatedAt: new Date(),
                  createdAt: safeDate(category.createdAt),
                }
              : category
          ),
        }));
      },

      deleteCategory: (id) => {
        // Удаляем также все задачи и теорию этой категории
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
          problems: state.problems.filter((problem) => problem.categoryId !== id),
          theories: state.theories.filter((theory) => theory.categoryId !== id),
        }));
      },

      getCategory: (id) => {
        const category = get().categories.find((category) => category.id === id);
        if (!category) return undefined;
        
        return {
          ...category,
          createdAt: safeDate(category.createdAt),
          updatedAt: safeDate(category.updatedAt),
        };
      },

      getCategoriesBySubject: (subject) => {
        console.log('getCategoriesBySubject called with subject:', subject);
        console.log('Current categories:', get().categories);
        
        const filtered = get().categories
          .filter((category) => category.subject === subject && !category.parentId)
          .sort((a, b) => a.order - b.order)
          .map(category => ({
            ...category,
            createdAt: safeDate(category.createdAt),
            updatedAt: safeDate(category.updatedAt),
          }));
        
        console.log('Filtered categories:', filtered);
        return filtered;
      },

      getSubcategories: (parentId) => {
        return get().categories
          .filter((category) => category.parentId === parentId)
          .sort((a, b) => a.order - b.order)
          .map(category => ({
            ...category,
            createdAt: safeDate(category.createdAt),
            updatedAt: safeDate(category.updatedAt),
          }));
      },

      // Problems CRUD
      addProblem: (problemData) => {
        const newProblem: Problem = {
          id: generateId(),
          ...problemData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          problems: [...state.problems, newProblem],
        }));
      },

      updateProblem: (id, updates) => {
        set((state) => ({
          problems: state.problems.map((problem) =>
            problem.id === id
              ? { 
                  ...problem, 
                  ...updates, 
                  updatedAt: new Date(),
                  createdAt: safeDate(problem.createdAt),
                }
              : problem
          ),
        }));
      },

      deleteProblem: (id) => {
        set((state) => ({
          problems: state.problems.filter((problem) => problem.id !== id),
        }));
      },

      getProblem: (id) => {
        const problem = get().problems.find((problem) => problem.id === id);
        if (!problem) return undefined;
        
        return {
          ...problem,
          createdAt: safeDate(problem.createdAt),
          updatedAt: safeDate(problem.updatedAt),
        };
      },

      getProblemsByCategory: (categoryId) => {
        return get().problems
          .filter((problem) => problem.categoryId === categoryId)
          .sort((a, b) => a.difficulty.localeCompare(b.difficulty))
          .map(problem => ({
            ...problem,
            createdAt: safeDate(problem.createdAt),
            updatedAt: safeDate(problem.updatedAt),
          }));
      },

      searchProblems: (query, subject) => {
        const searchTerm = query.toLowerCase();
        return get().problems
          .filter((problem) => {
            const category = get().categories.find(c => c.id === problem.categoryId);
            const matchesQuery = 
              problem.question.toLowerCase().includes(searchTerm) ||
              problem.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            const matchesSubject = !subject || category?.subject === subject;
            return matchesQuery && matchesSubject;
          })
          .map(problem => ({
            ...problem,
            createdAt: safeDate(problem.createdAt),
            updatedAt: safeDate(problem.updatedAt),
          }));
      },

      // Theories CRUD
      addTheory: (theoryData) => {
        const newTheory: Theory = {
          id: generateId(),
          ...theoryData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          theories: [...state.theories, newTheory],
        }));
      },

      updateTheory: (id, updates) => {
        set((state) => ({
          theories: state.theories.map((theory) =>
            theory.id === id
              ? { 
                  ...theory, 
                  ...updates, 
                  updatedAt: new Date(),
                  createdAt: safeDate(theory.createdAt),
                }
              : theory
          ),
        }));
      },

      deleteTheory: (id) => {
        set((state) => ({
          theories: state.theories.filter((theory) => theory.id !== id),
        }));
      },

      getTheory: (id) => {
        const theory = get().theories.find((theory) => theory.id === id);
        if (!theory) return undefined;
        
        return {
          ...theory,
          createdAt: safeDate(theory.createdAt),
          updatedAt: safeDate(theory.updatedAt),
        };
      },

      getTheoriesByCategory: (categoryId) => {
        return get().theories
          .filter((theory) => theory.categoryId === categoryId)
          .map(theory => ({
            ...theory,
            createdAt: safeDate(theory.createdAt),
            updatedAt: safeDate(theory.updatedAt),
          }));
      },

      // Variants
      addVariant: (variantData) => {
        const newVariant: GeneratedVariant = {
          id: generateId(),
          ...variantData,
          createdAt: new Date(),
        };
        
        set((state) => ({
          variants: [...state.variants, newVariant],
        }));
      },

      deleteVariant: (id) => {
        set((state) => ({
          variants: state.variants.filter((variant) => variant.id !== id),
        }));
      },

      generateVariant: (options) => {
        const { subject, categoryIds, difficulty, count, name } = options;
        
        // Фильтруем задачи по критериям
        let filteredProblems = get().problems;
        
        if (subject) {
          const subjectCategories = get().categories.filter(c => c.subject === subject);
          const subjectCategoryIds = subjectCategories.map(c => c.id);
          filteredProblems = filteredProblems.filter(p => subjectCategoryIds.includes(p.categoryId));
        }
        
        if (categoryIds && categoryIds.length > 0) {
          filteredProblems = filteredProblems.filter(p => categoryIds.includes(p.categoryId));
        }
        
        if (difficulty && difficulty.length > 0) {
          filteredProblems = filteredProblems.filter(p => difficulty.includes(p.difficulty));
        }
        
        // Выбираем случайные задачи
        const selectedProblems = [...filteredProblems]
          .sort(() => Math.random() - 0.5)
          .slice(0, count);
        
        const newVariant: GeneratedVariant = {
          id: generateId(),
          name,
          subject,
          problems: selectedProblems,
          createdAt: new Date(),
        };
        
        set((state) => ({
          variants: [...state.variants, newVariant],
        }));
        
        return newVariant;
      },

      // Helpers
      getCategoryTree: (subject) => {
        const categories = get().categories.filter(c => c.subject === subject);
        const rootCategories = categories.filter(c => !c.parentId);
        
        return rootCategories
          .sort((a, b) => a.order - b.order)
          .map(rootCategory => ({
            ...rootCategory,
            createdAt: safeDate(rootCategory.createdAt),
            updatedAt: safeDate(rootCategory.updatedAt),
            children: categories
              .filter(c => c.parentId === rootCategory.id)
              .sort((a, b) => a.order - b.order)
              .map(child => ({
                ...child,
                createdAt: safeDate(child.createdAt),
                updatedAt: safeDate(child.updatedAt),
              })),
          }));
      },
    }),
    {
      name: 'materials-storage',
      migrate: (persistedState) => {
        const state = persistedState as PersistedState;
        
        if (state?.categories && Array.isArray(state.categories)) {
          state.categories = state.categories.map(category => ({
            ...category,
            createdAt: safeDate(category.createdAt),
            updatedAt: safeDate(category.updatedAt),
          }));
        }
        
        if (state?.problems && Array.isArray(state.problems)) {
          state.problems = state.problems.map(problem => ({
            ...problem,
            createdAt: safeDate(problem.createdAt),
            updatedAt: safeDate(problem.updatedAt),
          }));
        }
        
        if (state?.theories && Array.isArray(state.theories)) {
          state.theories = state.theories.map(theory => ({
            ...theory,
            createdAt: safeDate(theory.createdAt),
            updatedAt: safeDate(theory.updatedAt),
          }));
        }
        
        if (state?.variants && Array.isArray(state.variants)) {
          state.variants = state.variants.map(variant => ({
            ...variant,
            createdAt: safeDate(variant.createdAt),
            problems: variant.problems.map(problem => ({
              ...problem,
              createdAt: safeDate(problem.createdAt),
              updatedAt: safeDate(problem.updatedAt),
            })),
          }));
        }
        
        return state;
      },
    }
  )
);