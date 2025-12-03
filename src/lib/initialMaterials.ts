import { MaterialCategory } from '@/types';
import { generateId } from './utils';

export const initialMathCategories: Omit<MaterialCategory, 'createdAt' | 'updatedAt'>[] = [
  {
    id: generateId(),
    name: 'Алгебра',
    subject: 'math',
    order: 1,
  },
  {
    id: generateId(),
    name: 'Уравнения',
    subject: 'math',
    order: 2,
    parentId: '', // Будет заменено на ID алгебры
  },
  {
    id: generateId(),
    name: 'Неравенства',
    subject: 'math',
    order: 3,
    parentId: '', // Будет заменено на ID алгебры
  },
  {
    id: generateId(),
    name: 'Геометрия',
    subject: 'math',
    order: 4,
  },
  {
    id: generateId(),
    name: 'Планиметрия',
    subject: 'math',
    order: 5,
    parentId: '', // Будет заменено на ID геометрии
  },
  {
    id: generateId(),
    name: 'Стереометрия',
    subject: 'math',
    order: 6,
    parentId: '', // Будет заменено на ID геометрии
  },
];

export const initialPhysicsCategories: Omit<MaterialCategory, 'createdAt' | 'updatedAt'>[] = [
  {
    id: generateId(),
    name: 'Механика',
    subject: 'physics',
    order: 1,
  },
  {
    id: generateId(),
    name: 'Кинематика',
    subject: 'physics',
    order: 2,
    parentId: '', // Будет заменено на ID механики
  },
  {
    id: generateId(),
    name: 'Динамика',
    subject: 'physics',
    order: 3,
    parentId: '', // Будет заменено на ID механики
  },
  {
    id: generateId(),
    name: 'Электричество',
    subject: 'physics',
    order: 4,
  },
  {
    id: generateId(),
    name: 'Оптика',
    subject: 'physics',
    order: 5,
  },
];

export const initialProblems = [
  {
    categoryId: '', // Будет заменено
    question: 'Решите уравнение: 2x + 5 = 15',
    answer: 'x = 5',
    solution: '2x = 15 - 5 = 10; x = 10 / 2 = 5',
    difficulty: 'easy' as const,
    points: 1,
    tags: ['уравнения', 'алгебра'],
  },
  {
    categoryId: '', // Будет заменено
    question: 'Найдите площадь прямоугольника со сторонами 5 см и 8 см',
    answer: '40 см²',
    solution: 'S = a * b = 5 * 8 = 40',
    difficulty: 'easy' as const,
    points: 1,
    tags: ['геометрия', 'площадь'],
  },
  {
    categoryId: '', // Будет заменено
    question: 'Тело движется по закону s(t) = 3t² + 2t. Найдите скорость в момент t=2',
    answer: '14 м/с',
    solution: 'v(t) = s\'(t) = 6t + 2; v(2) = 6*2 + 2 = 14',
    difficulty: 'medium' as const,
    points: 2,
    tags: ['физика', 'кинематика', 'производная'],
  },
];