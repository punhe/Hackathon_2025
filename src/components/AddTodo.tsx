import React, { useState, useEffect, useRef } from 'react';
import { Plus, Wand2, Hash, Lightbulb, Check } from 'lucide-react';
import { categorizeTodo, generateTaskBreakdown } from '../config/gemini';

interface AddTodoProps {
  onAddTodo: (text: string, overrides?: Partial<{ category: string; priority: 'low' | 'medium' | 'high' }>) => void;
}

const AddTodo: React.FC<AddTodoProps> = ({ onAddTodo }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [autoLoading, setAutoLoading] = useState(false);
  const [taskBreakdown, setTaskBreakdown] = useState<string[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [addingProgress, setAddingProgress] = useState(0);
  const isProcessingRef = useRef(false);
  const lastProcessedTextRef = useRef('');

  // Auto-generate task breakdown when user types
  useEffect(() => {
    const timer = setTimeout(async () => {
      const currentText = text.trim();
      
      if (currentText.length > 10 && 
          !isProcessingRef.current && 
          currentText !== lastProcessedTextRef.current) {
        
        isProcessingRef.current = true;
        lastProcessedTextRef.current = currentText;
        
        try {
          setBreakdownLoading(true);
          const breakdown = await generateTaskBreakdown(currentText);
          setTaskBreakdown(breakdown);
          setShowBreakdown(breakdown.length > 0);
        } catch (error) {
          console.error('Error generating task breakdown:', error);
          setTaskBreakdown([]);
          setShowBreakdown(false);
        } finally {
          setBreakdownLoading(false);
          isProcessingRef.current = false;
        }
      } else if (currentText.length <= 10) {
        setShowBreakdown(false);
        setTaskBreakdown([]);
        lastProcessedTextRef.current = '';
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timer);
  }, [text]); // Only depend on text changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTodo(text.trim(), { category: category || undefined });
      setText('');
      setCategory('');
      setTaskBreakdown([]);
      setShowBreakdown(false);
      // Reset processing state
      isProcessingRef.current = false;
      lastProcessedTextRef.current = '';
    }
  };

  const handleAddBreakdownTask = (task: string) => {
    console.log('handleAddBreakdownTask called with:', task);
    console.log('Current breakdownLoading state:', breakdownLoading);
    console.log('Current showBreakdown state:', showBreakdown);
    
    onAddTodo(task, { category: category || undefined });
    // Remove the added task from breakdown
    setTaskBreakdown(prev => prev.filter(t => t !== task));
    if (taskBreakdown.length <= 1) {
      setShowBreakdown(false);
    }
  };

  const handleAddAllTasks = async () => {
    if (isAddingAll || taskBreakdown.length === 0) return;
    
    console.log('Add all tasks button clicked');
    console.log('Tasks to add:', taskBreakdown);
    
    setIsAddingAll(true);
    setAddingProgress(0);
    
    // Add tasks one by one with delay
    for (let i = 0; i < taskBreakdown.length; i++) {
      const task = taskBreakdown[i];
      
      // Update progress
      setAddingProgress(i + 1);
      
      // Add the task
      onAddTodo(task, { category: category || undefined });
      
      // Wait before adding next task (except for the last one)
      if (i < taskBreakdown.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay
      }
    }
    
    // Small delay before cleanup
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Clean up
    setTaskBreakdown([]);
    setShowBreakdown(false);
    setText('');
    setCategory('');
    setIsAddingAll(false);
    setAddingProgress(0);
    // Reset processing state
    isProcessingRef.current = false;
    lastProcessedTextRef.current = '';
  };

  const handleAutoCategory = async () => {
    if (!text.trim()) return;
    try {
      setAutoLoading(true);
      const cat = await categorizeTodo(text.trim());
      setCategory(cat);
    } finally {
      setAutoLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-red-100 shadow-lg animate-fade-in relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-red-100/50 rounded-2xl"></div>
      
      <form onSubmit={handleSubmit} className="p-4 lg:p-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Add button */}
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-110 group self-center lg:self-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-300 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-200 relative z-10" />
          </button>

          {/* Main input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done today?"
            className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-400 bg-white/80 border border-red-200 rounded-xl outline-none font-medium shadow-sm focus:shadow-lg focus:ring-2 focus:ring-red-300 focus:border-transparent transition-all duration-200"
          />

          {/* Category input and Auto button */}
          <div className="flex items-center space-x-3">
            {/* Category input */}
            <div className="flex items-center space-x-2 bg-white/80 rounded-xl px-3 py-2 border border-red-200 shadow-sm">
              <Hash className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="w-24 lg:w-28 text-sm text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0 font-medium"
              />
            </div>

            {/* Auto categorize button */}
            <button
              type="button"
              onClick={handleAutoCategory}
              disabled={!text.trim() || autoLoading}
              className="flex-shrink-0 px-3 py-2 text-sm bg-gradient-to-r from-red-400 to-red-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 hover:scale-105 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-300 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <Wand2 size={14} className="group-hover:animate-spin relative z-10" />
              <span className="font-medium hidden sm:block relative z-10">{autoLoading ? 'Auto...' : 'Auto'}</span>
            </button>
          </div>
        </div>
      </form>
      
      {/* Task Breakdown Suggestions */}
      {(showBreakdown || breakdownLoading) && (
        <div className="px-4 lg:px-6 pb-4 lg:pb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="w-4 h-4 text-red-500" />
              <h4 className="text-sm font-medium text-red-700">
                {breakdownLoading ? 'Analyzing task...' : 'Suggested breakdown:'}
              </h4>
            </div>
            
            {breakdownLoading ? (
              <div className="flex items-center space-x-2 animate-fade-in">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                <span className="text-sm text-red-600">Analyzing your task...</span>
                <div className="flex space-x-1 ml-2">
                  <div className="w-1 h-1 bg-red-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {taskBreakdown.map((task, index) => {
                  const isBeingAdded = isAddingAll && index < addingProgress;
                  const isCurrentlyAdding = isAddingAll && index === addingProgress - 1;
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-2 bg-white rounded-lg border transition-all duration-300 group animate-slide-up ${
                        isBeingAdded 
                          ? 'border-green-200 bg-green-50 opacity-60 transform scale-95' 
                          : isCurrentlyAdding 
                          ? 'border-red-300 bg-red-50 shadow-md scale-105' 
                          : 'border-red-100 hover:border-red-200'
                      }`} 
                      style={{ 
                        position: 'relative', 
                        zIndex: 10, 
                        animationDelay: `${index * 0.1}s`,
                        opacity: 0,
                        animationFillMode: 'forwards'
                      }}
                    >
                      <span className={`text-sm flex-1 pr-2 transition-colors duration-300 ${
                        isBeingAdded ? 'text-gray-500 line-through' : 'text-gray-700'
                      }`}>
                        {task}
                      </span>
                      
                      {isCurrentlyAdding ? (
                        <div className="ml-2 p-1 flex items-center space-x-1">
                          <div className="animate-spin rounded-full h-3 w-3 border border-red-500 border-t-transparent"></div>
                          <span className="text-xs text-red-600">Adding...</span>
                        </div>
                      ) : isBeingAdded ? (
                        <div className="ml-2 p-1 text-green-500">
                          <Check size={12} />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddBreakdownTask(task)}
                          disabled={isAddingAll}
                          className="ml-2 p-1 text-red-500 hover:bg-red-100 rounded transition-colors hover:scale-110 cursor-pointer flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Add this task"
                          style={{ pointerEvents: isAddingAll ? 'none' : 'auto', zIndex: 20 }}
                        >
                          <Plus size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-red-200" style={{ position: 'relative', zIndex: 15 }}>
                  <button
                    type="button"
                    onClick={handleAddAllTasks}
                    disabled={isAddingAll}
                    className={`text-xs font-medium hover:scale-105 transition-transform cursor-pointer flex items-center space-x-1 ${
                      isAddingAll ? 'text-red-400' : 'text-red-600 hover:text-red-700'
                    }`}
                    style={{ pointerEvents: isAddingAll ? 'none' : 'auto' }}
                  >
                    {isAddingAll ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border border-red-400 border-t-transparent"></div>
                        <span>Adding {addingProgress}/{taskBreakdown.length}...</span>
                      </>
                    ) : (
                      <span>Add all tasks</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Dismiss button clicked');
                      setShowBreakdown(false);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 hover:scale-105 transition-transform cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTodo;