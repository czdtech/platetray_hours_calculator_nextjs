'use client';

import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  variant?: 'inline' | 'banner';
  className?: string;
}

export function ErrorMessage({ 
  message, 
  variant = 'inline',
  className = ''
}: ErrorMessageProps) {
  if (!message) return null;
  
  if (variant === 'banner') {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-fade-in ${className}`}>
        <div className="flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{message}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`text-sm text-red-600 mt-1 animate-fade-in flex items-center gap-2 ${className}`}>
      <AlertCircle size={14} />
      <span>{message}</span>
    </div>
  );
}