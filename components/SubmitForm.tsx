'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { StegoMode, embed, calculateCapacity } from '@/lib/stego';

const MAX_CARRIER_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_MESSAGE_SIZE = 5 * 1024 * 1024;  // 5MB

export default function SubmitForm() {
  const [carrierFile, setCarrierFile] = useState<File | null>(null);
  const [messageFile, setMessageFile] = useState<File | null>(null);
  const [startBit, setStartBit] = useState<number>(0);
  const [periodicity, setPeriodicity] = useState<number>(8);
  const [mode, setMode] = useState<StegoMode>(StegoMode.FIXED);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [usedParams, setUsedParams] = useState<{
    S: number;
    L: number;
    C: StegoMode;
    messageLength: number;
  } | null>(null);

  const handleCarrierChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCarrierFile(file);
    setErrors([]);
    setSuccess(false);
  };

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMessageFile(file);
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

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    // Check required files
    if (!carrierFile) {
      validationErrors.push('Carrier file is required');
    }
    if (!messageFile) {
      validationErrors.push('Message file is required');
    }

    // Validate file sizes
    if (carrierFile && carrierFile.size > MAX_CARRIER_SIZE) {
      validationErrors.push(`Carrier file must be less than 50MB (current: ${(carrierFile.size / 1024 / 1024).toFixed(2)}MB)`);
    }
    if (messageFile && messageFile.size > MAX_MESSAGE_SIZE) {
      validationErrors.push(`Message file must be less than 5MB (current: ${(messageFile.size / 1024 / 1024).toFixed(2)}MB)`);
    }

    // Validate parameters
    if (startBit < 0) {
      validationErrors.push('Starting bit (S) must be >= 0');
    }
    if (periodicity <= 0) {
      validationErrors.push('Periodicity (L) must be > 0');
    }

    return validationErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);
    setUsedParams(null);

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!carrierFile || !messageFile) {
      return;
    }

    setIsProcessing(true);

    try {
      // Read files as ArrayBuffer
      const carrierBuffer = await carrierFile.arrayBuffer();
      const messageBuffer = await messageFile.arrayBuffer();

      // Check capacity
      const carrierBits = carrierBuffer.byteLength * 8;
      const messageBits = messageBuffer.byteLength * 8;
      const capacity = calculateCapacity(carrierBits, {
        startBit,
        periodicity,
        mode,
      });

      if (messageBits > capacity) {
        setErrors([
          `Insufficient capacity: carrier can hold ${capacity} bits (${Math.floor(capacity / 8)} bytes), but message requires ${messageBits} bits (${messageBuffer.byteLength} bytes)`
        ]);
        setIsProcessing(false);
        return;
      }

      // Embed message
      const modifiedCarrier = embed(carrierBuffer, messageBuffer, {
        startBit,
        periodicity,
        mode,
        mimeType: carrierFile.type,
      });

      // Create blob and trigger download
      const blob = new Blob([modifiedCarrier], { type: carrierFile.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `modified_${carrierFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Store parameters for display
      setUsedParams({
        S: startBit,
        L: periodicity,
        C: mode,
        messageLength: messageBuffer.byteLength,
      });

      setSuccess(true);
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : 'An error occurred during processing'
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Submit Steganography</h1>
            <p className="mt-2 text-sm text-gray-600">
              Hide a secret message inside a carrier file
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Carrier File Input */}
            <div>
              <label htmlFor="carrier" className="block text-sm font-medium text-gray-700">
                Carrier File (P)
              </label>
              <p className="mt-1 text-xs text-gray-500">
                The file that will contain the hidden message (max 50MB)
              </p>
              <input
                id="carrier"
                name="carrier"
                type="file"
                onChange={handleCarrierChange}
                className="mt-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2"
              />
              {carrierFile && (
                <p className="mt-1 text-xs text-gray-600">
                  Selected: {carrierFile.name} ({(carrierFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Message File Input */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message File (M)
              </label>
              <p className="mt-1 text-xs text-gray-500">
                The secret file to hide (max 5MB)
              </p>
              <input
                id="message"
                name="message"
                type="file"
                onChange={handleMessageChange}
                className="mt-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2"
              />
              {messageFile && (
                <p className="mt-1 text-xs text-gray-600">
                  Selected: {messageFile.name} ({(messageFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Starting Bit Input */}
            <div>
              <label htmlFor="startBit" className="block text-sm font-medium text-gray-700">
                Starting Bit (S)
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Number of bits to skip at the beginning (must be ≥ 0). Note: File headers are automatically skipped to prevent corruption.
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

            {/* Periodicity Input */}
            <div>
              <label htmlFor="periodicity" className="block text-sm font-medium text-gray-700">
                Periodicity (L)
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Bit interval for embedding (must be &gt; 0)
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

            {/* Mode Selection */}
            <div>
              <label htmlFor="mode" className="block text-sm font-medium text-gray-700">
                Mode (C)
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Operation mode for periodicity pattern
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

            {/* Error Messages */}
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

            {/* Success Message with Parameters */}
            {success && usedParams && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Success! File downloaded
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p className="mb-2">Your modified file has been downloaded.</p>
                      <p className="font-semibold mb-1">Extraction Parameters:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Starting Bit (S): {usedParams.S}</li>
                        <li>Periodicity (L): {usedParams.L}</li>
                        <li>Mode (C): {usedParams.C}</li>
                        <li>Message Length: {usedParams.messageLength} bytes</li>
                      </ul>
                      <p className="mt-3 text-xs">
                        Save these parameters - you&apos;ll need them to extract the message later!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Gallery Instructions */}
            {success && (
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Adding to Gallery (Manual Process)
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p className="mb-2">To add this file to the public gallery:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Save the downloaded file to the <code className="bg-blue-100 px-1 rounded">/public/gallery/</code> folder</li>
                        <li>Update <code className="bg-blue-100 px-1 rounded">/public/gallery.json</code> with the file information</li>
                        <li>Redeploy the application to make it visible in the gallery</li>
                      </ol>
                      <p className="mt-3 text-xs italic">
                        Note: The steganography parameters are NOT stored publicly - only you know them!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  'Embed Message and Download'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
