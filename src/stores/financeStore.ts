import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Payment, Expense, FinancialStat } from '@/types';
import { generateId, safeDate } from '@/lib/utils';
import { useLessonsStore } from './lessonsStore';

interface FinanceState {
  payments: Payment[];
  expenses: Expense[];
  financialStats: FinancialStat[];
  
  // Payments
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, updates: Partial<Omit<Payment, 'id'>>) => void;
  deletePayment: (id: string) => void;
  
  // Expenses
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id'>>) => void;
  deleteExpense: (id: string) => void;
  
  // Statistics
  calculateMonthlyStats: (month: string) => FinancialStat;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getProfit: () => number;
  
  // Helpers
  getPaymentsByMonth: (month: string) => Payment[];
  getExpensesByMonth: (month: string) => Expense[];
}

type PersistedState = FinanceState;

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      payments: [],
      expenses: [],
      financialStats: [],

      // Payments CRUD
      addPayment: (paymentData) => {
        const newPayment: Payment = {
          id: generateId(),
          ...paymentData,
        };
        
        // Автоматически помечаем занятие как оплаченное
        try {
          const lessonStore = useLessonsStore.getState();
          lessonStore.updateLesson(paymentData.lessonId, { 
            paid: true,
            status: 'completed'
          });
        } catch (error) {
          console.error('Ошибка при обновлении статуса занятия:', error);
        }
        
        set((state) => ({
          payments: [...state.payments, newPayment],
        }));
      },

      updatePayment: (id, updates) => {
        set((state) => ({
          payments: state.payments.map((payment) =>
            payment.id === id
              ? { 
                  ...payment, 
                  ...updates,
                  date: updates.date ? safeDate(updates.date) : payment.date,
                }
              : payment
          ),
        }));
      },

      deletePayment: (id) => {
        set((state) => ({
          payments: state.payments.filter((payment) => payment.id !== id),
        }));
      },

      // Expenses CRUD
      addExpense: (expenseData) => {
        const newExpense: Expense = {
          id: generateId(),
          ...expenseData,
        };
        
        set((state) => ({
          expenses: [...state.expenses, newExpense],
        }));
      },

      updateExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id
              ? { 
                  ...expense, 
                  ...updates,
                  date: updates.date ? safeDate(updates.date) : expense.date,
                }
              : expense
          ),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }));
      },

      // Statistics
      calculateMonthlyStats: (month) => {
        const payments = get().getPaymentsByMonth(month);
        const expenses = get().getExpensesByMonth(month);
        
        const totalIncome = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        return {
          period: month,
          totalIncome,
          totalExpenses,
          profit: totalIncome - totalExpenses,
          lessonsCompleted: payments.length,
          studentsCount: new Set(payments.map(p => p.lessonId)).size,
        };
      },

      getTotalIncome: () => {
        return get().payments.reduce((sum, payment) => sum + payment.amount, 0);
      },

      getTotalExpenses: () => {
        return get().expenses.reduce((sum, expense) => sum + expense.amount, 0);
      },

      getProfit: () => {
        return get().getTotalIncome() - get().getTotalExpenses();
      },

      // Helpers
      getPaymentsByMonth: (month) => {
        return get().payments.filter((payment) => {
          const paymentDate = new Date(payment.date);
          const paymentMonth = `${paymentDate.getFullYear()}-${(paymentDate.getMonth() + 1).toString().padStart(2, '0')}`;
          return paymentMonth === month;
        });
      },

      getExpensesByMonth: (month) => {
        return get().expenses.filter((expense) => {
          const expenseDate = new Date(expense.date);
          const expenseMonth = `${expenseDate.getFullYear()}-${(expenseDate.getMonth() + 1).toString().padStart(2, '0')}`;
          return expenseMonth === month;
        });
      },
    }),
    {
      name: 'finance-storage',
      migrate: (persistedState) => {
        const state = persistedState as PersistedState;
        
        if (state?.payments && Array.isArray(state.payments)) {
          state.payments = state.payments.map(payment => ({
            ...payment,
            date: safeDate(payment.date),
          }));
        }
        
        if (state?.expenses && Array.isArray(state.expenses)) {
          state.expenses = state.expenses.map(expense => ({
            ...expense,
            date: safeDate(expense.date),
          }));
        }
        
        return state;
      },
    }
  )
);