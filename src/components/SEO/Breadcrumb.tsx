import { Fragment as _Fragment } from "react";
import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <ol className="flex flex-wrap items-center text-gray-600 dark:text-gray-400">
      {items.map((item, index) => (
        <li key={item.url} className="flex items-center">
          {index > 0 && (
            <span className="mx-2 text-gray-400 dark:text-gray-500">/</span>
          )}

          {index === items.length - 1 ? (
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {item.name}
            </span>
          ) : (
            <Link
              href={item.url}
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {item.name}
            </Link>
          )}
        </li>
      ))}
    </ol>
  );
}
