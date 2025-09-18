import React from 'react';
import { CheckCircle, Circle, ArrowLeft } from 'lucide-react';

export default function ProgressTracker({ currentStep, steps, className = "" }) {
  const stepsList = [
    { id: 'upload', title: 'העלאת וידאו', icon: '📱' },
    { id: 'client', title: 'בחירת לקוח', icon: '👥' },
    { id: 'schedule', title: 'תזמון פרסום', icon: '📅' },
    { id: 'complete', title: 'הושלם', icon: '✅' }
  ];

  const activeSteps = steps || stepsList;
  const currentIndex = activeSteps.findIndex(step => step.id === currentStep);

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-blue-600" />
          התקדמות
        </h3>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} מתוך {activeSteps.length}
        </span>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center justify-between">
          {activeSteps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isUpcoming = index > currentIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  ${isCompleted ? 'bg-green-500 text-white' : 
                    isCurrent ? 'bg-blue-500 text-white' : 
                    'bg-gray-200 text-gray-400'}
                  transition-all duration-300
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>
                
                <span className={`
                  text-xs mt-2 text-center
                  ${isCompleted ? 'text-green-600 font-medium' :
                    isCurrent ? 'text-blue-600 font-medium' :
                    'text-gray-400'}
                `}>
                  {step.title}
                </span>
                
                {index < activeSteps.length - 1 && (
                  <div className={`
                    hidden sm:block absolute h-0.5 w-16 mt-4 translate-x-8
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}