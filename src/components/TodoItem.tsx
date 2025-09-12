import React from 'react';
import { Check, X, Edit2, Trash2 } from 'lucide-react';
import type { Todo } from '../config/gemini';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(todo.text);
  const [showActions, setShowActions] = React.useState(false);

  const handleEdit = () => {
    if (isEditing) {
      onEdit(todo.id, editText);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work': return 'bg-blue-100 text-blue-700';
      case 'personal': return 'bg-green-100 text-green-700';
      case 'shopping': return 'bg-purple-100 text-purple-700';
      case 'health': return 'bg-red-100 text-red-700';
      case 'learning': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div 
      className={`group flex items-start lg:items-center space-x-3 lg:space-x-4 p-4 lg:p-5 bg-white/90 backdrop-blur-xl rounded-xl border border-red-100 hover:bg-white hover:shadow-lg transition-all duration-200 animate-slide-up transform hover:scale-[1.02] ${
        todo.completed ? 'opacity-60' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id, !todo.completed)}
        className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
          todo.completed
            ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-500 text-white shadow-md'
            : 'border-gray-300 hover:border-green-500 hover:bg-green-50 hover:shadow-sm'
        }`}
      >
        {todo.completed && <Check size={14} className="animate-bounce-gentle" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full px-4 py-2 text-gray-900 bg-white border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-500 shadow-md font-medium"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEdit();
              if (e.key === 'Escape') handleCancel();
            }}
          />
        ) : (
          <div className="flex-1 min-w-0">
            <p className={`text-gray-900 font-medium lg:text-lg ${
              todo.completed ? 'line-through text-gray-500' : ''
            }`}>
              {todo.text}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {todo.category && (
                <span className={`px-3 py-1 text-xs font-medium rounded-lg shadow-sm ${getCategoryColor(todo.category)}`}>
                  {todo.category}
                </span>
              )}
              {todo.priority && (
                <span className={`px-3 py-1 text-xs font-medium rounded-lg bg-gray-100 shadow-sm ${getPriorityColor(todo.priority)}`}>
                  {todo.priority}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={`flex items-center space-x-2 transition-all duration-200 ${
        showActions || isEditing ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}>
        {isEditing ? (
          <>
            <button
              onClick={handleEdit}
              className="p-2 text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg transition-all duration-200 hover:scale-110 group shadow-md"
            >
              <Check size={14} className="group-hover:animate-bounce-gentle" />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 group"
            >
              <X size={14} className="group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleEdit}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110 group"
            >
              <Edit2 size={14} className="group-hover:animate-pulse" />
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110 group"
            >
              <Trash2 size={14} className="group-hover:animate-bounce-gentle" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TodoItem;