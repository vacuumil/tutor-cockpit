import React, { useState } from 'react';
import { 
  BookOpen, 
  Save, 
  X, 
  Plus, 
  Trash2,
  ChevronDown,
  ChevronRight,
  Edit2
} from 'lucide-react';
import { useMaterialsStore } from '@/stores/materialsStore';
import { Theory } from '@/types';

interface TheoryEditorProps {
  subject: 'math' | 'physics';
  selectedCategoryId: string | null;
}

export const TheoryEditor: React.FC<TheoryEditorProps> = ({
  subject,
  selectedCategoryId,
}) => {
  const { 
    categories, 
    theories, 
    addTheory, 
    updateTheory, 
    deleteTheory,
    getTheoriesByCategory 
  } = useMaterialsStore();
  
  const [activeTheoryId, setActiveTheoryId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [examples, setExamples] = useState<string[]>(['']);
  
  const categoryTheories = selectedCategoryId 
    ? getTheoriesByCategory(selectedCategoryId)
    : theories.filter(t => {
        const category = categories.find(c => c.id === t.categoryId);
        return category?.subject === subject;
      });

  const selectedCategory = selectedCategoryId 
    ? categories.find(c => c.id === selectedCategoryId)
    : null;

  const handleNewTheory = () => {
    if (!selectedCategoryId) {
      alert('Выберите категорию для добавления теории');
      return;
    }
    
    setIsEditing(true);
    setActiveTheoryId(null);
    setTitle('');
    setContent('');
    setExamples(['']);
  };

  const handleEditTheory = (theory: Theory) => {
    setIsEditing(true);
    setActiveTheoryId(theory.id);
    setTitle(theory.title);
    setContent(theory.content);
    setExamples(theory.examples || ['']);
  };

  const handleSaveTheory = () => {
    if (!title.trim()) {
      alert('Введите заголовок теории');
      return;
    }

    if (!selectedCategoryId) {
      alert('Выберите категорию для сохранения теории');
      return;
    }

    const theoryData = {
      categoryId: selectedCategoryId,
      title: title.trim(),
      content: content.trim(),
      examples: examples.filter(ex => ex.trim() !== ''),
    };

    if (activeTheoryId) {
      updateTheory(activeTheoryId, theoryData);
    } else {
      addTheory(theoryData);
    }

    setIsEditing(false);
    setActiveTheoryId(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setActiveTheoryId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedCategory
              ? `Теория: ${selectedCategory.name}`
              : `Вся теория по ${subject === 'math' ? 'математике' : 'физике'}`}
          </h2>
          <p className="text-gray-600">
            {categoryTheories.length} теоретических материалов
          </p>
        </div>
        
        {!isEditing && (
          <button
            onClick={handleNewTheory}
            className="btn btn-primary flex items-center gap-2"
            disabled={!selectedCategoryId}
          >
            <Plus size={18} />
            Добавить теорию
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              {activeTheoryId ? 'Редактирование теории' : 'Новая теория'}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleSaveTheory}
                className="btn btn-primary flex items-center gap-2"
              >
                <Save size={18} />
                Сохранить
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-secondary flex items-center gap-2"
              >
                <X size={18} />
                Отмена
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {selectedCategory && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Категория:</p>
                <p className="font-medium">{selectedCategory.name}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заголовок *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Введите заголовок теории"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Содержание
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Введите содержание теории..."
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {categoryTheories.length > 0 ? (
            categoryTheories.map((theory) => {
              const category = categories.find(c => c.id === theory.categoryId);
              const isExpanded = activeTheoryId === theory.id;
              
              return (
                <div
                  key={theory.id}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                >
                  <div
                    className="px-6 py-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                    onClick={() => setActiveTheoryId(isExpanded ? null : theory.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown size={20} className="text-gray-500" />
                        ) : (
                          <ChevronRight size={20} className="text-gray-500" />
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">{theory.title}</h3>
                          {category && (
                            <p className="text-sm text-gray-500">
                              Категория: {category.name}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {new Date(theory.updatedAt).toLocaleDateString('ru-RU')}
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTheory(theory);
                            }}
                            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Удалить эту теорию?')) {
                                deleteTheory(theory.id);
                              }
                            }}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="p-6">
                      <div className="whitespace-pre-wrap text-gray-800">
                        {theory.content}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Нет теоретических материалов
              </h3>
              <p className="text-gray-500 mb-4">
                {selectedCategoryId
                  ? 'Добавьте первую теорию в эту категорию'
                  : 'Выберите категорию для добавления теории'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};