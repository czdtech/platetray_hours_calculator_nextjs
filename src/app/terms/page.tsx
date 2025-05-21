import type { Metadata } from 'next';
import { Article } from '@/components/semantic/Article';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://planetaryhours.org';

export const metadata: Metadata = {
  title: 'Terms of Service | Planetary Hours Calculator',
  description: 'Review the terms and conditions for using the Planetary Hours Calculator.',
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  openGraph: {
    title: 'Terms of Service | Planetary Hours Calculator',
    description: 'Review the terms and conditions for using the Planetary Hours Calculator.',
    url: `${SITE_URL}/terms`,
    type: 'article',
  },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Article className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Terms of Service</h2>
        <p className="text-gray-500 italic mb-8">Last updated: April 8, 2025</p>

        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">1. Agreement to Terms</h3>
          <p className="text-gray-600 mb-4">
            By accessing and using our Planetary Hours Calculator service (the "Service"), you agree to be
            bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you
            may not access the Service.
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">2. Use License</h3>
          <p className="text-gray-600 mb-4">
            Permission is granted to temporarily use the calculator and view the materials on Planetary Hours
            Calculator's website for personal, non-commercial transitory viewing only. This is the grant of a
            license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>attempt to decompile or reverse engineer any software contained on the website;</li>
            <li>remove any copyright or other proprietary notations from the materials;</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
          <p className="text-gray-600 mb-4">
            This license shall automatically terminate if you violate any of these restrictions and may be
            terminated by Planetary Hours Calculator at any time.
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">3. Disclaimer</h3>
          <p className="text-gray-600 mb-4">
            The materials and calculations on Planetary Hours Calculator's website are provided on an 'as is' basis.
            We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties
            including, without limitation, implied warranties or conditions of merchantability, fitness for a
            particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          <p className="text-gray-600 mb-4">
            Further, Planetary Hours Calculator does not warrant or make any representations concerning the
            accuracy, likely results, or reliability of the use of the materials on its website or otherwise
            relating to such materials or on any sites linked to this site. The calculations are based on
            traditional astrological methods and are provided for informational and entertainment purposes
            only. They should not be used as a substitute for professional advice.
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">4. Limitations</h3>
          <p className="text-gray-600 mb-4">
            In no event shall Planetary Hours Calculator or its suppliers be liable for any damages (including,
            without limitation, damages for loss of data or profit, or due to business interruption) arising out
            of the use or inability to use the materials on Planetary Hours Calculator's website, even if
            Planetary Hours Calculator or a Planetary Hours Calculator authorized representative has been
            notified orally or in writing of the possibility of such damage.
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">5. Accuracy of Materials</h3>
          <p className="text-gray-600 mb-4">
            The materials appearing on Planetary Hours Calculator's website could include technical,
            typographical, or photographic errors. Planetary Hours Calculator does not warrant that any of the
            materials on its website are accurate, complete or current.
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">6. Links</h3>
          <p className="text-gray-600 mb-4">
            Planetary Hours Calculator has not reviewed all of the sites linked to its website and is not
            responsible for the contents of any such linked site. The inclusion of any link does not imply
            endorsement by Planetary Hours Calculator of the site. Use of any such linked website is at the
            user's own risk.
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">7. Modifications</h3>
          <p className="text-gray-600 mb-4">
            Planetary Hours Calculator may revise these terms of service for its website at any time without
            notice. By using this website you are agreeing to be bound by the then current version of these
            terms of service.
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">8. Governing Law</h3>
          <p className="text-gray-600 mb-4">
            These terms and conditions are governed by and construed in accordance with the laws of
            [Placeholder: Your Jurisdiction] and you irrevocably submit to the exclusive jurisdiction of the
            courts in that State or location.
          </p>
        </section>
      </Article>
    </div>
  );
} 