import React, { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Clock, Calendar as CalendarIcon, User, DollarSign } from 'lucide-react';
import { useLessonsStore } from '@/stores/lessonsStore';
import { useStudentsStore } from '@/stores/studentsStore';
import { Lesson, Student } from '@/types';
import { addMinutesToTime, generateTimeSlots } from '@/lib/utils';
import './LessonModal.styles.css';

const lessonSchema = z.object({
  studentId: z.string().min(1, 'Выберите ученика'),
  title: z.string().min(2, 'Введите название занятия'),
  description: z.string().optional(),
  date: z.string().min(1, 'Выберите дату'),
  startTime: z.string().min(1, 'Выберите время начала'),
  endTime: z.string().min(1, 'Выберите время окончания'),
  duration: z.number().min(30, 'Минимальная продолжительность - 30 минут'),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
  price: z.number().min(0, 'Цена не может быть отрицательной'),
  paid: z.boolean(),
  subject: z.enum(['math', 'physics']).optional(),
  notes: z.string().optional(),
});

type LessonFormData = z.infer<typeof lessonSchema>;

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson?: Lesson;
  selectedDate?: Date | null;
  selectedTime?: string | null;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  onClose,
  lesson,
  selectedDate,
  selectedTime,
}) => {
  const { addLesson, updateLesson } = useLessonsStore();
  const { students } = useStudentsStore();
  
  const timeSlots = generateTimeSlots();

  // Вычисляем начальные значения с useMemo
    const initialValues = useMemo(() => {
    if (lesson) {
        const lessonDate = new Date(lesson.date);
        const formattedDate = lessonDate.toISOString().split('T')[0];
        
        return {
        studentId: lesson.studentId,
        title: lesson.title,
        description: lesson.description || '',
        date: formattedDate,
        startTime: lesson.startTime,
        endTime: lesson.endTime,
        duration: lesson.duration,
        status: lesson.status as 'scheduled' | 'completed' | 'cancelled', // ЯВНОЕ ПРИВЕДЕНИЕ ТИПА
        price: lesson.price,
        paid: lesson.paid,
        subject: lesson.subject || 'math',
        notes: lesson.notes || '',
        };
    } else {
        const today = new Date().toISOString().split('T')[0];
        const defaultDate = selectedDate 
        ? selectedDate.toISOString().split('T')[0]
        : today;
        
        const defaultStartTime = selectedTime || '14:00';
        const defaultEndTime = selectedTime ? addMinutesToTime(selectedTime, 60) : '15:00';
        
        return {
        studentId: '',
        title: '',
        description: '',
        date: defaultDate,
        startTime: defaultStartTime,
        endTime: defaultEndTime,
        duration: 60,
        status: 'scheduled' as const, // КОНСТАНТНЫЙ ТИП
        price: 0,
        paid: false,
        subject: 'math' as const,
        notes: '',
        };
    }
    }, [lesson, selectedDate, selectedTime]);

  // Локальное состояние для времени и продолжительности
  const [localState, setLocalState] = useState({
    startTime: initialValues.startTime,
    endTime: initialValues.endTime,
    duration: initialValues.duration,
  });

  // Обновляем локальное состояние при изменении initialValues
  React.useEffect(() => {
    setLocalState({
      startTime: initialValues.startTime,
      endTime: initialValues.endTime,
      duration: initialValues.duration,
    });
  }, [initialValues]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: initialValues,
  });

  // Обновляем форму при изменении initialValues
  React.useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  // Обработчики изменений
  const handleStartTimeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStartTime = e.target.value;
    const newDuration = localState.duration;
    const newEndTime = addMinutesToTime(newStartTime, newDuration);
    
    setLocalState(prev => ({
      ...prev,
      startTime: newStartTime,
      endTime: newEndTime,
    }));
    
    setValue('startTime', newStartTime);
    setValue('endTime', newEndTime);
  }, [localState.duration, setValue]);

  const handleDurationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDuration = parseInt(e.target.value);
    const newEndTime = addMinutesToTime(localState.startTime, newDuration);
    
    setLocalState(prev => ({
      ...prev,
      duration: newDuration,
      endTime: newEndTime,
    }));
    
    setValue('duration', newDuration);
    setValue('endTime', newEndTime);
  }, [localState.startTime, setValue]);

    const onSubmit = async (data: LessonFormData) => {
    try {
        const lessonData = {
        ...data,
        date: new Date(data.date),
        duration: localState.duration,
        status: data.status as 'scheduled' | 'completed' | 'cancelled', // ЯВНОЕ ПРИВЕДЕНИЕ
        subject: data.subject as 'math' | 'physics', // ЯВНОЕ ПРИВЕДЕНИЕ
        };

        if (lesson) {
        updateLesson(lesson.id, lessonData);
        } else {
        addLesson(lessonData);
        }
        onClose();
    } catch (error) {
        console.error('Ошибка при сохранении занятия:', error);
    }
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-content">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {lesson ? 'Редактировать занятие' : 'Добавить занятие'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ученик */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <User size={16} />
                Ученик *
              </label>
              <select
                {...register('studentId')}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field ${
                  errors.studentId ? 'input-error' : ''
                }`}
              >
                <option value="">Выберите ученика...</option>
                {students.map((student: Student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.grade}, {student.subject === 'math' ? 'Математика' : student.subject === 'physics' ? 'Физика' : 'Оба предмета'})
                  </option>
                ))}
              </select>
              {errors.studentId && (
                <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
              )}
            </div>

            {/* Название */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">
                Название занятия *
              </label>
              <input
                {...register('title')}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field ${
                  errors.title ? 'input-error' : ''
                }`}
                placeholder="Тема занятия"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Дата */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <CalendarIcon size={16} />
                Дата *
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

            {/* Предмет */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">
                Предмет
              </label>
              <select
                {...register('subject')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field"
              >
                <option value="math">Математика</option>
                <option value="physics">Физика</option>
              </select>
            </div>

            {/* Время начала */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Clock size={16} />
                Время начала *
              </label>
              <select
                {...register('startTime')}
                onChange={handleStartTimeChange}
                value={localState.startTime}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field ${
                  errors.startTime ? 'input-error' : ''
                }`}
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
              )}
            </div>

            {/* Продолжительность */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">
                Продолжительность
              </label>
              <div className="flex items-center gap-4">
                <select
                  value={localState.duration}
                  onChange={handleDurationChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field"
                >
                  <option value={30}>30 минут</option>
                  <option value={60}>1 час</option>
                  <option value={90}>1.5 часа</option>
                  <option value={120}>2 часа</option>
                  <option value={150}>2.5 часа</option>
                  <option value={180}>3 часа</option>
                </select>
                <div className="text-sm text-gray-600 whitespace-nowrap">
                  До {localState.endTime}
                </div>
              </div>
            </div>

            {/* Цена */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <DollarSign size={16} />
                Цена (₽)
              </label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field ${
                  errors.price ? 'input-error' : ''
                }`}
                placeholder="0"
                min="0"
                step="100"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            {/* Статус */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field"
              >
                <option value="scheduled">Запланировано</option>
                <option value="completed">Проведено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>
          </div>

          {/* Описание */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field"
              placeholder="Описание занятия"
            />
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
              placeholder="Дополнительные заметки"
            />
          </div>

          {/* Оплачено чекбокс */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('paid')}
              id="paid"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="paid" className="ml-2 text-sm text-gray-700">
              Занятие оплачено
            </label>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex-1 py-3 px-4"
            >
              {isSubmitting ? 'Сохранение...' : lesson ? 'Сохранить изменения' : 'Добавить занятие'}
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