import Link from "next/link";
import { Header } from "@/components/Layout/Header";

export default function BlogNotFound() {
  return (
    <>
      <Header activePage="calculator" />
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-indigo-400 bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-2xl md:text-3xl font-medium text-gray-700 mb-4">
          Blog Post Not Found
        </p>
        <p className="text-lg text-gray-600 max-w-md mb-8">
          The blog post you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/blog"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:ring-2 focus:ring-purple-500/30 focus:outline-none"
          >
            Browse All Posts
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200 focus:ring-2 focus:ring-gray-300 focus:outline-none"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </>
  );
} 