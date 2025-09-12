import React from 'react';
import { CheckSquare } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message = "Loading..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="text-center animate-scale-in">
        <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float relative">
          <CheckSquare className="w-8 h-8 text-white animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-red-300 to-red-400 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-2">
          TaskTrack
        </h3>
        <p className="text-gray-600 font-medium">{message}</p>
        <div className="mt-4 flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;