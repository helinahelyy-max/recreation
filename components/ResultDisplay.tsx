
import React, { useState } from 'react';
import { PhotoIcon, ExclamationTriangleIcon, DownloadIcon } from './Icons';
import Spinner from './Spinner';

interface ResultDisplayProps {
  isLoading: boolean;
  error: string | null;
  generatedImage: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, error, generatedImage }) => {
  const [activeFilter, setActiveFilter] = useState('Original');
  const filters = ['Original', 'Grayscale', 'Sepia', 'Invert'];

  const filterClasses: { [key: string]: string } = {
    Original: '',
    Grayscale: 'grayscale',
    Sepia: 'sepia',
    Invert: 'invert',
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const filterToApply = activeFilter.toLowerCase();

    // If no filter, download directly
    if (filterToApply === 'original') {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'recreation-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // For filters, use canvas to apply the effect
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.filter = `${filterToApply}(100%)`;
      ctx.drawImage(img, 0, 0);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `recreation-image-${filterToApply}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src = generatedImage;
  };

  return (
    <div className="relative w-full h-full aspect-square bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden">
      {isLoading && (
        <div className="flex flex-col items-center text-gray-400">
          <Spinner className="w-12 h-12 mb-4" />
          <p className="text-lg font-semibold animate-pulse">Merging images...</p>
          <p className="text-sm text-gray-500 mt-1">This may take a moment.</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col items-center text-center text-red-400 p-4">
          <ExclamationTriangleIcon className="w-12 h-12 mb-4" />
          <p className="text-lg font-semibold">An Error Occurred</p>
          <p className="text-sm text-red-500 mt-1">{error}</p>
        </div>
      )}

      {!isLoading && !error && generatedImage && (
        <img
          src={generatedImage}
          alt="Generated result"
          className={`w-full h-full object-contain transition-all duration-300 ${filterClasses[activeFilter]}`}
        />
      )}

      {!isLoading && !error && !generatedImage && (
        <div className="flex flex-col items-center text-gray-600">
          <PhotoIcon className="w-16 h-16 mb-4" />
          <p className="text-lg font-semibold">Your generated image will appear here</p>
        </div>
      )}

      {/* Controls Overlay */}
      {!isLoading && !error && generatedImage && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent flex flex-col items-center gap-4">
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 ${
                  activeFilter === filter
                    ? 'bg-indigo-500 text-white shadow'
                    : 'bg-gray-700/80 text-gray-200 hover:bg-gray-600/80 backdrop-blur-sm'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center justify-center bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
            aria-label="Download generated image"
          >
            <DownloadIcon className="w-5 h-5 mr-2" />
            <span>Download</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
