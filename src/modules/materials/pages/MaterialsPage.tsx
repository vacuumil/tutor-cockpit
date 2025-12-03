import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Download, 
  FileText,
  Layers,
  Hash,
  ChevronRight,
  ChevronDown,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useMaterialsStore } from '@/stores/materialsStore';
import { Problem } from '@/types';
import { ProblemCard } from '../components/ProblemCard';
import { TheoryEditor } from '../components/TheoryEditor';
import { VariantGenerator } from '../components/VariantGenerator';
import { ProblemModal } from '../components/ProblemModal';
import { CategoryModal } from '../components/CategoryModal';
import './MaterialsPage.styles.css';

export const MaterialsPage: React.FC = () => {
  const { 
    categories, 
    problems, 
    theories,
    getCategoriesBySubject,
    getProblemsByCategory,
    searchProblems,
    deleteProblem,
    deleteCategory
  } = useMaterialsStore();
  
  const [activeTab, setActiveTab] = useState<'problems' | 'theory' | 'variants'>('problems');
  const [selectedSubject, setSelectedSubject] = useState<'math' | 'physics'>('math');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnswers, setShowAnswers] = useState(false);
  const [isAddingProblem, setIsAddingProblem] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryModalParentId, setCategoryModalParentId] = useState<string | undefined>(undefined);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  
  // Получаем категории по предмету
  const subjectCategories = useMemo(() => 
    getCategoriesBySubject(selectedSubject),
    [selectedSubject, getCategoriesBySubject]
  );
  
  // Получаем выбранную категорию
  const selectedCategory = useMemo(() => 
    selectedCategoryId ? categories.find(c => c.id === selectedCategoryId) : null,
    [selectedCategoryId, categories]
  );
  
  // Фильтруем задачи
  const filteredProblems = useMemo(() => {
    if (searchQuery) {
      return searchProblems(searchQuery, selectedSubject);
    }
    
    if (selectedCategoryId) {
      return getProblemsByCategory(selectedCategoryId);
    }
    
    // Все задачи по предмету
    const subjectCategoryIds = subjectCategories.map(c => c.id);
    return problems.filter(p => subjectCategoryIds.includes(p.categoryId));
  }, [searchQuery, selectedCategoryId, selectedSubject, problems, subjectCategories, getProblemsByCategory, searchProblems]);
  
  // Получаем дерево категорий для навигации
  const categoryTree = useMemo(() => {
    const roots = subjectCategories.filter(c => !c.parentId);
    return roots.map(root => ({
      ...root,
      children: subjectCategories.filter(c => c.parentId === root.id),
    }));
  }, [subjectCategories]);
  
  const handleDeleteProblem = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
      deleteProblem(id);
    }
  };
  
  const handleEditProblem = (problem: Problem) => {
    setEditingProblem(problem);
    setIsAddingProblem(true);
  };
  
  const handleDeleteCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Удалить категорию и все материалы в ней?')) {
      deleteCategory(id);
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
      }
    }
  };

  const handleAddSubcategory = (parentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryModalParentId(parentId);
    setIsAddingCategory(true);
  };
  
  return (
    <div className="p-4 md:p-6">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen size={24} />
            Материалы
          </h1>
          <p className="text-gray-600 mt-1">База знаний по математике и физике</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Выбор предмета */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedSubject('math')}
              className={`px-4 py-2 font-medium transition-colors ${selectedSubject === 'math' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              Математика
            </button>
            <button
              onClick={() => setSelectedSubject('physics')}
              className={`px-4 py-2 font-medium transition-colors ${selectedSubject === 'physics' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              Физика
            </button>
          </div>
          
          {/* Поиск */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск задач..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
            />
          </div>
        </div>
      </div>
      
      {/* Табы */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('problems')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'problems'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Hash size={16} />
              Задачи
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                {filteredProblems.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'theory'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText size={16} />
              Теория
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                {theories.filter(t => {
                  const category = categories.find(c => c.id === t.categoryId);
                  return category?.subject === selectedSubject;
                }).length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('variants')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'variants'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Layers size={16} />
              Варианты
            </button>
          </nav>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Левая панель - Навигация по категориям */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">Категории</h2>
              <button
                onClick={() => {
                  setCategoryModalParentId(undefined);
                  setIsAddingCategory(true);
                }}
                className="text-primary-600 hover:text-primary-700 p-1"
                title="Добавить категорию"
              >
                <Plus size={18} />
              </button>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                  !selectedCategoryId
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BookOpen size={16} />
                  Все материалы
                </span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {problems.filter(p => {
                    const category = categories.find(c => c.id === p.categoryId);
                    return category?.subject === selectedSubject;
                  }).length}
                </span>
              </button>
              
              {categoryTree.map(category => (
                <div key={category.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedCategoryId(
                        selectedCategoryId === category.id ? null : category.id
                      )}
                      className={`flex-1 text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                        selectedCategoryId === category.id
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {selectedCategoryId === category.id ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                        {category.name}
                      </span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {problems.filter(p => p.categoryId === category.id).length}
                      </span>
                    </button>
                    
                    {/* Отдельные кнопки действий для категории */}
                    <div className="flex items-center ml-2">
                      <button
                        onClick={(e) => handleAddSubcategory(category.id, e)}
                        className="text-gray-400 hover:text-primary-600 p-1"
                        title="Добавить подкатегорию"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteCategory(category.id, e)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Удалить категорию"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {selectedCategoryId === category.id && category.children.length > 0 && (
                    <div className="ml-6 space-y-1">
                      {category.children.map(child => (
                        <div key={child.id} className="flex items-center justify-between">
                          <button
                            onClick={() => setSelectedCategoryId(child.id)}
                            className={`flex-1 text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                              selectedCategoryId === child.id
                                ? 'bg-primary-50 text-primary-600'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                              {child.name}
                            </span>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {problems.filter(p => p.categoryId === child.id).length}
                            </span>
                          </button>
                          
                          {/* Отдельная кнопка удаления для подкатегории */}
                          <button
                            onClick={(e) => handleDeleteCategory(child.id, e)}
                            className="text-gray-400 hover:text-red-600 p-1 ml-2"
                            title="Удалить подкатегорию"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Быстрые действия */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Действия</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setEditingProblem(null);
                  setIsAddingProblem(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Plus size={18} />
                Добавить задачу
              </button>
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {showAnswers ? <EyeOff size={18} /> : <Eye size={18} />}
                {showAnswers ? 'Скрыть ответы' : 'Показать ответы'}
              </button>
              <button
                onClick={() => alert('Экспорт будет реализован позже')}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Download size={18} />
                Экспорт ученику
              </button>
            </div>
          </div>
        </div>
        
        {/* Основной контент */}
        <div className="lg:col-span-3">
          {activeTab === 'problems' ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {selectedCategory
                        ? selectedCategory.name
                        : searchQuery
                        ? `Результаты поиска: "${searchQuery}"`
                        : `Все задачи по ${selectedSubject === 'math' ? 'математике' : 'физике'}`}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {filteredProblems.length} задач • {
                        filteredProblems.reduce((sum, p) => sum + (p.points || 1), 0)
                      } баллов
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Сложность:</span>
                      <div className="flex gap-1">
                        {['easy', 'medium', 'hard'].map(difficulty => (
                          <span
                            key={difficulty}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {difficulty === 'easy' ? 'Лёгкие' :
                             difficulty === 'medium' ? 'Средние' : 'Сложные'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {filteredProblems.length > 0 ? (
                  <div className="space-y-6">
                    {filteredProblems.map((problem) => (
                      <ProblemCard
                        key={problem.id}
                        problem={problem}
                        showAnswer={showAnswers}
                        onEdit={() => handleEditProblem(problem)}
                        onDelete={() => handleDeleteProblem(problem.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchQuery ? 'Ничего не найдено' : 'Нет задач в этой категории'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery
                        ? 'Попробуйте изменить поисковый запрос'
                        : 'Добавьте первую задачу'}
                    </p>
                    <button
                      onClick={() => {
                        setEditingProblem(null);
                        setIsAddingProblem(true);
                      }}
                      className="btn btn-primary inline-flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Добавить задачу
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'theory' ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <TheoryEditor
                subject={selectedSubject}
                selectedCategoryId={selectedCategoryId}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <VariantGenerator
                subject={selectedSubject}
                selectedCategoryId={selectedCategoryId}
              />
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно для добавления/редактирования задачи */}
      <ProblemModal
        isOpen={isAddingProblem}
        onClose={() => {
          setIsAddingProblem(false);
          setEditingProblem(null);
        }}
        problem={editingProblem}
        categoryId={selectedCategoryId || undefined}
        subject={selectedSubject}
      />

      {/* Модальное окно для добавления категории */}
      <CategoryModal
        isOpen={isAddingCategory}
        onClose={() => {
          setIsAddingCategory(false);
          setCategoryModalParentId(undefined);
        }}
        subject={selectedSubject}
        parentId={categoryModalParentId}
      />
    </div>
  );
};