import React, { useState } from 'react';
import { X, Bot, Calendar, Clock, Sparkles } from 'lucide-react';
import { generateTaskSchedule } from '../config/gemini';

interface AISupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleTasks: (tasks: Array<{ title: string; date: Date; time?: string }>) => void;
}

const AISupportModal: React.FC<AISupportModalProps> = ({ isOpen, onClose, onScheduleTasks }) => {
  const [taskDescription, setTaskDescription] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCount, setAppliedCount] = useState(0);
  const [generatedSchedule, setGeneratedSchedule] = useState<Array<{ title: string; day: number; time?: string }> | null>(null);

  const handleGenerateSchedule = async () => {
    if (!taskDescription.trim()) return;

    try {
      setIsGenerating(true);
      const schedule = await generateTaskSchedule(taskDescription.trim(), numberOfDays);
      setGeneratedSchedule(schedule);
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Unable to generate schedule. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySchedule = async () => {
    if (!generatedSchedule) return;

    setIsApplying(true);
    setAppliedCount(0);

    const baseDate = new Date(startDate);
    const scheduledTasks = generatedSchedule.map(task => ({
      title: task.title,
      date: new Date(baseDate.getTime() + (task.day - 1) * 24 * 60 * 60 * 1000),
      time: task.time
    }));

    try {
      // Apply tasks one by one with smooth progress
      for (let i = 0; i < scheduledTasks.length; i++) {
        const task = scheduledTasks[i];
        await onScheduleTasks([task]);
        setAppliedCount(i + 1);
        
        // Smooth delay between tasks
        if (i < scheduledTasks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Final delay before closing
      await new Promise(resolve => setTimeout(resolve, 800));
      handleClose();
    } catch (error) {
      console.error('Error applying schedule:', error);
      alert('Some tasks could not be scheduled. Please try again.');
    } finally {
      setIsApplying(false);
      setAppliedCount(0);
    }
  };

  const handleClose = () => {
    setTaskDescription('');
    setNumberOfDays(1);
    setStartDate(new Date().toISOString().split('T')[0]);
    setGeneratedSchedule(null);
    setIsGenerating(false);
    setIsApplying(false);
    setAppliedCount(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-red-500 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Task Scheduler</h3>
              <p className="text-sm text-gray-500">Let AI plan your work schedule intelligently</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!generatedSchedule ? (
            /* Input Form */
            <div className="space-y-6">
              {/* Task Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Describe your task or project
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="E.g., Prepare presentation for client meeting, including research, slides, and rehearsal..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors resize-none"
                  rows={4}
                />
              </div>

              {/* Duration Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Number of days to spread work
                  </label>
                  <select
                    value={numberOfDays}
                    onChange={(e) => setNumberOfDays(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 10, 14].map(days => (
                      <option key={days} value={days}>
                        {days} {days === 1 ? 'day' : 'days'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Start date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleGenerateSchedule}
                  disabled={!taskDescription.trim() || isGenerating}
                  className="px-6 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Generating Schedule...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate AI Schedule</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Generated Schedule */
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-lg font-bold text-gray-900 mb-2">AI Generated Schedule</h4>
                <p className="text-sm text-gray-600">Here's how AI suggests breaking down your task:</p>
              </div>

              {/* Schedule Preview */}
              <div className="bg-red-50 rounded-lg p-4 space-y-3">
                {generatedSchedule.map((task, index) => {
                  const taskDate = new Date(startDate);
                  taskDate.setDate(taskDate.getDate() + (task.day - 1));
                  const isCompleted = isApplying && index < appliedCount;
                  const isProcessing = isApplying && index === appliedCount;
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-green-100 border-green-200 opacity-60' 
                          : isProcessing 
                          ? 'bg-yellow-100 border-yellow-200 shadow-md scale-105' 
                          : 'bg-white border-red-100'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isProcessing 
                          ? 'bg-yellow-500 text-white animate-pulse' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {isCompleted ? '✓' : isProcessing ? '⏳' : task.day}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {taskDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          {task.time && (
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              {task.time}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm transition-colors duration-300 ${
                          isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'
                        }`}>
                          {task.title}
                        </p>
                        {isProcessing && (
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                            <div className="bg-yellow-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setGeneratedSchedule(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ← Back to Edit
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplySchedule}
                    disabled={isApplying}
                    className={`px-6 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                      isApplying 
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white cursor-not-allowed' 
                        : 'bg-gradient-to-r from-red-400 to-red-500 text-white hover:shadow-lg'
                    }`}
                  >
                    {isApplying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Applying {appliedCount}/{generatedSchedule.length}...</span>
                      </>
                    ) : (
                      <span>Apply Schedule</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISupportModal;