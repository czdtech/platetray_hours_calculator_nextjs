"use client";

import { WifiOff } from "lucide-react";

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

export function NetworkError({
  onRetry,
  message = "Network connection issue detected. Please check your internet connection and try again.",
}: NetworkErrorProps) {
  return (
    <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="bg-amber-100 p-3 rounded-full">
          <WifiOff size={24} className="text-amber-600" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-medium text-lg mb-1">Connection Error</h3>
          <p className="text-amber-700">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 sm:mt-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors duration-200 inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
