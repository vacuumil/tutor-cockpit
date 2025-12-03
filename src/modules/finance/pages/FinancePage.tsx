// src/modules/finance/pages/FinancePage.tsx
import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users,
  Plus,
  Edit2,
  Trash2,
  Filter
} from 'lucide-react';
import { useFinanceStore } from '@/stores/financeStore';
import { useLessonsStore } from '@/stores/lessonsStore';
import { Payment, Expense } from '@/types';
import { 
  formatCurrency, 
  getCurrentMonth, 
  getMonthName, 
  generateMonths,
  formatDate 
} from '@/lib/utils';
import { PaymentModal } from '../components/PaymentModal';
import { ExpenseModal } from '../components/ExpenseModal';
import './FinancePage.styles.css';

export const FinancePage: React.FC = () => {
  const { 
    payments, 
    expenses, 
    getTotalIncome, 
    getTotalExpenses, 
    getProfit,
    deletePayment,
    deleteExpense
  } = useFinanceStore();
  
  const { lessons } = useLessonsStore();
  
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>();
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'expenses'>('overview');

  const months = useMemo(() => generateMonths('2024-01', 24), []);

  // Фильтруем данные по выбранному месяцу
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      const paymentMonth = `${paymentDate.getFullYear()}-${(paymentDate.getMonth() + 1).toString().padStart(2, '0')}`;
      return paymentMonth === selectedMonth;
    });
  }, [payments, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseMonth = `${expenseDate.getFullYear()}-${(expenseDate.getMonth() + 1).toString().padStart(2, '0')}`;
      return expenseMonth === selectedMonth;
    });
  }, [expenses, selectedMonth]);

  // Статистика за месяц
  const monthlyIncome = useMemo(() => 
    filteredPayments.reduce((sum, payment) => sum + payment.amount, 0), 
    [filteredPayments]
  );

  const monthlyExpenses = useMemo(() => 
    filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0), 
    [filteredExpenses]
  );

  const monthlyProfit = monthlyIncome - monthlyExpenses;

  // Общая статистика
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const totalProfit = getProfit();

  // Неоплаченные занятия
  const unpaidLessons = useMemo(() => 
    lessons.filter(lesson => !lesson.paid && lesson.status === 'completed'),
    [lessons]
  );

  const totalUnpaid = useMemo(() => 
    unpaidLessons.reduce((sum, lesson) => sum + lesson.price, 0),
    [unpaidLessons]
  );

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setIsPaymentModalOpen(true);
  };

  const handleDeletePayment = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту оплату?')) {
      deletePayment(id);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот расход?')) {
      deleteExpense(id);
    }
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setEditingPayment(undefined);
  };

  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(undefined);
  };

  // Категории расходов
  const expenseCategories = [
    { value: 'materials', label: 'Материалы', color: 'bg-blue-100 text-blue-800' },
    { value: 'software', label: 'Софт', color: 'bg-green-100 text-green-800' },
    { value: 'advertising', label: 'Реклама', color: 'bg-purple-100 text-purple-800' },
    { value: 'office', label: 'Офис', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'other', label: 'Прочее', color: 'bg-gray-100 text-gray-800' },
  ];

  const getCategoryLabel = (category: string) => {
    const found = expenseCategories.find(c => c.value === category);
    return found ? found.label : 'Неизвестно';
  };

  const getCategoryColor = (category: string) => {
    const found = expenseCategories.find(c => c.value === category);
    return found ? found.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign size={24} />
            Финансы
          </h1>
          <p className="text-gray-600 mt-1">Управление доходами и расходами</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              {months.map(month => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="btn btn-primary flex items-center gap-2 px-4 py-2.5"
            >
              <Plus size={18} />
              Добавить оплату
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="btn btn-secondary flex items-center gap-2 px-4 py-2.5"
            >
              <Plus size={18} />
              Добавить расход
            </button>
          </div>
        </div>
      </div>

      {/* Табы */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Обзор
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Оплаты ({filteredPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'expenses'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Расходы ({filteredExpenses.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Обзор */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Карточки статистики */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign size={24} className="text-blue-600" />
                </div>
                <span className={`text-sm font-medium ${monthlyIncome > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {monthlyIncome > 0 ? '+' : ''}{formatCurrency(monthlyIncome)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Доход за месяц</h3>
              <p className="text-gray-600 text-sm mt-1">{getMonthName(selectedMonth)}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown size={24} className="text-red-600" />
                </div>
                <span className="text-sm font-medium text-red-600">
                  -{formatCurrency(monthlyExpenses)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Расходы за месяц</h3>
              <p className="text-gray-600 text-sm mt-1">{filteredExpenses.length} операций</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
                <span className={`text-sm font-medium ${monthlyProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {monthlyProfit > 0 ? '+' : ''}{formatCurrency(monthlyProfit)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Прибыль за месяц</h3>
              <p className="text-gray-600 text-sm mt-1">
                {monthlyProfit > 0 ? 'Положительная' : 'Отрицательная'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users size={24} className="text-orange-600" />
                </div>
                <span className="text-sm font-medium text-orange-600">
                  {formatCurrency(totalUnpaid)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Ожидает оплаты</h3>
              <p className="text-gray-600 text-sm mt-1">{unpaidLessons.length} занятий</p>
            </div>
          </div>

          {/* Общая статистика */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Общая статистика</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border border-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(totalIncome)}</div>
                <div className="text-gray-600">Общий доход</div>
                <div className="text-sm text-gray-500 mt-2">{payments.length} оплат</div>
              </div>
              <div className="text-center p-4 border border-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(totalExpenses)}</div>
                <div className="text-gray-600">Общие расходы</div>
                <div className="text-sm text-gray-500 mt-2">{expenses.length} операций</div>
              </div>
              <div className="text-center p-4 border border-gray-100 rounded-lg">
                <div className={`text-2xl font-bold ${totalProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalProfit)}
                </div>
                <div className="text-gray-600">Общая прибыль</div>
                <div className="text-sm text-gray-500 mt-2">
                  {totalProfit > 0 ? '✅ В плюсе' : '⚠️ В минусе'}
                </div>
              </div>
            </div>
          </div>

          {/* Последние операции */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Последние оплаты */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Последние оплаты</h2>
                <button
                  onClick={() => setActiveTab('payments')}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Все оплаты →
                </button>
              </div>
              <div className="space-y-3">
                {filteredPayments.slice(0, 5).map(payment => (
                  <div key={payment.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(payment.date)} • {payment.method === 'cash' ? 'Наличные' : 
                         payment.method === 'card' ? 'Карта' : 'Перевод'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPayment(payment)}
                        className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredPayments.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    Нет оплат за выбранный месяц
                  </div>
                )}
              </div>
            </div>

            {/* Последние расходы */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Последние расходы</h2>
                <button
                  onClick={() => setActiveTab('expenses')}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Все расходы →
                </button>
              </div>
              <div className="space-y-3">
                {filteredExpenses.slice(0, 5).map(expense => (
                  <div key={expense.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatCurrency(expense.amount)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(expense.category)}`}>
                          {getCategoryLabel(expense.category)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatDate(expense.date)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1 truncate">
                        {expense.description}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredExpenses.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    Нет расходов за выбранный месяц
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Таблица оплат */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Оплаты за {getMonthName(selectedMonth)}
            </h2>
            <p className="text-gray-600 mt-1">
              Всего: {formatCurrency(monthlyIncome)} • {filteredPayments.length} операций
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Дата</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Сумма</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Способ оплаты</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Занятие</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-700">
                      {formatDate(payment.date)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {payment.method === 'cash' ? 'Наличные' : 
                         payment.method === 'card' ? 'Карта' : 'Перевод'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {/* Здесь можно добавить ссылку на занятие */}
                      Занятие #{payment.lessonId.slice(0, 8)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPayment(payment)}
                          className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded"
                          title="Редактировать"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Удалить"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredPayments.length === 0 && (
              <div className="text-center py-12">
                <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Нет оплат за этот месяц</h3>
                <p className="text-gray-500 mb-4">Добавьте первую оплату, нажав кнопку выше</p>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Добавить оплату
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Таблица расходов */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Расходы за {getMonthName(selectedMonth)}
            </h2>
            <p className="text-gray-600 mt-1">
              Всего: {formatCurrency(monthlyExpenses)} • {filteredExpenses.length} операций
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Дата</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Категория</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Описание</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Сумма</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-700">
                      {formatDate(expense.date)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(expense.category)}`}>
                        {getCategoryLabel(expense.category)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700 max-w-xs truncate">
                      {expense.description}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-red-600">
                        -{formatCurrency(expense.amount)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded"
                          title="Редактировать"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Удалить"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredExpenses.length === 0 && (
              <div className="text-center py-12">
                <TrendingDown size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Нет расходов за этот месяц</h3>
                <p className="text-gray-500 mb-4">Добавьте первый расход, нажав кнопку выше</p>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="btn btn-secondary inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Добавить расход
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Модальные окна */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        payment={editingPayment}
      />
      
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={handleCloseExpenseModal}
        expense={editingExpense}
      />
    </div>
  );
};