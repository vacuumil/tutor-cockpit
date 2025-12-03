import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, Edit2, Trash2 } from 'lucide-react';
import { MaterialCategory } from '@/types';
import { useMaterialsStore } from '@/stores/materialsStore';

interface CategoryTreeProps {
  subject: 'math' | 'physics';
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onAddSubcategory?: (parentId?: string) => void;
  onEditCategory?: (category: MaterialCategory) => void;
}

export const CategoryTree: React.FC<CategoryTreeProps> = ({
  subject,
  selectedCategoryId,
  onSelectCategory,
  onAddSubcategory,
  onEditCategory,
}) => {
  const { getCategoriesBySubject, deleteCategory, getProblemsByCategory } = useMaterialsStore();
  
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const subjectCategories = getCategoriesBySubject(subject);
  const rootCategories = subjectCategories.filter(c => !c.parentId);
  
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };
  
  const renderCategory = (category: MaterialCategory, level = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategoryId === category.id;
    const childCategories = subjectCategories.filter(c => c.parentId === category.id);
    const problemsCount = getProblemsByCategory(category.id).length;
    
    const hasChildren = childCategories.length > 0;
    
    return (
      <div key={category.id} className="select-none">
        {/* Категория */}
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
            isSelected
              ? 'bg-primary-50 text-primary-600'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
          onClick={() => onSelectCategory(category.id)}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(category.id);
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            ) : (
              <div className="w-6"></div>
            )}
            
            {isExpanded ? (
              <FolderOpen size={16} className="text-blue-500" />
            ) : (
              <Folder size={16} className="text-blue-400" />
            )}
            
            <span className="font-medium truncate">{category.name}</span>
            
            {category.description && (
              <span className="text-xs text-gray-500 truncate hidden md:inline">
                - {category.description}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {problemsCount > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {problemsCount}
              </span>
            )}
            
            <div className="flex items-center gap-1">
              {onAddSubcategory && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSubcategory(category.id);
                  }}
                  className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                  title="Добавить подкатегорию"
                >
                  <Plus size={14} />
                </button>
              )}
              
              {onEditCategory && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCategory(category);
                  }}
                  className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                  title="Редактировать категорию"
                >
                  <Edit2 size={14} />
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Удалить категорию "${category.name}" и все материалы в ней?`)) {
                    deleteCategory(category.id);
                    if (selectedCategoryId === category.id) {
                      onSelectCategory(null);
                    }
                  }
                }}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                title="Удалить категорию"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Дочерние категории */}
        {isExpanded && hasChildren && (
          <div className="mt-1">
            {childCategories
              .sort((a, b) => a.order - b.order)
              .map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Заголовок */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">
            {subject === 'math' ? 'Математика' : 'Физика'}
          </h3>
          {onAddSubcategory && (
            <button
              onClick={() => onAddSubcategory()}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <Plus size={16} />
              Добавить
            </button>
          )}
        </div>
      </div>
      
      {/* Все материалы */}
      <div
        className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors flex items-center justify-between ${
          !selectedCategoryId
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        onClick={() => onSelectCategory(null)}
      >
        <div className="flex items-center gap-2">
          <Folder size={16} />
          <span className="font-medium">Все материалы</span>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          {subjectCategories.reduce((count, category) => {
            return count + getProblemsByCategory(category.id).length;
          }, 0)}
        </span>
      </div>
      
      {/* Дерево категорий */}
      <div className="py-2 max-h-[400px] overflow-y-auto">
        {rootCategories.length > 0 ? (
          rootCategories
            .sort((a, b) => a.order - b.order)
            .map(category => renderCategory(category))
        ) : (
          <div className="px-4 py-6 text-center">
            <Folder size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">Нет категорий</p>
            {onAddSubcategory && (
              <button
                onClick={() => onAddSubcategory()}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700"
              >
                Создать первую категорию
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};