import React, { useState, useCallback, useMemo } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';

import Header from '../components/Header';
import ImageUploader from '../components/ImageUploader';
import StyleSelector from '../components/StyleSelector';
import Button from '../components/Button';
import GeneratedImage from '../components/GeneratedImage';
import { IMAGE_STYLE_OPTIONS } from '../constants';
import type { UploadedFile } from '../types';

interface AdGeneratorToolProps {
  onBackToDashboard: () => void;
}

const AdGeneratorTool: React.FC<AdGeneratorToolProps> = ({ onBackToDashboard }) => {
  // Convex state and mutations
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const startImageGeneration = useMutation(api.generations.startImageGeneration);
  const generations = useQuery(api.generations.getLatestAdCreations);
  
  // Local UI State
  const [primaryImageId, setPrimaryImageId] = useState<Id<"_storage"> | null>(null);
  const [secondaryImageId, setSecondaryImageId] = useState<Id<"_storage"> | null>(null);
  const [description, setDescription] = useState<string>('');
  const [selectedImageStyles, setSelectedImageStyles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generatedImage = generations?.image;
  const isGeneratingImage = generatedImage?.status === 'pending';

  const handleImageStyleToggle = (style: string) => {
    setSelectedImageStyles(prev => {
      if (prev.includes(style)) return prev.filter(s => s !== style);
      if (prev.length < 3) return [...prev, style];
      return prev;
    });
  };
  const handleGenerateImage = useCallback(async () => {
    if (!primaryImageId || description.trim().length === 0 || selectedImageStyles.length === 0) {
      setError("Please upload a primary image, provide a description, and select at least one style.");
      return;
    }
    setError(null);

    try {
      await startImageGeneration({
        primaryImageId,
        secondaryImageId: secondaryImageId ?? undefined,
        description,
        styles: selectedImageStyles,
      });
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    }
  }, [primaryImageId, secondaryImageId, description, selectedImageStyles, startImageGeneration]);

  const canGenerateImage = primaryImageId !== null && description.trim() !== '' && selectedImageStyles.length > 0 && !isGeneratingImage;

  return (
    <>
      <div className="w-full max-w-7xl mx-auto pb-24 sm:pb-0 animate-fade-in">
        <Header 
          title={<>AI Ad <span className="text-accent">Creative</span> Generator</>}
          subtitle="Transform your product photos into stunning image and video ads with Gemini."
        />
        {error && (
            <div className="mb-4 text-center text-red-700 dark:text-error bg-red-100 dark:bg-error/20 p-4 rounded-lg">
                <p>{error}</p>
            </div>
        )}
        <div className="flex flex-col gap-8">
          {/* Top Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Inputs Card */}
            <div className="flex flex-col space-y-6 p-6 bg-purple-100/30 dark:bg-accent/20 border border-dashed border-gray-300 dark:border-secondary-accent rounded-lg">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-primary-text mb-3"><span className="text-accent">1.</span> Upload Photos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ImageUploader
                    onImageUpload={setPrimaryImageId}
                    onClear={() => setPrimaryImageId(null)}
                    label="Primary Product Photo*"
                    generateUploadUrl={generateUploadUrl}
                    disabled={isGeneratingImage}
                  />
                  <ImageUploader
                    onImageUpload={setSecondaryImageId}
                    onClear={() => setSecondaryImageId(null)}
                    label="Context Image (Optional)"
                    generateUploadUrl={generateUploadUrl}
                    disabled={isGeneratingImage}
                  />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-primary-text mb-3"><span className="text-accent">2.</span> Describe Your Ad*</h2>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., A refreshing drink for a hot summer day, highlighting its natural ingredients."
                  className="w-full h-24 p-3 bg-white dark:bg-background border border-gray-300 dark:border-secondary-accent text-gray-900 dark:text-primary-text rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent dark:focus:border-transparent transition-colors"
                  maxLength={200}
                  aria-required="true"
                />
                <p className="text-right text-xs text-gray-500 dark:text-secondary-text mt-1">{description.length} / 200</p>
              </div>
            </div>
            {/* Image Generation Card */}
            <div className="flex flex-col space-y-4 p-6 bg-purple-100/30 dark:bg-accent/20 border border-dashed border-gray-300 dark:border-secondary-accent rounded-lg">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-primary-text mb-3"><span className="text-accent">3.</span> Generate Ad Image</h2>
                <p className="text-sm text-gray-600 dark:text-secondary-text mb-4">Choose up to 3 styles to apply to your ad image.</p>
                <StyleSelector
                  styles={IMAGE_STYLE_OPTIONS}
                  selectedStyles={selectedImageStyles}
                  onStyleToggle={handleImageStyleToggle}
                />
              </div>
              <div className="pt-2">
                <Button onClick={handleGenerateImage} disabled={!canGenerateImage}>
                  {isGeneratingImage ? 'Generating...' : '✨ Generate Ad Image'}
                </Button>
              </div>
              <div className="flex-grow flex flex-col">
                <GeneratedImage
                  generation={generatedImage}
                  onUseForVideo={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile-only back button */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-background/80 border-t border-gray-200 dark:border-secondary-accent z-10 backdrop-blur-sm">
          <Button onClick={onBackToDashboard} variant="secondary">
              &larr; Back to Dashboard
          </Button>
      </div>
    </>
  );
};

export default AdGeneratorTool;
