import { JsonLd } from '@/components/SEO/JsonLd';
import { getFAQPageSchema } from '@/utils/seo/jsonld';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const schema = getFAQPageSchema(faqs);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <JsonLd data={schema} />
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
        Frequently Asked Questions
      </h2>
      
      <div className="space-y-6">
        {faqs.map((faq, index) => {
          const slug = faq.question.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return (
          <div 
            key={index}
            id={`faq-${slug}`}
            className={`border-b border-gray-200 pb-5 ${
              index === faqs.length - 1 ? 'border-b-0' : ''
            }`}
          >
            <h3 className="text-lg font-medium text-purple-700 mb-2">
              Q: {faq.question}
            </h3>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
          );
        })}
      </div>
    </div>
  );
} 