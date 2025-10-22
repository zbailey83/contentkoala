import React from 'react';
import Spinner from './Spinner';
import Button from './Button';
import type { Generation } from '../types';
import type { Id } from '../convex/_generated/dataModel';

interface GeneratedImageProps {
  generation: (Generation & { url: string | null; }) | null | undefined;
  onUseForVideo: (storageId: Id<"_storage">) => void;
}

const Placeholder: React.FC = () => (
    <div className="text-center text-gray-500 dark:text-secondary-text">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-4">Your generated ad will appear here.</p>
    </div>
);

const GeneratedImage: React.FC<GeneratedImageProps> = ({ generation, onUseForVideo }) => {
  
  const handleUseImageForVideo = () => {
    if (!generation?.storageId) return;
    onUseForVideo(generation.storageId);
  };

  const handleDownloadImage = () => {
    if (!generation?.url) return;
    const link = document.createElement('a');
    link.href = generation.url;
    link.download = `ai-generated-ad.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    if (generation?.status === 'pending') {
      return (
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-800 dark:text-primary-text">Generating your creative vision...</p>
          <p className="text-sm text-gray-500 dark:text-secondary-text">This may take a moment.</p>
        </div>
      );
    }

    if (generation?.status === 'failed') {
      return (
        <div className="text-center text-red-700 dark:text-error bg-red-100 dark:bg-error/20 p-4 rounded-lg">
          <h3 className="font-bold">Generation Failed</h3>
          <p className="mt-2 text-sm">{generation.error || "An unknown error occurred."}</p>
        </div>
      );
    }
    
    if (generation?.status === 'completed' && generation.url) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-between gap-4">
            <div className="flex-grow flex items-center justify-center w-full">
              <img src={generation.url} alt="Generated ad" className="max-h-[400px] w-full object-contain rounded-lg" />
            </div>
            <div className="w-full flex flex-col sm:flex-row gap-2">
                 <Button onClick={handleUseImageForVideo}>
                    🎬 Use this Image to Generate Video
                </Button>
                <Button onClick={handleDownloadImage} variant="secondary">
                    ⬇️ Download Image
                </Button>
            </div>
        </div>
      );
    }

    return <Placeholder />;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-secondary-accent/50 rounded-lg p-4 min-h-[300px]">
      {renderContent()}
    </div>
  );
};

export default GeneratedImage;
