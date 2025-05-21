import { Fragment } from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  if (!items || items.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex py-3 text-sm">
      <ol className="flex flex-wrap items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={item.url}>
              <li className="flex items-center">
                {isLast ? (
                  <span className="text-gray-600 font-medium" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    {item.name}
                  </Link>
                )}
              </li>

              {!isLast && (
                <li className="text-gray-400 mx-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
} 