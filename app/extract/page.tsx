'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { StegoMode, extract, ExtractionParams } from '@/lib/stego';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ExtractPage() {
  const [modifiedFile, setModifiedFile] = useState<File | null>(null);
  const [startBit, setStartBit] = useState<number>(0);
  const [periodicity, setPeriodicity] = useState<number>(8);
  const [mode, setMode] = useState<StegoMode>(StegoMode.FIXED);
  const [messageLength, setMessageLength] = useState<number>(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setModifiedFile(file);
    setErrors([]);
    setSuccess(false);
  };

  const handleStartBitChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setStartBit(isNaN(value) ? 0 : value);
    setErrors([]);
    setSuccess(false);
  };

  const handlePeriodicityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setPeriodicity(isNaN(value) ? 1 : value);
    setErrors([]);
    setSuccess(false);
  };

  const handleModeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setMode(e.target.value as StegoMode);
    setErrors([]);
    setSuccess(false);
  };

  const handleMessageLengthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setMessageLength(isNaN(value) ? 0 : value);
    setErrors([]);
    setSuccess(false);
  };

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    if (!modifiedFile) {
      validationErrors.push('Modified file is required');
    }

    if (startBit < 0) {
      validationErrors.push('Starting bit (S) must be >= 0');
    }
    if (periodicity <= 0) {
      validationErrors.push('Periodicity (L) must be > 0');
    }
    if (messageLength <= 0) {
      validationErrors.push('Message length must be > 0');
    }

    return validationErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!modifiedFile) {
      return;
    }

    setIsProcessing(true);

    try {
      const modifiedBuffer = await modifiedFile.arrayBuffer();

      const extractionParams: ExtractionParams = {
        startBit,
        periodicity,
        mode,
        messageLength,
        mimeType: modifiedFile.type,
      };

      const extractedMessage = extract(modifiedBuffer, extractionParams);

      const blob = new Blob([extractedMessage]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted_message';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : 'An error occurred during extraction'
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Extract Hidden Message</h1>
              <p className="mt-2 text-sm text-gray-600">
                Extract a secret message from a modified file using the correct parameters
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="modifiedFile" className="block text-sm font-medium text-gray-700">
                  Modified File
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  The file containing the hidden message
                </p>
                <input
                  id="modifiedFile"
                  name="modifiedFile"
                  type="file"
                  onChange={handleFileChange}
                  className="mt-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2"
                />
                {modifiedFile && (
                  <p className="mt-1 text-xs text-gray-600">
                    Selected: {modifiedFile.name} ({(modifiedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="startBit" className="block text-sm font-medium text-gray-700">
                  Starting Bit (S)
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Number of bits to skip at the beginning (must be ≥ 0). Note: File headers are automatically skipped.
                </p>
                <input
                  id="startBit"
                  name="startBit"
                  type="number"
                  min="0"
                  value={startBit}
                  onChange={handleStartBitChange}
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="periodicity" className="block text-sm font-medium text-gray-700">
                  Periodicity (L)
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Bit interval used during embedding (must be &gt; 0)
                </p>
                <input
                  id="periodicity"
                  name="periodicity"
                  type="number"
                  min="1"
                  value={periodicity}
                  onChange={handlePeriodicityChange}
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="mode" className="block text-sm font-medium text-gray-700">
                  Mode (C)
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Operation mode used during embedding
                </p>
                <select
                  id="mode"
                  name="mode"
                  value={mode}
                  onChange={handleModeChange}
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value={StegoMode.FIXED}>FIXED - L remains constant</option>
                  <option value={StegoMode.PATTERN_1}>PATTERN_1 - L cycles: 8, 16, 28</option>
                  <option value={StegoMode.PATTERN_2}>PATTERN_2 - L cycles: 8, 12, 16</option>
                </select>
              </div>

              <div>
                <label htmlFor="messageLength" className="block text-sm font-medium text-gray-700">
                  Message Length (bytes)
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  The size of the hidden message in bytes (must be &gt; 0)
                </p>
                <input
                  id="messageLength"
                  name="messageLength"
                  type="number"
                  min="1"
                  value={messageLength}
                  onChange={handleMessageLengthChange}
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {errors.length > 0 && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {errors.length === 1 ? 'Error' : 'Errors'}
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc list-inside space-y-1">
                          {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Success! Message extracted
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Your extracted message has been downloaded.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Extracting...</span>
                    </>
                  ) : (
                    'Extract Message and Download'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
