// src/router/AppRouter.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '@/modules/auth/pages/AuthPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage';
import { StudentsPage } from '@/modules/students/pages/StudentsPage';
import { SchedulePage } from '@/modules/schedule/pages/SchedulePage';
import { MaterialsPage } from '@/modules/materials/pages/MaterialsPage';
import { FinancePage } from '@/modules/finance/pages/FinancePage';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

export const AppRouter = () => {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Показываем загрузку, пока проверяем
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={
          isAuthenticated ? <Navigate to="/app" /> : <AuthPage />
        } 
      />
      <Route 
        path="/app" 
        element={
          isAuthenticated ? <DashboardLayout /> : <Navigate to="/auth" />
        } 
      >
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="materials" element={<MaterialsPage />} />
        <Route path="finance" element={<FinancePage />} />
      </Route>
      <Route 
        path="/" 
        element={
          <Navigate to={isAuthenticated ? "/app" : "/auth"} />
        } 
      />
      <Route 
        path="*" 
        element={
          <Navigate to={isAuthenticated ? "/app" : "/auth"} />
        } 
      />
    </Routes>
  );
};