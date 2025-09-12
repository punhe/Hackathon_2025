import { useState, useEffect } from 'react';
import './App.css';
import type { Todo } from './config/gemini';
import { validateEnv } from './config/env';
import { addTodo, getTodos, updateTodo, deleteTodo } from './services/todoService';
import { generateSmartSuggestions } from './config/gemini';
import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';
import CalendarView from './components/Calendar';
import SuggestionModal from './components/SuggestionModal';
import LoadingOverlay from './components/LoadingOverlay';
import AISupportModal from './components/AISupportModal';
import SkeletonLoader from './components/SkeletonLoader';
import { BarChart3, Calendar, CheckSquare, Sparkles, LogOut, User, Bot } from 'lucide-react';
import { auth } from './config/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import Auth from './components/Auth';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [category, setCategory] = useState<string>('all');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'schedule'>('tasks');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAISupportOpen, setIsAISupportOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Check environment variables on startup
  useEffect(() => {
    if (!validateEnv()) {
      alert('Please configure the required environment variables in the .env file');
    }
  }, []);

  // Monitor authentication state
  useEffect(() => {
    setIsInitializing(true);
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && !hasInitialized) {
        await loadTodos();
        setHasInitialized(true);
      } else if (!u) {
        setTodos([]);
        setHasInitialized(true);
      }
      
      // Add delay for smooth transition
      setTimeout(() => {
        setIsInitializing(false);
      }, 800);
    });
    return () => unsubscribe();
  }, [hasInitialized]);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const todosData = await getTodos();
      setTodos(todosData);
    } catch (error) {
      console.error('Error loading todos:', error);
      alert('Unable to load todo list. Please check Firestore connection.');
    } finally {
      // Add delay for smooth transition
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleAddTodo = async (text: string, scheduledDate?: Date, scheduledTime?: string, overrides?: Partial<{ category: string; priority: 'low' | 'medium' | 'high' }>) => {
    try {
      await addTodo(text, scheduledDate, scheduledTime, overrides);
      await loadTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('Unable to add todo. Please try again.');
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<Todo & { scheduledDate?: Date; scheduledTime?: string }>) => {
    try {
      await updateTodo(id, updates);
      await loadTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('Unable to update todo. Please try again.');
    }
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      await updateTodo(id, { completed });
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed } : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('Unable to update todo. Please try again.');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Unable to delete todo. Please try again.');
    }
  };

  const handleEditTodo = async (id: string, newText: string) => {
    try {
      await updateTodo(id, { text: newText });
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, text: newText } : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('Unable to update todo. Please try again.');
    }
  };

  const handleGenerateSuggestions = async () => {
    try {
      setIsGenerating(true);
      const newSuggestions = await generateSmartSuggestions(todos);
      setSuggestions(newSuggestions);
      setIsSuggestionModalOpen(true);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Provide fallback suggestions based on common daily activities
      const fallbackSuggestions = [
        "Review and organize your workspace",
        "Take a 10-minute break and stretch",
        "Check and respond to important messages",
        "Plan tomorrow's top 3 priorities",
        "Drink a glass of water and take deep breaths"
      ];
      setSuggestions(fallbackSuggestions);
      setIsSuggestionModalOpen(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScheduleTasks = async (tasks: Array<{ title: string; date: Date; time?: string }>) => {
    try {
      // Add each task with a small delay for smooth UX
      for (const task of tasks) {
        await handleAddTodo(task.title, task.date, task.time);
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    } catch (error) {
      console.error('Error scheduling tasks:', error);
      alert('Some tasks could not be scheduled. Please try again.');
    }
  };

  const handleAddSuggestion = (text: string) => {
    handleAddTodo(text);
    setIsSuggestionModalOpen(false);
  };

  const categories = ['all', 'work', 'personal', 'shopping', 'health', 'learning', 'other'];
  const activeTodos = todos.filter(todo => !todo.completed).length;
  const completedTodos = todos.filter(todo => todo.completed).length;

  if (!user && !isInitializing) {
    return <Auth />;
  }

  // Show skeleton loading during initialization
  if (isInitializing || (!hasInitialized && user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-60" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f87171' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Sidebar Skeleton */}
        <SkeletonLoader type="sidebar" />
        
        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col relative z-10">
          {/* Header Skeleton */}
          <SkeletonLoader type="header" />
          
          {/* Content Skeleton */}
          <div className="flex-1 p-4 lg:p-6">
            <div className="mb-6">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-red-100 shadow-lg p-4 lg:p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl shimmer"></div>
                  <div className="flex-1 h-12 bg-gray-200 rounded-xl shimmer"></div>
                  <div className="w-20 h-12 bg-gray-200 rounded-xl shimmer"></div>
                </div>
              </div>
            </div>
            
            <SkeletonLoader type="todo" count={5} />
          </div>
        </div>
        
        {/* Loading overlay for smooth transition */}
        <LoadingOverlay isVisible={true} message="Initializing your workspace..." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-60" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f87171' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Sidebar Skeleton */}
        <SkeletonLoader type="sidebar" />
        
        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col relative z-10">
          {/* Header Skeleton */}
          <SkeletonLoader type="header" />
          
          {/* Content Skeleton */}
          <div className="flex-1 p-4 lg:p-6">
            <div className="mb-6">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-red-100 shadow-lg p-4 lg:p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl shimmer"></div>
                  <div className="flex-1 h-12 bg-gray-200 rounded-xl shimmer"></div>
                  <div className="w-20 h-12 bg-gray-200 rounded-xl shimmer"></div>
                </div>
              </div>
            </div>
            
            <SkeletonLoader type="todo" count={4} />
          </div>
        </div>
        
        {/* Subtle loading overlay */}
        <LoadingOverlay isVisible={true} message="Loading your tasks..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex flex-col lg:flex-row relative overflow-hidden animate-fade-in">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-60" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f87171' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Sidebar */}
      <div className="w-full lg:w-64 bg-white/90 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-red-100 flex flex-col shadow-xl relative z-10 animate-slide-in-right">
        {/* Logo */}
        <div className="p-6 border-b border-red-100 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg relative">
              <CheckSquare className="w-6 h-6 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-red-300 to-red-400 rounded-xl blur-lg opacity-30 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">TaskTrack</h1>
              <p className="text-xs text-gray-500 font-medium">AI-Powered Suite</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          {/* Main Tabs */}
          <div className="space-y-2 mb-6">
            <button 
              onClick={() => {
                if (activeTab !== 'tasks') {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setActiveTab('tasks');
                    setIsTransitioning(false);
                  }, 150);
                }
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 hover:shadow-md group ${
                activeTab === 'tasks' 
                  ? 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-red-50'
              }`}
            >
              <CheckSquare className={`w-5 h-5 transition-colors ${
                activeTab === 'tasks' ? 'text-white' : 'group-hover:text-red-500'
              }`} />
              <span className="font-medium">All Tasks</span>
            </button>
            <button 
              onClick={() => {
                if (activeTab !== 'schedule') {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setActiveTab('schedule');
                    setIsTransitioning(false);
                  }, 150);
                }
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 hover:shadow-md group ${
                activeTab === 'schedule' 
                  ? 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-red-50'
              }`}
            >
              <Calendar className={`w-5 h-5 transition-colors ${
                activeTab === 'schedule' ? 'text-white' : 'group-hover:text-red-500'
              }`} />
              <span className="font-medium">Schedule</span>
            </button>
          </div>

          {/* Secondary Navigation - Only show for Tasks tab */}
          {activeTab === 'tasks' && (
            <nav className="space-y-2 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible">
              <button className="flex-shrink-0 lg:w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md group">
                <Calendar className="w-5 h-5 group-hover:text-red-500 transition-colors" />
                <span className="font-medium group-hover:text-red-600 hidden sm:block">Today</span>
              </button>
              <button className="flex-shrink-0 lg:w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md group">
                <BarChart3 className="w-5 h-5 group-hover:text-red-500 transition-colors" />
                <span className="font-medium group-hover:text-red-600 hidden sm:block">Upcoming</span>
              </button>
            </nav>
          )}

          {/* Categories - Only show for Tasks tab */}
          {activeTab === 'tasks' && (
            <div className="mt-6 hidden lg:block">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.slice(1).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 group ${
                      category === cat 
                        ? 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md' 
                        : 'text-gray-600 hover:bg-red-50 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      cat === 'work' ? 'bg-blue-500' :
                      cat === 'personal' ? 'bg-green-500' :
                      cat === 'shopping' ? 'bg-purple-500' :
                      cat === 'health' ? 'bg-red-500' :
                      cat === 'learning' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="font-medium capitalize text-sm">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-red-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center shadow-md">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-red-100 px-6 lg:px-8 py-6 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="animate-fade-in">
              <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-2">
                {activeTab === 'tasks' ? (
                  filter === 'all' ? 'All Tasks' : 
                  filter === 'active' ? 'Active Tasks' : 
                  'Completed Tasks'
                ) : (
                  'Schedule Calendar'
                )}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse shadow-sm"></div>
                  <p className="text-gray-600 font-medium">
                    {activeTodos} active
                  </p>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-sm"></div>
                  <p className="text-gray-600 font-medium">
                    {completedTodos} completed
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsAISupportOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-300 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <Bot className="w-4 h-4 group-hover:animate-pulse relative z-10" />
                <span className="font-medium text-sm relative z-10">AI Support</span>
              </button>
              <button
                onClick={handleGenerateSuggestions}
                disabled={isGenerating}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-300 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <Sparkles className="w-4 h-4 group-hover:animate-spin relative z-10" />
                <span className="font-medium text-sm relative z-10">
                  {isGenerating ? 'Generating...' : 'AI Suggestions'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          {isTransitioning ? (
            /* Transition Loading */
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-600 font-medium">Loading...</p>
              </div>
            </div>
          ) : activeTab === 'tasks' ? (
            <>
              {/* Add Todo */}
              <div className="mb-6 animate-fade-in">
                <AddTodo 
                  onAddTodo={(text, overrides) => handleAddTodo(text, undefined, undefined, overrides)}
                />
              </div>

              {/* Filters */}
              <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
                      className="px-4 py-2 bg-white border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 text-gray-900"
                    >
                      <option value="all">All Tasks</option>
                      <option value="active">Active Tasks</option>
                      <option value="completed">Completed Tasks</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-gray-700">Category:</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="px-4 py-2 bg-white border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 text-gray-900"
                    >
                      <option value="all">All Categories</option>
                      {categories.slice(1).map(cat => (
                        <option key={cat} value={cat} className="capitalize">{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Todo List */}
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <TodoList
                  todos={todos}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                  onEdit={handleEditTodo}
                  filter={filter}
                  category={category}
                />
              </div>
            </>
          ) : (
            /* Calendar View */
            <div className="animate-fade-in">
              <CalendarView
                todos={todos}
                onAddTodo={handleAddTodo}
                onUpdateTodo={handleUpdateTodo}
                onDeleteTodo={handleDeleteTodo}
              />
            </div>
          )}
        </div>
      </div>

      {/* Suggestion Modal */}
      <SuggestionModal
        suggestions={suggestions}
        isOpen={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
        onAddSuggestion={handleAddSuggestion}
      />

      {/* AI Support Modal */}
      <AISupportModal
        isOpen={isAISupportOpen}
        onClose={() => setIsAISupportOpen(false)}
        onScheduleTasks={handleScheduleTasks}
      />
    </div>
  );
}

export default App