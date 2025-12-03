import React, { useState, useMemo } from 'react';
import { Download, Mail, Printer, Copy, Check } from 'lucide-react';
import { useMaterialsStore } from '@/stores/materialsStore';
import { Problem } from '@/types';

interface ExportMaterialsProps {
  subject: 'math' | 'physics';
  selectedCategoryId: string | null;
  selectedProblems?: Problem[];
}

export const ExportMaterials: React.FC<ExportMaterialsProps> = ({
  subject,
  selectedCategoryId,
  selectedProblems = [],
}) => {
  const { categories, problems } = useMaterialsStore();
  const [exportFormat, setExportFormat] = useState<'txt' | 'pdf' | 'html'>('txt');
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [includeSolutions, setIncludeSolutions] = useState(false);
  const [copied, setCopied] = useState(false);

  const subjectCategories = categories.filter(c => c.subject === subject);
  const filteredProblems = useMemo(() => {
    if (selectedProblems.length > 0) return selectedProblems;
    
    if (selectedCategoryId) {
      return problems.filter(p => p.categoryId === selectedCategoryId);
    }
    
    const subjectCategoryIds = subjectCategories.map(c => c.id);
    return problems.filter(p => subjectCategoryIds.includes(p.categoryId));
  }, [problems, selectedCategoryId, subjectCategories, selectedProblems]);

  const generateContent = () => {
    let content = '';
    
    content += `Материалы по ${subject === 'math' ? 'математике' : 'физике'}\n`;
    content += `Сгенерировано: ${new Date().toLocaleDateString('ru-RU')}\n`;
    content += '='.repeat(50) + '\n\n';
    
    filteredProblems.forEach((problem, index) => {
      const category = categories.find(c => c.id === problem.categoryId);
      
      content += `Задача ${index + 1}\n`;
      content += `Категория: ${category?.name || 'Не указана'}\n`;
      content += `Сложность: ${
        problem.difficulty === 'easy' ? 'Лёгкая' :
        problem.difficulty === 'medium' ? 'Средняя' : 'Сложная'
      }\n`;
      content += `Баллы: ${problem.points || 1}\n\n`;
      
      content += `Условие:\n${problem.question}\n\n`;
      
      if (includeAnswers) {
        content += `Ответ:\n${problem.answer}\n\n`;
      }
      
      if (includeSolutions && problem.solution) {
        content += `Решение:\n${problem.solution}\n\n`;
      }
      
      content += '-'.repeat(40) + '\n\n';
    });
    
    return content;
  };

  const handleExport = () => {
    const content = generateContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `материалы_${subject}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateContent());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования: ', err);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Материалы для ученика</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              .problem { margin-bottom: 30px; border-bottom: 1px solid #ddd; padding-bottom: 20px; }
              .question { font-weight: bold; margin-bottom: 10px; }
              .answer, .solution { margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
            </style>
          </head>
          <body>
            <h1>Материалы по ${subject === 'math' ? 'математике' : 'физике'}</h1>
            <p>Сгенерировано: ${new Date().toLocaleDateString('ru-RU')}</p>
            ${filteredProblems.map((problem, index) => `
              <div class="problem">
                <h3>Задача ${index + 1}</h3>
                <div class="question">${problem.question.replace(/\n/g, '<br>')}</div>
                ${includeAnswers ? `<div class="answer"><strong>Ответ:</strong> ${problem.answer}</div>` : ''}
                ${includeSolutions && problem.solution ? `<div class="solution"><strong>Решение:</strong> ${problem.solution}</div>` : ''}
              </div>
            `).join('')}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <Download size={24} className="text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-800">Экспорт материалов</h3>
      </div>

      <div className="space-y-6">
        {/* Настройки экспорта */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Формат экспорта
            </label>
            <div className="flex gap-4">
              {(['txt', 'pdf', 'html'] as const).map(format => (
                <label key={format} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    value={format}
                    checked={exportFormat === format}
                    onChange={() => setExportFormat(format)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-700">
                    {format === 'txt' && 'TXT файл'}
                    {format === 'pdf' && 'PDF файл'}
                    {format === 'html' && 'HTML страница'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAnswers}
                onChange={(e) => setIncludeAnswers(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Включить ответы</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSolutions}
                onChange={(e) => setIncludeSolutions(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Включить решения</span>
            </label>
          </div>
        </div>

        {/* Статистика */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Задач</p>
              <p className="text-xl font-bold text-gray-800">{filteredProblems.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Баллов</p>
              <p className="text-xl font-bold text-gray-800">
                {filteredProblems.reduce((sum, p) => sum + (p.points || 1), 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Лёгких</p>
              <p className="text-xl font-bold text-green-600">
                {filteredProblems.filter(p => p.difficulty === 'easy').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Сложных</p>
              <p className="text-xl font-bold text-red-600">
                {filteredProblems.filter(p => p.difficulty === 'hard').length}
              </p>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={handleExport}
            className="btn btn-primary flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Скачать TXT
          </button>
          
          <button
            onClick={handleCopyToClipboard}
            className="btn btn-secondary flex items-center justify-center gap-2"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Скопировано!' : 'Копировать'}
          </button>
          
          <button
            onClick={handlePrint}
            className="btn btn-secondary flex items-center justify-center gap-2"
          >
            <Printer size={18} />
            Печать
          </button>
          
          <button
            onClick={() => {
              // TODO: Реализовать отправку на email
              alert('Функция отправки на email будет реализована позже');
            }}
            className="btn btn-secondary flex items-center justify-center gap-2"
          >
            <Mail size={18} />
            Отправить
          </button>
        </div>

        {/* Предпросмотр */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Предпросмотр
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {generateContent().slice(0, 500)}...
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};