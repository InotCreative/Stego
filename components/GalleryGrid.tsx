'use client';

import { GalleryFile } from '@/lib/types';

interface GalleryGridProps {
  files: GalleryFile[];
}

export default function GalleryGrid({ files }: GalleryGridProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-sm">
        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500 text-lg">No files in gallery yet.</p>
        <p className="text-gray-400 text-sm mt-2">Submit a file to get started!</p>
      </div>
    );
  }

  const isImageType = (type: string) => {
    return type.startsWith('image/') && 
           (type.includes('jpeg') || type.includes('jpg') || 
            type.includes('png') || type.includes('gif') || 
            type.includes('svg'));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {files.map((file) => (
        <div key={file.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 bg-white group">
          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
            {isImageType(file.type) ? (
              <img 
                src={file.path} 
                alt={file.filename}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4">
                <svg 
                  className="w-16 h-16 text-gray-400 mb-2 group-hover:text-gray-500 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                  />
                </svg>
                <span className="text-xs text-gray-500 text-center break-all px-2">
                  {file.filename}
                </span>
              </div>
            )}
          </div>
          <div className="p-4 bg-white">
            <p className="text-sm font-medium truncate mb-1 text-gray-900" title={file.filename}>
              {file.filename}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              {new Date(file.timestamp).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
            <a
              href={file.path}
              download={file.filename}
              className="block w-full text-center bg-blue-600 text-white text-sm py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Download
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
