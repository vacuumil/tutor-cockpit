import React, { useState, useEffect } from 'react';
import { 
  Hash, 
  Star, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import { Problem } from '@/types';
import { useMaterialsStore } from '@/stores/materialsStore';

interface ProblemCardProps {
  problem: Problem;
  showAnswer?: boolean;
  showSolution?: boolean;
  showActions?: boolean;
  onEdit?: (problem: Problem) => void;
  onDelete?: (problemId: string) => void;
  onToggleSelect?: (problemId: string, selected: boolean) => void;
  isSelected?: boolean;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  showAnswer = false,
  showSolution = false,
  showActions = true,
  onEdit,
  onDelete,
  onToggleSelect,
  isSelected = false,
}) => {
  const { categories } = useMaterialsStore();
  const [showFullAnswer, setShowFullAnswer] = useState(showAnswer);
  const [showFullSolution, setShowFullSolution] = useState(showSolution);
  const [showImages, setShowImages] = useState(false);
  
  const category = categories.find(c => c.id === problem.categoryId);
  
  const getDifficultyColor = (difficulty: Problem['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getDifficultyLabel = (difficulty: Problem['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'Лёгкая';
      case 'medium': return 'Средняя';
      case 'hard': return 'Сложная';
      default: return difficulty;
    }
  };

  useEffect(() => {
    setShowFullAnswer(showAnswer);
  }, [showAnswer]);

  useEffect(() => {
    setShowFullSolution(showSolution);
  }, [showSolution]);
  
  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden bg-white ${
      isSelected ? 'ring-2 ring-primary-500' : ''
    }`}>
      {/* Заголовок карточки */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onToggleSelect && (
              <button
                onClick={() => onToggleSelect(problem.id, !isSelected)}
                className={`w-5 h-5 rounded border flex items-center justify-center ${
                  isSelected
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                {isSelected && <CheckCircle size={12} className="text-white" />}
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <Hash size={16} className="text-gray-400" />
              <h3 className="font-medium text-gray-900">Задача #{problem.id.slice(-6)}</h3>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
              {getDifficultyLabel(problem.difficulty)}
            </span>
            
            {problem.points && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1`}>
                <Star size={10} />
                {problem.points} балл{problem.points === 1 ? '' : problem.points < 5 ? 'а' : 'ов'}
              </span>
            )}
            
            {category && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {category.name}
              </span>
            )}
          </div>
        </div>
        
        {problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            <Tag size={12} className="text-gray-400 mt-1" />
            {problem.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Контент карточки */}
      <div className="p-6">
        {/* Вопрос */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-blue-500" />
            <h4 className="font-medium text-gray-700">Условие задачи</h4>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-800 whitespace-pre-wrap">{problem.question}</p>
            
            {/* Изображения */}
            {problem.images && problem.images.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowImages(!showImages)}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mb-2"
                >
                  <ImageIcon size={14} />
                  {showImages ? 'Скрыть изображения' : `Показать изображения (${problem.images.length})`}
                </button>
                
                {showImages && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {problem.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Изображение ${index + 1} к задаче`}
                          className="w-full h-auto rounded-lg border border-gray-200"
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          Изобр. {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Ответ */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <h4 className="font-medium text-gray-700">Ответ</h4>
            </div>
            <button
              onClick={() => setShowFullAnswer(!showFullAnswer)}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              {showFullAnswer ? (
                <>
                  <EyeOff size={14} />
                  Скрыть
                </>
              ) : (
                <>
                  <Eye size={14} />
                  Показать
                </>
              )}
            </button>
          </div>
          
          {showFullAnswer ? (
            <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
              <p className="text-green-800 font-medium whitespace-pre-wrap">{problem.answer}</p>
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-gray-500">Нажмите "Показать", чтобы увидеть ответ</p>
            </div>
          )}
        </div>
        
        {/* Решение (если есть) */}
        {problem.solution && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <XCircle size={16} className="text-purple-500" />
                <h4 className="font-medium text-gray-700">Решение</h4>
              </div>
              <button
                onClick={() => setShowFullSolution(!showFullSolution)}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                {showFullSolution ? (
                  <>
                    <EyeOff size={14} />
                    Скрыть
                  </>
                ) : (
                  <>
                    <Eye size={14} />
                    Показать
                  </>
                )}
              </button>
            </div>
            
            {showFullSolution && (
              <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg">
                <p className="text-purple-800 whitespace-pre-wrap">{problem.solution}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Футер карточки */}
      {showActions && (onEdit || onDelete) && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Обновлено: {new Date(problem.updatedAt).toLocaleDateString('ru-RU')}
            </div>
            
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(problem)}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Редактировать задачу"
                >
                  <Edit2 size={16} />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete && onDelete(problem.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Удалить задачу"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};