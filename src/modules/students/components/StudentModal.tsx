// src/modules/students/components/StudentModal.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useStudentsStore } from '@/stores/studentsStore';
import { Student } from '@/types';
import './StudentModal.styles.css';

const studentSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  grade: z.string().min(1, 'Укажите класс'),
  subject: z.enum(['math', 'physics', 'both']),
  goal: z.string().min(1, 'Укажите цель подготовки'),
  phone: z.string().optional(),
  email: z.string().email('Неверный формат email').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { addStudent, updateStudent } = useStudentsStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      subject: 'math',
    },
  });

  useEffect(() => {
    if (student) {
      reset({
        name: student.name,
        grade: student.grade,
        subject: student.subject,
        goal: student.goal,
        phone: student.phone || '',
        email: student.email || '',
        notes: student.notes || '',
      });
    } else {
      reset({
        name: '',
        grade: '',
        subject: 'math',
        goal: '',
        phone: '',
        email: '',
        notes: '',
      });
    }
  }, [student, reset]);

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (student) {
        updateStudent(student.id, data);
      } else {
        addStudent(data);
      }
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении ученика:', error);
    }
  };

  if (!isOpen) return null;

  const subjectOptions = [
    { value: 'math', label: 'Математика' },
    { value: 'physics', label: 'Физика' },
    { value: 'both', label: 'Математика + Физика' },
  ];

  const gradeOptions = [
    { value: '5 класс', label: '5 класс' },
    { value: '6 класс', label: '6 класс' },
    { value: '7 класс', label: '7 класс' },
    { value: '8 класс', label: '8 класс' },
    { value: '9 класс', label: '9 класс' },
    { value: '10 класс', label: '10 класс' },
    { value: '11 класс', label: '11 класс' },
    { value: '10-11 класс', label: '10-11 класс' },
    { value: 'Студент', label: 'Студент' },
  ];

  const goalOptions = [
    { value: 'Школьная программа', label: 'Школьная программа' },
    { value: 'Подготовка к ОГЭ', label: 'Подготовка к ОГЭ' },
    { value: 'Подготовка к ЕГЭ', label: 'Подготовка к ЕГЭ' },
    { value: 'Олимпиада', label: 'Олимпиада' },
    { value: 'Поступление в вуз', label: 'Поступление в вуз' },
    { value: 'Повышение успеваемости', label: 'Повышение успеваемости' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto modal-content">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {student ? 'Редактировать ученика' : 'Добавить ученика'}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ФИО ученика *
            </label>
            <input
              {...register('name')}
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field ${
                errors.name ? 'input-error' : ''
              }`}
              placeholder="Иванов Иван Иванович"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Класс *
            </label>
            <select
              {...register('grade')}
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field ${
                errors.grade ? 'input-error' : ''
              }`}
            >
              <option value="">Выберите класс...</option>
              {gradeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.grade && (
              <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Предмет *
            </label>
            <select
              {...register('subject')}
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field ${
                errors.subject ? 'input-error' : ''
              }`}
            >
              {subjectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Цель подготовки *
            </label>
            <select
              {...register('goal')}
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field ${
                errors.goal ? 'input-error' : ''
              }`}
            >
              <option value="">Выберите цель...</option>
              {goalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.goal && (
              <p className="mt-1 text-sm text-red-600">{errors.goal.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон
            </label>
            <input
              {...register('phone')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field"
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field ${
                errors.email ? 'input-error' : ''
              }`}
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Заметки
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent input-field"
              placeholder="Дополнительная информация об ученике..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex-1 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-medium transition-colors"
            >
              {isSubmitting ? 'Сохранение...' : student ? 'Сохранить изменения' : 'Добавить ученика'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-medium transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};