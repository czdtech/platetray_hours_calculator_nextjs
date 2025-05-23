"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // 可以在这里记录错误到监控服务
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
        <AlertCircle size={32} className="text-red-600" />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
        Something went wrong
      </h1>

      <p className="text-lg text-gray-600 max-w-md mb-8">
        We're sorry, an unexpected error has occurred. Our team has been
        notified.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-all duration-200 focus:ring-2 focus:ring-gray-300 focus:outline-none"
        >
          <RefreshCw size={18} />
          Try again
        </button>

        <Link
          href="/"
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:ring-2 focus:ring-purple-500/30 focus:outline-none"
        >
          Return to Homepage
        </Link>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg max-w-2xl overflow-x-auto text-left">
          <p className="font-medium text-red-600 mb-2">Error details:</p>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </div>
      )}
    </div>
  );
}
