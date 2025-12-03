// src/components/layout/DashboardLayout.tsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  BookOpen, 
  DollarSign,
  LogOut,
  Settings
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export const DashboardLayout: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    // Принудительный редирект
    window.location.href = '/auth';
  };

  const navItems = [
    { to: '/app', icon: Home, label: 'Дашборд' },
    { to: '/app/students', icon: Users, label: 'Ученики' },
    { to: '/app/schedule', icon: Calendar, label: 'Расписание' },
    { to: '/app/materials', icon: BookOpen, label: 'Материалы' },
    { to: '/app/finance', icon: DollarSign, label: 'Финансы' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">TC</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Tutor Cockpit</h1>
              <p className="text-xs text-gray-500 mt-0.5">Панель управления</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-linear-to-r from-primary-50 to-primary-100 text-primary-600 border-l-4 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-100 border-l-4 border-transparent'
                  }`
                }
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => window.location.href = '/app/settings'}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full transition-colors"
          >
            <Settings size={20} />
            <span>Настройки</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors border border-red-200 hover:border-red-300"
          >
            <LogOut size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};