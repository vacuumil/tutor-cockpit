// src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router/AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;