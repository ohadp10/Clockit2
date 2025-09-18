
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-orange-500" />; // Added warning icon
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-orange-50 border-orange-200'; // Added warning background
      default: return 'bg-blue-50 border-blue-200';
    }
  };
  
  const getTextColor = () => { // Added text color for better contrast
    switch (type) {
      case 'success': return 'text-green-800';
      case 'error': return 'text-red-800';
      case 'warning': return 'text-orange-800';
      default: return 'text-blue-800';
    }
  };

  return (
    <div className={`
      fixed top-4 left-4 z-50 max-w-sm p-4 rounded-lg shadow-lg border
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
      ${getBgColor()}
    `}>
      <div className="flex items-center gap-3">
        {getIcon()}
        <span className={`text-sm font-medium ${getTextColor()}`}>{message}</span>
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-gray-400 hover:text-gray-600 ml-auto" // Adjusted close button position
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-0 left-0 z-50 pointer-events-none">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          style={{ top: `${16 + index * 80}px` }}
          className="absolute pointer-events-auto"
        >
          <Toast 
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );

  return { addToast, ToastContainer };
}
