// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
              Что-то пошло не так
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Произошла ошибка при загрузке страницы
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <code className="text-sm text-gray-500 break-all">
                {this.state.error?.message || 'Неизвестная ошибка'}
              </code>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-primary-600 text-white py-2.5 px-4 rounded-lg hover:bg-primary-700 font-medium"
              >
                Перезагрузить страницу
              </button>
              <button
                onClick={() => window.location.href = '/app'}
                className="flex-1 bg-gray-200 text-gray-800 py-2.5 px-4 rounded-lg hover:bg-gray-300 font-medium"
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}