import React, { useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  BookOpen,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStudentsStore } from '@/stores/studentsStore';
import { useLessonsStore } from '@/stores/lessonsStore';
import { useFinanceStore } from '@/stores/financeStore';
import { 
  formatCurrency, 
  formatDate, 
  formatTimeRange,
  getCurrentMonth,
} from '@/lib/utils';
import './DashboardPage.styles.css';

export const DashboardPage: React.FC = () => {
  const { students } = useStudentsStore();
  const { lessons } = useLessonsStore();
  const { payments, expenses, getTotalIncome, getProfit } = useFinanceStore();

  const currentDate = new Date();

  // Реальная статистика
  const totalIncome = getTotalIncome();
  const totalProfit = getProfit();
  
  // Активные ученики (с занятиями в текущем месяце)
  const activeStudents = useMemo(() => {
    const currentMonth = getCurrentMonth();
    const activeStudentIds = new Set(
      lessons
        .filter(lesson => {
          const lessonDate = new Date(lesson.date);
          const lessonMonth = `${lessonDate.getFullYear()}-${(lessonDate.getMonth() + 1).toString().padStart(2, '0')}`;
          return lessonMonth === currentMonth;
        })
        .map(lesson => lesson.studentId)
    );
    return students.filter(student => activeStudentIds.has(student.id));
  }, [students, lessons]);

  // Занятия сегодня
  const todayLessons = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return lessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return lessonDate >= today && lessonDate < tomorrow && lesson.status === 'scheduled';
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [lessons]);

  // Занятия на этой неделе
  const thisWeekLessons = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return lessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return lessonDate >= today && lessonDate < nextWeek && lesson.status === 'scheduled';
    });
  }, [lessons]);

  // Неоплаченные занятия
  const unpaidLessons = useMemo(() => 
    lessons.filter(lesson => !lesson.paid && lesson.status === 'completed'),
    [lessons]
  );

  const totalUnpaid = useMemo(() => 
    unpaidLessons.reduce((sum, lesson) => sum + lesson.price, 0),
    [unpaidLessons]
  );

  // Последние добавленные ученики
  const recentStudents = useMemo(() => 
    [...students]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    [students]
  );

  // Доход по месяцам (последние 3 месяца)
  const monthlyIncome = useMemo(() => {
    const months = [];
    const current = new Date();
    
    for (let i = 2; i >= 0; i--) {
      const date = new Date(current.getFullYear(), current.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const monthIncome = payments
        .filter(payment => {
          const paymentDate = new Date(payment.date);
          const paymentMonth = `${paymentDate.getFullYear()}-${(paymentDate.getMonth() + 1).toString().padStart(2, '0')}`;
          return paymentMonth === monthKey;
        })
        .reduce((sum, payment) => sum + payment.amount, 0);
      
      months.push({
        month: monthKey,
        name: date.toLocaleDateString('ru-RU', { month: 'short' }),
        year: date.getFullYear(),
        income: monthIncome,
      });
    }
    
    return months;
  }, [payments]);

  // Процент изменения дохода (последний месяц к предпоследнему)
  const incomeChange = useMemo(() => {
    if (monthlyIncome.length < 2) return 0;
    const currentMonth = monthlyIncome[2]?.income || 0;
    const prevMonth = monthlyIncome[1]?.income || 0;
    if (prevMonth === 0) return currentMonth > 0 ? 100 : 0;
    return Math.round(((currentMonth - prevMonth) / prevMonth) * 100);
  }, [monthlyIncome]);

  // Процент изменения учеников (последние 30 дней)
  const studentsChange = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newStudents = students.filter(student => 
      new Date(student.createdAt) > thirtyDaysAgo
    ).length;
    
    const totalBefore = students.length - newStudents;
    if (totalBefore === 0) return newStudents > 0 ? 100 : 0;
    
    return Math.round((newStudents / totalBefore) * 100);
  }, [students]);

  // Процент изменения занятий (последние 30 дней)
  const lessonsChange = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newLessons = lessons.filter(lesson => 
      new Date(lesson.createdAt) > thirtyDaysAgo
    ).length;
    
    const totalBefore = lessons.length - newLessons;
    if (totalBefore === 0) return newLessons > 0 ? 100 : 0;
    
    return Math.round((newLessons / totalBefore) * 100);
  }, [lessons]);

  return (
    <div className="p-4 md:p-6">
      {/* Заголовок и приветствие */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Добро пожаловать в Tutor Cockpit
        </h1>
        <p className="text-gray-600 mt-2">
          {currentDate.toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Быстрая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stats-card bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign size={24} className="text-blue-600" />
            </div>
            <div className={`flex items-center text-sm font-medium ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {incomeChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(incomeChange)}%
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{formatCurrency(totalIncome)}</h3>
          <p className="text-gray-600">Общий доход</p>
          <div className="mt-4 text-sm text-gray-500">
            Прибыль: <span className={`font-medium ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalProfit)}
            </span>
          </div>
        </div>

        <div className="stats-card bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users size={24} className="text-green-600" />
            </div>
            <div className={`flex items-center text-sm font-medium ${studentsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {studentsChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(studentsChange)}%
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{students.length}</h3>
          <p className="text-gray-600">Всего учеников</p>
          <div className="mt-4 text-sm text-gray-500">
            Активных: <span className="font-medium text-blue-600">{activeStudents.length}</span>
          </div>
        </div>

        <div className="stats-card bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar size={24} className="text-purple-600" />
            </div>
            <div className={`flex items-center text-sm font-medium ${lessonsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {lessonsChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(lessonsChange)}%
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{lessons.length}</h3>
          <p className="text-gray-600">Всего занятий</p>
          <div className="mt-4 text-sm text-gray-500">
            На этой неделе: <span className="font-medium text-purple-600">{thisWeekLessons.length}</span>
          </div>
        </div>

        <div className="stats-card bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle size={24} className="text-orange-600" />
            </div>
            <span className="text-sm font-medium text-orange-600">
              {formatCurrency(totalUnpaid)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{unpaidLessons.length}</h3>
          <p className="text-gray-600">Ожидает оплаты</p>
          <div className="mt-4">
            <Link 
              to="/app/finance" 
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Оплатить сейчас →
            </Link>
          </div>
        </div>
      </div>

      {/* Основной контент - 2 колонки */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка - Ближайшие занятия и быстрые действия */}
        <div className="lg:col-span-2 space-y-6">
          {/* Занятия сегодня */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Clock size={20} />
                Занятия сегодня
              </h2>
              <Link 
                to="/app/schedule" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Все занятия →
              </Link>
            </div>
            
            <div className="space-y-4">
              {todayLessons.length > 0 ? (
                todayLessons.map(lesson => {
                  const student = students.find(s => s.id === lesson.studentId);
                  
                  return (
                    <div 
                      key={lesson.id} 
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {student?.name || 'Неизвестный ученик'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {lesson.title} • {formatTimeRange(lesson.startTime, lesson.endTime)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatDate(lesson.date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(lesson.price)}
                        </div>
                        <div className={`text-xs font-medium px-2 py-1 rounded-full ${lesson.paid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {lesson.paid ? 'Оплачено' : 'Не оплачено'}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Нет занятий на сегодня</h3>
                  <p className="text-gray-500">Добавьте занятия в расписании</p>
                  <Link 
                    to="/app/schedule" 
                    className="btn btn-primary mt-4 inline-flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Добавить занятие
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Быстрые действия */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Быстрые действия</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link 
                to="/app/students"
                className="quick-action-card p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Добавить ученика</div>
                    <div className="text-sm text-gray-600">Новый ученик в базе</div>
                  </div>
                </div>
              </Link>

              <Link 
                to="/app/schedule"
                className="quick-action-card p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar size={20} className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Запланировать занятие</div>
                    <div className="text-sm text-gray-600">Добавить в календарь</div>
                  </div>
                </div>
              </Link>

              <Link 
                to="/app/finance"
                className="quick-action-card p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Зарегистрировать оплату</div>
                    <div className="text-sm text-gray-600">Внести платеж</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Правая колонка - Статистика и последние ученики */}
        <div className="space-y-6">
          {/* Доход по месяцам */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Доход по месяцам</h2>
            <div className="space-y-4">
              {monthlyIncome.map((stat, index) => (
                <div key={stat.month} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${index === 2 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <div className="font-medium text-gray-900">{stat.name} {stat.year}</div>
                      <div className="text-sm text-gray-600">
                        {payments.filter(p => {
                          const paymentDate = new Date(p.date);
                          const paymentMonth = `${paymentDate.getFullYear()}-${(paymentDate.getMonth() + 1).toString().padStart(2, '0')}`;
                          return paymentMonth === stat.month;
                        }).length} оплат
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(stat.income)}
                    </div>
                    <div className={`text-xs font-medium ${stat.income > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {stat.income > 0 ? '+' : ''}{stat.income > 0 ? '100%' : '0%'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link 
                to="/app/finance" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                Подробная статистика
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          {/* Последние добавленные ученики */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Users size={20} />
                Последние ученики
              </h2>
              <Link 
                to="/app/students" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Все ученики →
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentStudents.length > 0 ? (
                recentStudents.map(student => (
                  <Link 
                    key={student.id}
                    to={`/app/students?view=${student.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors block"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="font-medium text-primary-600">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-600">{student.grade} • {student.subject === 'math' ? 'Математика' : student.subject === 'physics' ? 'Физика' : 'Оба предмета'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {formatDate(student.createdAt)}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-4">
                  <Users size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">Нет учеников</p>
                  <Link 
                    to="/app/students" 
                    className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                  >
                    Добавить первого ученика
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Информация о системе */}
          <div className="bg-linear-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <BookOpen size={20} />
              </div>
              <h3 className="text-lg font-semibold">Tutor Cockpit</h3>
            </div>
            <p className="text-sm opacity-90 mb-4">
              Все ваши данные хранятся локально в браузере
            </p>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Версия</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Учеников</span>
                <span className="font-medium">{students.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Занятий</span>
                <span className="font-medium">{lessons.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Оплат</span>
                <span className="font-medium">{payments.length}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <button 
                onClick={() => {
                  // Функция экспорта данных
                  const data = {
                    students,
                    lessons,
                    payments,
                    expenses,
                    exportedAt: new Date().toISOString(),
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `tutor-cockpit-backup-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
                className="text-sm font-medium hover:opacity-80"
              >
                Сделать резервную копию →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};