import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Edit, Trash2, X } from 'lucide-react';
import type { Todo } from '../config/gemini';

interface CalendarProps {
  todos: Todo[];
  onAddTodo: (text: string, date?: Date, time?: string) => void;
  onUpdateTodo: (id: string, updates: Partial<Todo & { scheduledDate?: Date; scheduledTime?: string }>) => void;
  onDeleteTodo: (id: string) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  todo: Todo;
}

const Calendar: React.FC<CalendarProps> = ({ todos, onAddTodo, onUpdateTodo, onDeleteTodo }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventTime, setEditEventTime] = useState('');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);

  // Get calendar events from scheduled todos
  const events = useMemo(() => {
    return todos
      .filter(todo => todo.scheduledDate)
      .map(todo => ({
        id: todo.id,
        title: todo.text,
        date: todo.scheduledDate!,
        time: todo.scheduledTime,
        todo
      }));
  }, [todos]);

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate calendar days
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 42); // 6 weeks

    for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }

    return days;
  };

  const days = getDaysInMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  // Handle adding new event
  const handleAddEvent = async () => {
    if (!newEventTitle.trim() || !selectedDate) return;

    setIsAddingEvent(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Smooth delay
      onAddTodo(newEventTitle.trim(), selectedDate, newEventTime || undefined);
      setNewEventTitle('');
      setNewEventTime('');
      setShowAddEvent(false);
      setSelectedDate(null);
    } finally {
      setIsAddingEvent(false);
    }
  };

  // Handle editing event
  const handleEditEvent = async () => {
    if (!editEventTitle.trim() || !selectedEvent) return;

    setIsUpdatingEvent(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Smooth delay
      onUpdateTodo(selectedEvent.id, {
        text: editEventTitle.trim(),
        scheduledTime: editEventTime || undefined
      });
      setEditEventTitle('');
      setEditEventTime('');
      setShowEditEvent(false);
      setSelectedEvent(null);
    } finally {
      setIsUpdatingEvent(false);
    }
  };

  // Handle deleting event
  const handleDeleteEvent = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setEventToDelete(event);
      setShowDeleteConfirm(true);
    }
  };

  // Confirm delete event
  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    setIsDeletingEvent(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200)); // Smooth delay
      onDeleteTodo(eventToDelete.id);
      setShowDeleteConfirm(false);
      setEventToDelete(null);
    } finally {
      setIsDeletingEvent(false);
    }
  };

  // Cancel delete event
  const cancelDeleteEvent = () => {
    setShowDeleteConfirm(false);
    setEventToDelete(null);
  };

  // Handle opening edit modal
  const handleOpenEdit = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setEditEventTitle(event.title);
    setEditEventTime(event.time || '');
    setShowEditEvent(true);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    e.stopPropagation();
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', event.title);
    
    // Add visual feedback to the dragged element
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDraggedEvent(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(date);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDate(null);
  };

  const handleDrop = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedEvent) return;
    
    try {
      // Update the event's date
      await onUpdateTodo(draggedEvent.id, {
        scheduledDate: targetDate,
        scheduledTime: draggedEvent.time // Keep the same time
      });
      
      setDraggedEvent(null);
      setDragOverDate(null);
    } catch (error) {
      console.error('Error moving event:', error);
      alert('Failed to move event. Please try again.');
    }
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-red-100 shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-red-500" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonthDay = isCurrentMonth(day);
          const isTodayDay = isToday(day);
          const isDragOver = dragOverDate?.toDateString() === day.toDateString();

          return (
            <div
              key={index}
              className={`relative min-h-[80px] p-1 border border-gray-100 transition-all duration-200 cursor-pointer group ${
                !isCurrentMonthDay ? 'bg-gray-50' : 'bg-white'
              } ${
                isTodayDay ? 'ring-2 ring-red-300' : ''
              } ${
                isDragOver ? 'bg-red-50 border-red-300 ring-2 ring-red-200 scale-105' : 'hover:bg-red-50'
              }`}
              onClick={(e) => {
                // Only open add event if clicking on empty space (not on existing events)
                if (isCurrentMonthDay && e.target === e.currentTarget) {
                  setSelectedDate(day);
                  setShowAddEvent(true);
                }
              }}
              onDragOver={(e) => isCurrentMonthDay && handleDragOver(e, day)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => isCurrentMonthDay && handleDrop(e, day)}
            >
              <div className={`text-sm font-medium ${
                !isCurrentMonthDay ? 'text-gray-400' : 
                isTodayDay ? 'text-red-600' : 'text-gray-900'
              }`}>
                {day.getDate()}
              </div>

              {/* Events for this day */}
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, event)}
                    onDragEnd={handleDragEnd}
                    className={`relative group text-xs p-1 bg-red-100 text-red-700 rounded truncate transition-all duration-200 border border-red-200 calendar-event-draggable ${
                      draggedEvent?.id === event.id 
                        ? 'opacity-50 transform rotate-2 z-50' 
                        : 'hover:bg-red-200 hover:border-red-300'
                    }`}
                    title={`${event.title} - Drag to move or click to edit`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(event, e);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 truncate pointer-events-none">
                        {event.time && <span className="font-medium">{event.time}</span>}
                        <span className={event.time ? 'ml-1' : ''}>{event.title}</span>
                      </div>
                      
                      {/* Edit and Delete buttons - show on hover */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(event, e);
                          }}
                          className="w-3 h-3 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors z-10"
                          title="Edit event"
                        >
                          <Edit size={8} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                          className="w-3 h-3 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                          title="Delete event"
                        >
                          <Trash2 size={6} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div 
                    className="text-xs text-gray-500 hover:text-red-600 cursor-pointer transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Could open a modal showing all events for this day
                      console.log('Show all events for', day.toDateString());
                    }}
                  >
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>

              {/* Add button on hover */}
              {isCurrentMonthDay && (
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(day);
                      setShowAddEvent(true);
                    }}
                    className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    title="Add new event"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Event Modal */}
      {showAddEvent && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">
                Add Event - {selectedDate.toLocaleDateString()}
              </h4>
              <button
                onClick={() => {
                  setShowAddEvent(false);
                  setSelectedDate(null);
                  setNewEventTitle('');
                  setNewEventTime('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Enter event title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time (Optional)
                </label>
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddEvent(false);
                  setSelectedDate(null);
                  setNewEventTitle('');
                  setNewEventTime('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                disabled={isAddingEvent}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  isAddingEvent 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-400 to-red-500 text-white hover:shadow-lg'
                }`}
              >
                {isAddingEvent ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <span>Add Event</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditEvent && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">
                Edit Event - {selectedEvent.date.toLocaleDateString()}
              </h4>
              <button
                onClick={() => {
                  setShowEditEvent(false);
                  setSelectedEvent(null);
                  setEditEventTitle('');
                  setEditEventTime('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={editEventTitle}
                  onChange={(e) => setEditEventTitle(e.target.value)}
                  placeholder="Enter event title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time (Optional)
                </label>
                <input
                  type="time"
                  value={editEventTime}
                  onChange={(e) => setEditEventTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => {
                  handleDeleteEvent(selectedEvent.id);
                  setShowEditEvent(false);
                  setSelectedEvent(null);
                }}
                disabled={isUpdatingEvent}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  isUpdatingEvent 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-red-500 text-white hover:bg-red-600 hover:scale-105'
                }`}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowEditEvent(false);
                    setSelectedEvent(null);
                    setEditEventTitle('');
                    setEditEventTime('');
                  }}
                  disabled={isUpdatingEvent}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditEvent}
                  disabled={isUpdatingEvent}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    isUpdatingEvent
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-gradient-to-r from-red-400 to-red-500 text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {isUpdatingEvent ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && eventToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-red-500 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Delete Event</h4>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {eventToDelete.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {eventToDelete.date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      {eventToDelete.time && (
                        <span className="ml-2 text-red-600 font-medium">
                          at {eventToDelete.time}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mt-4 text-center">
                Are you sure you want to delete this event?
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteEvent}
                disabled={isDeletingEvent}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteEvent}
                disabled={isDeletingEvent}
                className={`px-6 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  isDeletingEvent 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:scale-105'
                }`}
              >
                {isDeletingEvent ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete Event</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;