import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, DollarSign, Calendar as CalendarIcon, Tag, FileText } from 'lucide-react';
import { useFinanceStore } from '@/stores/financeStore';
import { Expense } from '@/types';
import './ExpenseModal.styles.css';

const expenseSchema = z.object({
  date: z.string().min(1, 'Выберите дату'),
  category: z.enum(['materials', 'software', 'advertising', 'office', 'other']),
  description: z.string().min(1, 'Введите описание расхода'),
  amount: z.number().min(1, 'Сумма должна быть больше 0'),
  receipt: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
}) => {
  const { addExpense, updateExpense } = useFinanceStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: 'materials',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (expense) {
      const expenseDate = new Date(expense.date);
      const formattedDate = expenseDate.toISOString().split('T')[0];
      
      reset({
        date: formattedDate,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        receipt: expense.receipt || '',
      });
    } else {
      reset({
        date: new Date().toISOString().split('T')[0],
        category: 'materials',
        description: '',
        amount: 0,
        receipt: '',
      });
    }
  }, [expense, reset]);

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      const expenseData = {
        ...data,
        date: new Date(data.date),
      };

      if (expense) {
        updateExpense(expense.id, expenseData);
      } else {
        addExpense(expenseData);
      }
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении расхода:', error);
    }
  };

  if (!isOpen) return null;

  const expenseCategories = [
    { value: 'materials', label: 'Материалы', icon: '📚' },
    { value: 'software', label: 'Софт', icon: '💻' },
    { value: 'advertising', label: 'Реклама', icon: '📢' },
    { value: 'office', label: 'Офис', icon: '🏢' },
    { value: 'other', label: 'Прочее', icon: '📦' },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'materials': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'software': return 'bg-green-100 text-green-800 border-green-200';
      case 'advertising': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'office': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto modal-content">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {expense ? 'Редактировать расход' : 'Добавить расход'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Дата */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <CalendarIcon size={16} />
              Дата расхода *
            </label>
            <input
              type="date"
              {...register('date')}
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field ${
                errors.date ? 'input-error' : ''
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          {/* Категория */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Tag size={16} />
              Категория *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {expenseCategories.map((category) => (
                <label
                  key={category.value}
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 has-checked:bg-primary-50 has-checked:border-primary-500 ${getCategoryColor(category.value)}`}
                >
                  <input
                    type="radio"
                    {...register('category')}
                    value={category.value}
                    className="sr-only"
                  />
                  <span className="text-lg mb-1">{category.icon}</span>
                  <span className="text-sm font-medium">{category.label}</span>
                </label>
              ))}
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Описание */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FileText size={16} />
              Описание *
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field ${
                errors.description ? 'input-error' : ''
              }`}
              placeholder="На что был потрачен бюджет?"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Сумма */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <DollarSign size={16} />
              Сумма (₽) *
            </label>
            <input
              type="number"
              {...register('amount', { valueAsNumber: true })}
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field ${
                errors.amount ? 'input-error' : ''
              }`}
              placeholder="0"
              min="1"
              step="100"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Чек/счет */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ссылка на чек или счет (URL)
            </label>
            <input
              type="url"
              {...register('receipt')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field"
              placeholder="https://example.com/receipt.jpg"
            />
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex-1 py-3 px-4"
            >
              {isSubmitting ? 'Сохранение...' : expense ? 'Сохранить изменения' : 'Добавить расход'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1 py-3 px-4"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};