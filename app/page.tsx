import GalleryGrid from '@/components/GalleryGrid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getGalleryFiles } from '@/lib/gallery';

export default async function Home() {
  const files = await getGalleryFiles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Public Gallery</h2>
          <p className="text-gray-600 text-sm">
            Browse files that may contain hidden messages. Download and extract with the correct parameters.
          </p>
        </div>
        <GalleryGrid files={files} />
      </main>

      <Footer />
    </div>
  );
}
