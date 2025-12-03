// src/modules/students/pages/StudentsPage.tsx
import React, { useState } from 'react';
import { Search, Edit2, Trash2, UserPlus } from 'lucide-react';
import { useStudentsStore } from '@/stores/studentsStore';
import { Student } from '@/types';
import { formatDate } from '@/lib/utils';
import { StudentModal } from '../components/StudentModal';
import './StudentsPage.styles.css';

export const StudentsPage: React.FC = () => {
  const { students, deleteStudent } = useStudentsStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.grade.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этого ученика?')) {
      deleteStudent(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(undefined);
  };

  const getSubjectLabel = (subject: Student['subject']) => {
    const labels = {
      math: 'Математика',
      physics: 'Физика',
      both: 'Математика + Физика',
    };
    return labels[subject];
  };

  const getSubjectBadgeClass = (subject: Student['subject']) => {
    switch (subject) {
      case 'math': return 'subject-badge subject-math';
      case 'physics': return 'subject-badge subject-physics';
      case 'both': return 'subject-badge subject-both';
      default: return 'subject-badge subject-math';
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ученики</h1>
          <p className="text-gray-600 mt-1">
            Всего учеников: <span className="font-semibold">{students.length}</span>
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary add-student-btn text-white px-5 py-2.5 rounded-lg flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <UserPlus size={20} />
          Добавить ученика
        </button>
      </div>

      {/* Поиск */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Поиск по имени или классу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Список учеников */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden students-table">
        {filteredStudents.length === 0 ? (
          <div className="empty-state text-center py-12 px-4">
            <div className="empty-state-icon inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-500 mb-4">
              <UserPlus size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {students.length === 0 ? 'Учеников пока нет' : 'Ничего не найдено'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {students.length === 0 
                ? 'Добавьте первого ученика, нажав кнопку выше'
                : 'Попробуйте изменить поисковый запрос'
              }
            </p>
            {students.length === 0 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary mt-4 bg-primary-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 mx-auto"
              >
                <UserPlus size={20} />
                Добавить первого ученика
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="table-header bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Имя</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Класс</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Предмет</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Цель</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Добавлен</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="table-row hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        {student.phone && (
                          <div className="text-sm text-gray-500 mt-1">{student.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="grade-badge inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {student.grade}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={getSubjectBadgeClass(student.subject)}>
                        {getSubjectLabel(student.subject)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{student.goal}</td>
                    <td className="py-4 px-6 text-gray-500 text-sm">
                      {formatDate(student.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="action-btn action-btn-edit p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="action-btn action-btn-delete p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальное окно */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        student={editingStudent}
      />
    </div>
  );
};