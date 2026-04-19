'use client';

import { useState, useEffect } from 'react';
import { isAuthenticated } from '@/lib/auth';
import PasswordPrompt from '@/components/PasswordPrompt';
import SubmitForm from '@/components/SubmitForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SubmitPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    setAuthenticated(isAuthenticated());
    setIsLoading(false);
  }, []);

  const handleAuthenticated = () => {
    setAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <PasswordPrompt onAuthenticated={handleAuthenticated} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />
      <div className="flex-1">
        <SubmitForm />
      </div>
      <Footer />
    </div>
  );
}
