import React from 'react';

interface LatexRendererProps {
  content: string;
  className?: string;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({ content, className = '' }) => {
  const renderWithLatex = (text: string) => {
    if (!text) return null;
    
    const parts = text.split(/(\$[^$]+\$)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const formula = part.slice(1, -1);
        return (
          <span key={index} className="font-mono bg-gray-100 px-1 rounded mx-1">
            {formula}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {renderWithLatex(content)}
    </div>
  );
};