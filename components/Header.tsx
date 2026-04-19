'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 gap-4">
          <div>
            <Link href="/" className="block">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                🔐 Steganography Service
              </h1>
            </Link>
            <p className="mt-1 text-sm text-gray-600 hidden sm:block">
              Hide messages in plain sight
            </p>
          </div>
          
          <nav className="flex flex-wrap gap-2 sm:gap-3">
            <Link
              href="/"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Gallery
            </Link>
            <Link
              href="/submit"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/submit')
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Submit
            </Link>
            <Link
              href="/extract"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/extract')
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Extract
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
