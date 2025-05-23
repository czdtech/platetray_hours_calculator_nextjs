import React from "react";

interface PageHeroProps {
  title: string;
  description?: string;
  centered?: boolean;
  bgColor?: string;
  textColor?: string;
}

export function PageHero({
  title,
  description,
  centered = true,
  bgColor = "bg-gradient-to-r from-blue-600 to-indigo-700",
  textColor = "text-white",
}: PageHeroProps) {
  return (
    <div className={`py-16 ${bgColor}`}>
      <div className="container mx-auto px-4">
        <div className={`${centered ? "text-center" : ""}`}>
          <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${textColor}`}>
            {title}
          </h1>
          {description && (
            <p
              className={`text-lg md:text-xl ${textColor} opacity-90 max-w-3xl ${centered ? "mx-auto" : ""}`}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
