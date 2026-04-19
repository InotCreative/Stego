export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-center sm:text-left text-gray-500 text-sm">
            © {new Date().getFullYear()} Steganography Web Service
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a 
              href="https://en.wikipedia.org/wiki/Steganography" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              About Steganography
            </a>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">
              Secure & Private
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
