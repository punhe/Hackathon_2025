import React from 'react';
import { X, Plus } from 'lucide-react';

interface SuggestionModalProps {
  suggestions: string[];
  isOpen: boolean;
  onClose: () => void;
  onAddSuggestion: (text: string) => void;
}

const SuggestionModal: React.FC<SuggestionModalProps> = ({
  suggestions,
  isOpen,
  onClose,
  onAddSuggestion
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden border border-red-100">
        <div className="flex items-center justify-between p-6 border-b border-red-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">Daily Activity Suggestions</h2>
            <p className="text-sm text-gray-600 mt-1">Actionable tasks to boost your productivity</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
        
        <div className="p-6 max-h-96 overflow-y-auto">
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Plus size={20} className="text-red-500" />
              </div>
              <p className="text-gray-500 text-base font-medium">
                No suggestions available at the moment
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Try adding some tasks to get personalized suggestions
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-all duration-200 group"
                >
                  <span className="text-gray-900 flex-1 font-medium text-sm pr-3">{suggestion}</span>
                  <button
                    onClick={() => onAddSuggestion(suggestion)}
                    className="ml-3 p-2 text-white bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 rounded-lg transition-all duration-200 hover:scale-105 group shadow-md"
                  >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform duration-200" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end p-6 border-t border-red-100">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-200 hover:scale-105 font-medium text-sm shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionModal;