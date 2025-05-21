import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-8">
      <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
        <p>
          © 2025 Planetary Hours Calculator |{' '}
          <Link href="/about" className="text-purple-700 underline hover:text-purple-800">About</Link> |{' '}
          <Link href="/privacy" className="text-purple-700 underline hover:text-purple-800">Privacy Policy</Link> |{' '}
          <Link href="/terms" className="text-purple-700 underline hover:text-purple-800">Terms of Service</Link>
        </p>
      </div>
    </footer>
  );
}