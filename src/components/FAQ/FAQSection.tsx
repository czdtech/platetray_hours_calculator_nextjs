import { JsonLd } from "@/components/SEO/JsonLd";
import { getFAQPageSchema } from "@/utils/seo/jsonld";
import type { Locale } from "@/i18n/config";
import { getMessagesSync, type Messages } from "@/i18n/getMessages";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  includeSchema?: boolean;
  locale?: Locale;
  messages?: Messages;
  title?: string;
}

export function FAQSection({
  faqs,
  includeSchema = true,
  locale = "en",
  messages,
  title,
}: FAQSectionProps) {
  const resolvedMessages = messages ?? getMessagesSync(locale);
  const heading = title ?? resolvedMessages.blog.faq;
  const schema = includeSchema ? getFAQPageSchema(faqs) : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {schema && <JsonLd data={schema} />}
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
        {heading}
      </h2>

      <div className="space-y-6">
        {faqs.map((faq, index) => {
          const slug = faq.question
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          return (
            <div
              key={index}
              id={`faq-${slug}`}
              className={`border-b border-gray-200 dark:border-gray-700 pb-5 ${
                index === faqs.length - 1 ? "border-b-0" : ""
              }`}
            >
              <h3 className="text-lg font-medium text-purple-700 dark:text-purple-400 mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
