import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, DollarSign, Calendar as CalendarIcon, CreditCard, Wallet, Banknote } from 'lucide-react';
import { useFinanceStore } from '@/stores/financeStore';
import { useLessonsStore } from '@/stores/lessonsStore';
import { useStudentsStore } from '@/stores/studentsStore';
import { Payment } from '@/types';
import { formatDate } from '@/lib/utils';
import './PaymentModal.styles.css';

const paymentSchema = z.object({
  lessonId: z.string().min(1, 'Выберите занятие'),
  amount: z.number().min(1, 'Сумма должна быть больше 0'),
  date: z.string().min(1, 'Выберите дату'),
  method: z.enum(['cash', 'card', 'transfer']),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment?: Payment;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  payment,
}) => {
  const { addPayment, updatePayment } = useFinanceStore();
  const { lessons } = useLessonsStore();
  const { students } = useStudentsStore();
  
  // Вычисляем начальные значения
  const getInitialValues = useCallback(() => {
    if (payment) {
      const paymentDate = new Date(payment.date);
      const formattedDate = paymentDate.toISOString().split('T')[0];
      
      return {
        lessonId: payment.lessonId,
        amount: payment.amount,
        date: formattedDate,
        method: payment.method,
        notes: payment.notes || '',
      };
    } else {
      return {
        lessonId: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        method: 'cash' as const,
        notes: '',
      };
    }
  }, [payment]);

  const [formState, setFormState] = useState({
    selectedLessonId: payment?.lessonId || '',
    amount: payment?.amount || 0,
    values: getInitialValues(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: formState.values,
  });

  // Загружаем доступные занятия
  const availableLessons = lessons
    .filter(lesson => !lesson.paid && lesson.status === 'completed')
    .map(lesson => {
      const student = students.find(s => s.id === lesson.studentId);
      return {
        id: lesson.id,
        title: lesson.title,
        studentName: student?.name || 'Неизвестный ученик',
        price: lesson.price,
        date: lesson.date,
      };
    });

  // Обработчик выбора занятия
  const handleLessonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lessonId = e.target.value;
    setFormState(prev => ({ ...prev, selectedLessonId: lessonId }));
    
    if (lessonId) {
      const selectedLesson = lessons.find(lesson => lesson.id === lessonId);
      if (selectedLesson && selectedLesson.price > 0) {
        const lessonPrice = selectedLesson.price;
        setFormState(prev => ({ ...prev, amount: lessonPrice }));
        setValue('amount', lessonPrice);
      }
    } else {
      setFormState(prev => ({ ...prev, amount: 0 }));
      setValue('amount', 0);
    }
  };

  // Обработчик изменения суммы
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setFormState(prev => ({ ...prev, amount: value }));
    setValue('amount', value);
  };

  // Сбрасываем форму при изменении payment
  React.useEffect(() => {
    const newValues = getInitialValues();
    reset(newValues);
    setFormState({
      selectedLessonId: payment?.lessonId || '',
      amount: payment?.amount || 0,
      values: newValues,
    });
  }, [payment, reset, getInitialValues]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const paymentData = {
        ...data,
        date: new Date(data.date),
      };

      if (payment) {
        updatePayment(payment.id, paymentData);
      } else {
        addPayment(paymentData);
      }
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении оплаты:', error);
    }
  };

  if (!isOpen) return null;

  const paymentMethods = [
    { value: 'cash', label: 'Наличные', icon: Banknote },
    { value: 'card', label: 'Карта', icon: CreditCard },
    { value: 'transfer', label: 'Перевод', icon: Wallet },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto modal-content">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {payment ? 'Редактировать оплату' : 'Добавить оплату'}
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
          {/* Занятие */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">
              Занятие *
            </label>
            <select
              {...register('lessonId')}
              onChange={handleLessonChange}
              value={formState.selectedLessonId}
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field ${
                errors.lessonId ? 'input-error' : ''
              }`}
            >
              <option value="">Выберите занятие...</option>
              {availableLessons.map(lesson => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title} - {formatDate(lesson.date)} ({lesson.price} ₽)
                </option>
              ))}
              {availableLessons.length === 0 && (
                <option value="" disabled>
                  Нет доступных занятий для оплаты
                </option>
              )}
            </select>
            {errors.lessonId && (
              <p className="mt-1 text-sm text-red-600">{errors.lessonId.message}</p>
            )}
            {availableLessons.length === 0 && !payment && (
              <p className="mt-2 text-sm text-orange-600">
                Все занятия уже оплачены или не завершены
              </p>
            )}
          </div>

          {/* Сумма */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <DollarSign size={16} />
              Сумма (₽) *
            </label>
            <div className="relative">
              <input
                type="number"
                {...register('amount', { valueAsNumber: true })}
                value={formState.amount}
                onChange={handleAmountChange}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field ${
                  errors.amount ? 'input-error' : ''
                }`}
                placeholder="0"
                min="1"
                step="100"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₽
              </div>
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
            <div className="flex gap-2 mt-2">
              {[500, 1000, 1500, 2000].map(quickAmount => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => {
                    setFormState(prev => ({ ...prev, amount: quickAmount }));
                    setValue('amount', quickAmount);
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  {quickAmount} ₽
                </button>
              ))}
            </div>
          </div>

          {/* Дата */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <CalendarIcon size={16} />
              Дата оплаты *
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

          {/* Способ оплаты */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2">
              Способ оплаты *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.value}
                    className="flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 has-checked:bg-primary-50 has-checked:border-primary-500"
                  >
                    <input
                      type="radio"
                      {...register('method')}
                      value={method.value}
                      className="sr-only"
                    />
                    <Icon size={20} className="mb-1 text-gray-600" />
                    <span className="text-sm font-medium">{method.label}</span>
                  </label>
                );
              })}
            </div>
            {errors.method && (
              <p className="mt-1 text-sm text-red-600">{errors.method.message}</p>
            )}
          </div>

          {/* Заметки */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">
              Заметки
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field"
              placeholder="Дополнительная информация об оплате..."
            />
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || availableLessons.length === 0}
              className="btn btn-primary flex-1 py-3 px-4"
            >
              {isSubmitting ? 'Сохранение...' : payment ? 'Сохранить изменения' : 'Добавить оплату'}
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