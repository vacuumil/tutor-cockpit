import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useMaterialsStore } from '@/stores/materialsStore';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: 'math' | 'physics';
  parentId?: string;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  subject,
  parentId,
}) => {
  const { categories, addCategory } = useMaterialsStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Введите название категории');
      return;
    }

    const categoryData = {
      name: name.trim(),
      subject,
      parentId: parentId || undefined,
      description: description.trim() || undefined,
      order: categories.filter(c => c.subject === subject && c.parentId === parentId).length + 1,
    };

    addCategory(categoryData);
    
    setName('');
    setDescription('');
    onClose();
    
    // Принудительно обновляем состояние
    setTimeout(() => {
      // Это заставит компоненты перерендериться с новыми данными
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              {parentId ? 'Добавить подкатегорию' : 'Добавить категорию'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Введите название категории"
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание (опционально)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Введите описание категории"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary px-4 py-2"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};