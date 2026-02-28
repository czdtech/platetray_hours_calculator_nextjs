import { formatDistanceToNow, format } from "date-fns";
import type { Locale } from "@/i18n/config";
import { getMessagesSync, type Messages } from "@/i18n/getMessages";
import { getDateFnsLocale } from "@/utils/dateLocale";

interface ArticleMetaProps {
  author?: string;
  date: string; // ISO 格式日期
  readingTime?: number; // 单位：分钟
  className?: string; // 新增自定义className
  locale?: Locale;
  messages?: Messages;
}

/**
 * 显示文章元数据：作者、日期、阅读时间
 */
export function ArticleMeta({
  author,
  date,
  readingTime,
  className = "",
  locale = "en",
  messages,
}: ArticleMetaProps) {
  const resolvedMessages = messages ?? getMessagesSync(locale);
  const dateLocale = getDateFnsLocale(locale);
  const parsedDate = new Date(date);
  const displayAuthor = author ?? resolvedMessages.blog.author;
  const formattedDate = format(parsedDate, "MMMM d, yyyy", { locale: dateLocale });
  const timeAgo = formatDistanceToNow(parsedDate, { addSuffix: true, locale: dateLocale });

  return (
    <div
      className={`flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-4 ${className}`}
    >
      <address className="flex items-center mr-6 mb-2 not-italic">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1.5 text-indigo-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span>{displayAuthor}</span>
      </address>

      <div className="flex items-center mr-6 mb-2" title={formattedDate}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1.5 text-indigo-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <time dateTime={date}>{timeAgo}</time>
      </div>

      {readingTime && (
        <div className="flex items-center mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1.5 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {typeof readingTime === "number"
              ? `${readingTime} ${resolvedMessages.blog.minRead}`
              : readingTime}
          </span>
        </div>
      )}
    </div>
  );
}
