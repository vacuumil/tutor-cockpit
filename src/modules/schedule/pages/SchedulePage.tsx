import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer, View, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useLessonsStore } from '@/stores/lessonsStore';
import { useStudentsStore } from '@/stores/studentsStore';
import { Lesson } from '@/types';
import { lessonToCalendarEvent } from '@/lib/utils';
import { LessonModal } from '../components/LessonModal';
import './SchedulePage.styles.css';

const localizer = momentLocalizer(moment);

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    lesson: Lesson;
    studentName: string;
  };
};

interface StudentWithId {
  id: string;
  name: string;
}

export const SchedulePage: React.FC = () => {
  const { lessons } = useLessonsStore();
  const { students } = useStudentsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('week');

  // Преобразуем занятия в события для календаря
  const events: CalendarEvent[] = lessons.map(lesson => {
    const student = students.find((s: StudentWithId) => s.id === lesson.studentId);
    return lessonToCalendarEvent(lesson, student?.name || 'Неизвестный ученик');
  });

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSelectedDate(slotInfo.start);
    setSelectedTime(slotInfo.start.toTimeString().slice(0, 5));
    setEditingLesson(undefined);
    setIsModalOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    const lesson = event.resource.lesson;
    setEditingLesson(lesson);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLesson(undefined);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const getTodayLessons = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return lessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      lessonDate.setHours(0, 0, 0, 0);
      return lessonDate.getTime() === today.getTime();
    }).length;
  };

  const getUpcomingLessons = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return lessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return lessonDate >= today && lessonDate < nextWeek;
    }).length;
  };

  const upcomingLessonsCount = getUpcomingLessons();

  // Кастомизация стилей событий
  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = event.resource.lesson.paid ? '#10b981' : 
                           event.resource.lesson.status === 'completed' ? '#6b7280' : 
                           event.resource.lesson.status === 'cancelled' ? '#ef4444' : 
                           '#3b82f6';
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarIcon size={24} />
            Расписание
          </h1>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Запланировано</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Оплачено</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>Проведено</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Отменено</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-gray-500" />
              <div>
                <div className="text-sm text-gray-600">Сегодня</div>
                <div className="font-bold text-lg">{getTodayLessons()} занятий</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-gray-500" />
              <div>
                <div className="text-sm text-gray-600">Ближайшая неделя</div>
                <div className="font-bold text-lg">{upcomingLessonsCount} занятий</div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary flex items-center gap-2 px-5 py-2.5"
          >
            <Plus size={20} />
            Добавить занятие
          </button>
        </div>
      </div>

      {/* Календарь */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onView={handleViewChange}
          view={currentView}
          views={['day', 'week', 'month']}
          step={30}
          timeslots={2}
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 22, 0, 0)}
          eventPropGetter={eventStyleGetter}
          messages={{
            today: 'Сегодня',
            previous: 'Назад',
            next: 'Вперед',
            month: 'Месяц',
            week: 'Неделя',
            day: 'День',
            agenda: 'Повестка',
            date: 'Дата',
            time: 'Время',
            event: 'Событие',
            noEventsInRange: 'Нет занятий в выбранном периоде',
          }}
          components={{
            toolbar: (props: { 
              onView: (view: View) => void; 
              onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
              date: Date;
              label: string;
            }) => (
              <div className="flex justify-between items-center mb-4 p-2 bg-gray-50 rounded-lg">
                <div className="flex gap-2">
                  <button
                    onClick={() => props.onView('day')}
                    className={`px-3 py-1.5 rounded ${currentView === 'day' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    День
                  </button>
                  <button
                    onClick={() => props.onView('week')}
                    className={`px-3 py-1.5 rounded ${currentView === 'week' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Неделя
                  </button>
                  <button
                    onClick={() => props.onView('month')}
                    className={`px-3 py-1.5 rounded ${currentView === 'month' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Месяц
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-700">
                    {moment(props.date).format('MMMM YYYY')}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => props.onNavigate('PREV')}
                      className="btn btn-secondary px-3 py-1.5"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => props.onNavigate('TODAY')}
                      className="btn btn-secondary px-3 py-1.5"
                    >
                      Сегодня
                    </button>
                    <button
                      onClick={() => props.onNavigate('NEXT')}
                      className="btn btn-secondary px-3 py-1.5"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            ),
          }}
        />
      </div>

      {/* Список ближайших занятий */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ближайшие занятия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons
            .filter(lesson => {
              const lessonDate = new Date(lesson.date);
              const now = new Date();
              return lessonDate >= now;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 6)
            .map(lesson => {
              const student = students.find((s: StudentWithId) => s.id === lesson.studentId);
              return (
                <div
                  key={lesson.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer lesson-card"
                  onClick={() => {
                    setEditingLesson(lesson);
                    setIsModalOpen(true);
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{student?.name || 'Неизвестный ученик'}</h3>
                      <p className="text-sm text-gray-600">{lesson.subject || 'Занятие'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      lesson.paid ? 'bg-green-100 text-green-800' :
                      lesson.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      lesson.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {lesson.paid ? 'Оплачено' : 
                       lesson.status === 'completed' ? 'Проведено' :
                       lesson.status === 'cancelled' ? 'Отменено' : 'Запланировано'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <CalendarIcon size={16} className="text-gray-400" />
                    <span className="text-sm">
                      {new Date(lesson.date).toLocaleDateString('ru-RU')}
                    </span>
                    <Clock size={16} className="text-gray-400 ml-2" />
                    <span className="text-sm">{lesson.startTime} - {lesson.endTime}</span>
                  </div>
                  {lesson.price > 0 && (
                    <div className="mt-2 text-right font-medium">
                      {lesson.price.toLocaleString('ru-RU')} ₽
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Модальное окно */}
      <LessonModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        lesson={editingLesson}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />
    </div>
  );
};