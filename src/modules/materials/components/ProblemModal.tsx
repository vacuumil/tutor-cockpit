import React, { useState } from 'react';
import { X, Plus, Upload } from 'lucide-react';
import { Problem } from '@/types';
import { useMaterialsStore } from '@/stores/materialsStore';

interface ProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem?: Problem | null;
  categoryId?: string;
  subject: 'math' | 'physics';
}

export const ProblemModal: React.FC<ProblemModalProps> = ({
  isOpen,
  onClose,
  problem,
  categoryId,
  subject,
}) => {
  const { categories, addProblem, updateProblem } = useMaterialsStore();
  
  const [formState, setFormState] = useState(() => ({
    question: problem?.question || '',
    answer: problem?.answer || '',
    solution: problem?.solution || '',
    difficulty: problem?.difficulty || 'medium' as 'easy' | 'medium' | 'hard',
    points: problem?.points || 1,
    tags: problem?.tags && problem.tags.length > 0 ? problem.tags : [''],
    selectedCategoryId: problem?.categoryId || categoryId || '',
    images: problem?.images || [] as string[],
    newTag: '',
  }));

  const subjectCategories = categories.filter(c => c.subject === subject);

  const handleSubmit = () => {
    const { question, answer, difficulty, selectedCategoryId } = formState;
    
    if (!question.trim() || !answer.trim()) {
      alert('Заполните вопрос и ответ');
      return;
    }

    if (!selectedCategoryId) {
      alert('Выберите категорию');
      return;
    }

    const problemData = {
      categoryId: selectedCategoryId,
      question: question.trim(),
      answer: answer.trim(),
      solution: formState.solution.trim() || undefined,
      difficulty,
      points: formState.points,
      tags: formState.tags.filter(tag => tag.trim() !== ''),
      images: formState.images.length > 0 ? formState.images : undefined,
    };

    if (problem) {
      updateProblem(problem.id, problemData);
    } else {
      addProblem(problemData);
    }

    onClose();
  };

  const addTag = () => {
    if (formState.newTag.trim()) {
      setFormState(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: '',
      }));
    }
  };

  const removeTag = (index: number) => {
    setFormState(prev => {
      const newTags = [...prev.tags];
      newTags.splice(index, 1);
      return { ...prev, tags: newTags };
    });
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileReaders: Promise<string>[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new Promise<string>((resolve) => {
          const fileReader = new FileReader();
          fileReader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          fileReader.readAsDataURL(file);
        });
        fileReaders.push(reader);
      }
    }

    Promise.all(fileReaders).then(newImages => {
      setFormState(prev => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    });
  };

  const removeImage = (index: number) => {
    setFormState(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormState(prev => ({ ...prev, question: e.target.value }));
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormState(prev => ({ ...prev, answer: e.target.value }));
  };

  const handleSolutionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormState(prev => ({ ...prev, solution: e.target.value }));
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormState(prev => ({ 
      ...prev, 
      difficulty: e.target.value as 'easy' | 'medium' | 'hard' 
    }));
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ 
      ...prev, 
      points: Math.max(1, parseInt(e.target.value) || 1) 
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormState(prev => ({ 
      ...prev, 
      selectedCategoryId: e.target.value 
    }));
  };

  const handleNewTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ 
      ...prev, 
      newTag: e.target.value 
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              {problem ? 'Редактировать задачу' : 'Добавить задачу'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория *
            </label>
            <select
              value={formState.selectedCategoryId}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Выберите категорию</option>
              {subjectCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Вопрос *
            </label>
            <textarea
              value={formState.question}
              onChange={handleQuestionChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Введите условие задачи..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Изображения
            </label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 hover:bg-primary-50 transition-colors flex-1">
                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Загрузить изображение</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              {formState.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formState.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Изображение ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ответ *
            </label>
            <textarea
              value={formState.answer}
              onChange={handleAnswerChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Введите ответ..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Решение
            </label>
            <textarea
              value={formState.solution}
              onChange={handleSolutionChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Введите решение..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сложность *
              </label>
              <select
                value={formState.difficulty}
                onChange={handleDifficultyChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="easy">Лёгкая</option>
                <option value="medium">Средняя</option>
                <option value="hard">Сложная</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Баллы
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formState.points}
                onChange={handlePointsChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Теги
            </label>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={formState.newTag}
                onChange={handleNewTagChange}
                onKeyPress={handleTagKeyPress}
                placeholder="Введите тег и нажмите Enter"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 flex items-center gap-2"
              >
                <Plus size={16} />
                Добавить
              </button>
            </div>
            
            {formState.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formState.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full"
                  >
                    <span className="text-sm">#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-gray-500 hover:text-red-600 ml-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              {problem ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};