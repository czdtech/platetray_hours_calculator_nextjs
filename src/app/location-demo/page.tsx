import { Metadata } from "next";
import { LocationDemo } from "@/components/Calculator/LocationDemo";

export const metadata: Metadata = {
  title: "Location Input Demo - Planetary Hours Calculator",
  description: "Demo page showcasing the enhanced location input with popular city shortcuts",
};

export default function LocationDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Enhanced Location Input Demo
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Experience the improved location input with popular city shortcuts
            </p>
          </div>
          
          <LocationDemo />
        </div>
      </div>
    </div>
  );
}