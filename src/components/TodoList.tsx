import React from 'react';
import TodoItem from './TodoItem';
import type { Todo } from '../config/gemini';
import { CheckSquare, Plus } from 'lucide-react';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  filter: 'all' | 'active' | 'completed';
  category: string;
}

const TodoList: React.FC<TodoListProps> = ({ 
  todos, 
  onToggle, 
  onDelete, 
  onEdit, 
  filter, 
  category 
}) => {
  const filteredTodos = todos.filter(todo => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && !todo.completed) || 
      (filter === 'completed' && todo.completed);
    
    const matchesCategory = category === 'all' || todo.category === category;
    
    return matchesFilter && matchesCategory;
  });

  if (filteredTodos.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="mx-auto mb-6 flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-red-400 to-red-500 shadow-lg animate-float relative">
          <CheckSquare className="text-white" size={36} />
          <div className="absolute inset-0 bg-gradient-to-br from-red-300 to-red-400 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
        </div>
        <div className="text-gray-900 text-3xl font-bold mb-4 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">All clear!</div>
        <p className="text-gray-600 max-w-lg mx-auto leading-relaxed font-medium">
          You have no pending tasks. Add a new one to get started and stay productive.
        </p>
        <div className="mt-8">
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/90 backdrop-blur-xl rounded-xl border border-red-100 shadow-lg">
            <Plus size={20} className="text-red-500" />
            <span className="text-gray-700 font-medium">Click the + button above to add your first task</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredTodos.map((todo, index) => (
        <div 
          key={todo.id} 
          className="animate-slide-up opacity-0" 
          style={{ 
            animationDelay: `${index * 0.05}s`,
            animationFillMode: 'forwards'
          }}
        >
          <TodoItem
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      ))}
    </div>
  );
};

export default TodoList;