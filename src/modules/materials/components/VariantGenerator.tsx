import React, { useState, useMemo } from 'react';
import {
  Layers,
  Download,
  Printer,
  Trash2,
  Save,
  FileText,
  Settings,
  Shuffle,
  Tag,
  Filter,
  BarChart3
} from 'lucide-react';
import { useMaterialsStore } from '@/stores/materialsStore';
import { Problem, GeneratedVariant } from '@/types';
import { ProblemCard } from './ProblemCard';

interface VariantGeneratorProps {
  subject: 'math' | 'physics';
  selectedCategoryId: string | null;
}

export const VariantGenerator: React.FC<VariantGeneratorProps> = ({
  subject,
  selectedCategoryId,
}) => {
  const {
    categories,
    problems,
    variants,
    generateVariant,
    deleteVariant,
  } = useMaterialsStore();

  const [variantName, setVariantName] = useState('Вариант 1');
  const [problemCount, setProblemCount] = useState(10);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    ('easy' | 'medium' | 'hard')[]
  >(['easy', 'medium', 'hard']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [generatedProblems, setGeneratedProblems] = useState<Problem[]>([]);
  const [savedVariants, setSavedVariants] = useState<GeneratedVariant[]>(variants);
  const [minPoints, setMinPoints] = useState<number>(1);
  const [maxPoints, setMaxPoints] = useState<number>(10);

  const subjectCategories = categories.filter(c => c.subject === subject);
  
  // Получаем все доступные теги из задач
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    problems.forEach(problem => {
      problem.tags.forEach(tag => {
        if (tag.trim()) tags.add(tag);
      });
    });
    return Array.from(tags).sort();
  }, [problems]);

  // Обновляем доступные теги при изменении предмета или категорий
  React.useEffect(() => {
    setAvailableTags(allTags);
  }, [allTags]);

  const availableProblems = useMemo(() => {
    let filtered = problems;
    
    // Фильтр по предмету
    const subjectCategoryIds = subjectCategories.map(c => c.id);
    filtered = filtered.filter(p => subjectCategoryIds.includes(p.categoryId));
    
    // Фильтр по выбранной категории
    if (selectedCategoryId) {
      filtered = filtered.filter(p => p.categoryId === selectedCategoryId);
    }
    
    // Фильтр по выбранным категориям
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.categoryId));
    }
    
    // Фильтр по сложности
    if (selectedDifficulty.length > 0) {
      filtered = filtered.filter(p => selectedDifficulty.includes(p.difficulty));
    }
    
    // Фильтр по тегам
    if (selectedTags.length > 0) {
      filtered = filtered.filter(p => 
        p.tags.some(tag => selectedTags.includes(tag))
      );
    }
    
    // Фильтр по баллам
    filtered = filtered.filter(p => {
      const points = p.points || 1;
      return points >= minPoints && points <= maxPoints;
    });
    
    return filtered;
  }, [problems, subjectCategories, selectedCategoryId, selectedCategories, selectedDifficulty, selectedTags, minPoints, maxPoints]);

  // Статистика
  const stats = useMemo(() => {
    const easy = availableProblems.filter(p => p.difficulty === 'easy').length;
    const medium = availableProblems.filter(p => p.difficulty === 'medium').length;
    const hard = availableProblems.filter(p => p.difficulty === 'hard').length;
    
    const totalPoints = availableProblems.reduce((sum, p) => sum + (p.points || 1), 0);
    const avgPoints = availableProblems.length > 0 
      ? (totalPoints / availableProblems.length).toFixed(1) 
      : '0';
    
    // Самые популярные теги
    const tagCounts: Record<string, number> = {};
    availableProblems.forEach(p => {
      p.tags.forEach(tag => {
        if (tag.trim()) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    });
    
    const popularTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
    
    return { easy, medium, hard, avgPoints, popularTags };
  }, [availableProblems]);

  const handleGenerate = () => {
    if (availableProblems.length === 0) {
      alert('Нет задач с выбранными критериями');
      return;
    }

    const count = Math.min(problemCount, availableProblems.length);
    
    // Генерация с учетом сложности
    const easyProblems = availableProblems.filter(p => p.difficulty === 'easy');
    const mediumProblems = availableProblems.filter(p => p.difficulty === 'medium');
    const hardProblems = availableProblems.filter(p => p.difficulty === 'hard');
    
    let selected: Problem[] = [];
    const easyCount = Math.min(Math.ceil(count * 0.4), easyProblems.length);
    const mediumCount = Math.min(Math.ceil(count * 0.4), mediumProblems.length);
    const hardCount = Math.max(0, count - easyCount - mediumCount);
    
    // Выбираем задачи из каждой категории сложности
    if (easyCount > 0) {
      selected = selected.concat(
        [...easyProblems]
          .sort(() => Math.random() - 0.5)
          .slice(0, easyCount)
      );
    }
    
    if (mediumCount > 0) {
      selected = selected.concat(
        [...mediumProblems]
          .sort(() => Math.random() - 0.5)
          .slice(0, mediumCount)
      );
    }
    
    if (hardCount > 0) {
      selected = selected.concat(
        [...hardProblems]
          .sort(() => Math.random() - 0.5)
          .slice(0, hardCount)
      );
    }
    
    // Если не хватило задач по сложности, добираем случайные
    if (selected.length < count) {
      const remaining = count - selected.length;
      const remainingProblems = availableProblems.filter(p => !selected.includes(p));
      selected = selected.concat(
        [...remainingProblems]
          .sort(() => Math.random() - 0.5)
          .slice(0, remaining)
      );
    }
    
    // Перемешиваем окончательный вариант
    selected = selected.sort(() => Math.random() - 0.5);
    
    setGeneratedProblems(selected);
  };

  const handleSaveVariant = () => {
    if (!variantName.trim()) {
      alert('Введите название варианта');
      return;
    }

    if (generatedProblems.length === 0) {
      alert('Сначала сгенерируйте вариант');
      return;
    }

    const newVariant = generateVariant({
      name: variantName.trim(),
      subject,
      categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
      difficulty: selectedDifficulty,
      count: generatedProblems.length,
    });

    setSavedVariants([...savedVariants, newVariant]);
    setVariantName(`Вариант ${savedVariants.length + 2}`);
    alert('Вариант сохранен!');
  };

  const handleExportPDF = () => {
    // TODO: Реализовать экспорт в PDF
    alert('Экспорт в PDF будет реализован позже');
  };

  const handleExportTXT = () => {
    const content = generatedProblems
      .map((prob, idx) => {
        const category = categories.find(c => c.id === prob.categoryId);
        const difficultyText = 
          prob.difficulty === 'easy' ? 'Лёгкая' :
          prob.difficulty === 'medium' ? 'Средняя' : 'Сложная';
        
        return `Задача ${idx + 1} (${difficultyText}, ${prob.points || 1} баллов${category ? `, ${category.name}` : ''}):

${prob.question}

Ответ: ${prob.answer}

${prob.solution ? `Решение:\n${prob.solution}\n` : ''}
${'-'.repeat(60)}`;
      })
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${variantName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    setSelectedDifficulty(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setSelectedDifficulty(['easy', 'medium', 'hard']);
    setMinPoints(1);
    setMaxPoints(10);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Генератор вариантов
          </h2>
          <p className="text-gray-600">
            Создавайте уникальные варианты для тестирования
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая панель - настройки */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-2 text-lg font-medium text-gray-800 mb-2">
              <Settings size={20} />
              Настройки генерации
            </div>

            {/* Название варианта */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название варианта *
              </label>
              <input
                type="text"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                placeholder="Вариант 1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Количество задач с улучшенным ползунком */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Количество задач: <span className="font-bold text-primary-600">{problemCount}</span>
                </label>
                <span className="text-sm text-gray-500">
                  доступно: {availableProblems.length}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={Math.min(30, availableProblems.length)}
                value={problemCount}
                onChange={(e) => setProblemCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
              </div>
            </div>

            {/* Баллы */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Баллы за задачу
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">От</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={minPoints}
                      onChange={(e) => setMinPoints(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">До</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={maxPoints}
                      onChange={(e) => setMaxPoints(Math.min(10, parseInt(e.target.value) || 10))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Сложность */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Сложность задач
              </label>
              <div className="space-y-2">
                {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
                  const count = availableProblems.filter(p => p.difficulty === difficulty).length;
                  const label = 
                    difficulty === 'easy' ? 'Лёгкие' :
                    difficulty === 'medium' ? 'Средние' : 'Сложные';
                  
                  return (
                    <label
                      key={difficulty}
                      className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDifficulty.includes(difficulty)}
                        onChange={() => toggleDifficulty(difficulty)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <span className="text-gray-700">{label}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500"
                              style={{ width: `${(count / Math.max(1, availableProblems.length)) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{count}</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Категории */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Категории
                </label>
                <button
                  onClick={() => setSelectedCategories(
                    selectedCategories.length === subjectCategories.length 
                      ? [] 
                      : subjectCategories.map(c => c.id)
                  )}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  {selectedCategories.length === subjectCategories.length ? 'Снять все' : 'Выбрать все'}
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {subjectCategories.map((category) => {
                  const count = availableProblems.filter(p => p.categoryId === category.id).length;
                  return (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1 flex justify-between items-center">
                        <span className="text-gray-700">{category.name}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {count}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Теги */}
            {availableTags.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Tag size={14} />
                    Теги
                  </label>
                  <button
                    onClick={() => setSelectedTags(
                      selectedTags.length === availableTags.length 
                        ? [] 
                        : availableTags
                    )}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    {selectedTags.length === availableTags.length ? 'Снять все' : 'Выбрать все'}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {availableTags.map((tag) => {
                    const count = availableProblems.filter(p => 
                      p.tags.includes(tag)
                    ).length;
                    return (
                      <label
                        key={tag}
                        className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <div className="flex-1 flex justify-between items-center">
                          <span className="text-gray-700">#{tag}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {count}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Статистика */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <BarChart3 size={16} />
                Статистика
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500">Всего задач</p>
                  <p className="font-bold text-lg">{availableProblems.length}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500">Средний балл</p>
                  <p className="font-bold text-lg">{stats.avgPoints}</p>
                </div>
              </div>
              
              {stats.popularTags.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Популярные теги:</p>
                  <div className="flex flex-wrap gap-1">
                    {stats.popularTags.map(({ tag, count }) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                      >
                        #{tag} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Кнопки управления фильтрами */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="w-full mb-3 text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2"
              >
                <Filter size={14} />
                Сбросить фильтры
              </button>

              {/* Кнопка генерации */}
              <button
                onClick={handleGenerate}
                disabled={availableProblems.length === 0}
                className={`w-full btn flex items-center justify-center gap-2 ${
                  availableProblems.length === 0 
                    ? 'btn-disabled' 
                    : 'btn-primary'
                }`}
              >
                <Shuffle size={18} />
                Сгенерировать вариант
              </button>

              {/* Кнопка сохранения */}
              {generatedProblems.length > 0 && (
                <button
                  onClick={handleSaveVariant}
                  disabled={!variantName.trim()}
                  className="w-full mt-3 btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Сохранить вариант
                </button>
              )}
            </div>
          </div>

          {/* Сохраненные варианты */}
          {savedVariants.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
              <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                <Save size={16} />
                Сохраненные варианты
              </h3>
              <div className="space-y-3">
                {savedVariants
                  .filter(v => v.subject === subject)
                  .slice(0, 5)
                  .map((variant) => (
                    <div
                      key={variant.id}
                      className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{variant.name}</p>
                        <p className="text-sm text-gray-500">
                          {variant.problems.length} задач •{' '}
                          {new Date(variant.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          deleteVariant(variant.id);
                          setSavedVariants(savedVariants.filter(v => v.id !== variant.id));
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Удалить"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Правая панель - результат */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Заголовок результата */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {generatedProblems.length > 0
                      ? variantName || 'Новый вариант'
                      : 'Сгенерированный вариант'}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-gray-600">
                      {generatedProblems.length} задач •{' '}
                      {generatedProblems.reduce((sum, p) => sum + (p.points || 1), 0)} баллов
                    </p>
                    {generatedProblems.length > 0 && (
                      <div className="flex gap-2">
                        {['easy', 'medium', 'hard'].map(difficulty => {
                          const count = generatedProblems.filter(p => p.difficulty === difficulty).length;
                          if (count === 0) return null;
                          return (
                            <span
                              key={difficulty}
                              className={`text-xs px-2 py-1 rounded-full ${
                                difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {difficulty === 'easy' ? 'Лёгкие' :
                               difficulty === 'medium' ? 'Средние' : 'Сложные'}: {count}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                {generatedProblems.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportTXT}
                      className="btn btn-secondary flex items-center gap-2"
                      title="Экспорт в TXT"
                    >
                      <FileText size={16} />
                      TXT
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="btn btn-primary flex items-center gap-2"
                      title="Экспорт в PDF"
                    >
                      <Download size={16} />
                      PDF
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="btn btn-secondary flex items-center gap-2"
                      title="Печать"
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Список задач */}
            <div className="p-6">
              {generatedProblems.length > 0 ? (
                <div className="space-y-6 print:space-y-4">
                  {generatedProblems.map((problem, index) => (
                    <div key={problem.id} className="break-inside-avoid">
                      <div className="print:hidden">
                        <ProblemCard
                          problem={problem}
                          showAnswer={false}
                          showSolution={false}
                          showActions={false}
                        />
                      </div>
                      
                      {/* Версия для печати */}
                      <div className="hidden print:block border border-gray-300 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-lg">
                              Задача {index + 1}
                            </h4>
                            <div className="flex gap-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded ${
                                problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {problem.difficulty === 'easy' ? 'Лёгкая' :
                                 problem.difficulty === 'medium' ? 'Средняя' : 'Сложная'}
                              </span>
                              {problem.tags.length > 0 && (
                                <span className="text-xs text-gray-600">
                                  Теги: {problem.tags.map(tag => `#${tag}`).join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded">
                            {problem.points || 1} балл{problem.points === 1 ? '' : 'а'}
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-gray-800 whitespace-pre-wrap font-medium">
                            {problem.question}
                          </p>
                        </div>
                        
                        <div className="h-32 border-t border-gray-300 pt-4 space-y-2">
                          <div>
                            <p className="text-gray-700 font-medium">Ответ:</p>
                            <p className="text-gray-500 border-b border-dashed border-gray-300 pb-1">_________________________________</p>
                          </div>
                          <div>
                            <p className="text-gray-700 font-medium">Решение:</p>
                            <p className="text-gray-500 border-b border-dashed border-gray-300 pb-1">_______________________________</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Layers size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Вариант не сгенерирован
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Настройте параметры и нажмите "Сгенерировать вариант"
                  </p>
                  <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
                    <p className="font-medium mb-2">Советы:</p>
                    <ul className="list-disc list-inside space-y-1 text-left">
                      <li>Выберите сложность задач</li>
                      <li>Укажите количество задач (1-30)</li>
                      <li>При желании выберите конкретные категории или теги</li>
                      <li>Доступно задач: {availableProblems.length}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};