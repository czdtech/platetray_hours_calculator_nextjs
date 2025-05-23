"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface NetworkErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function NetworkErrorMessage({
  message = "Network connection problem. Please check your internet connection and try again.",
  onRetry,
}: NetworkErrorMessageProps) {
  return (
    <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="flex-grow">
          <p className="text-red-700 mb-2">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700 transition-colors gap-1.5"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
