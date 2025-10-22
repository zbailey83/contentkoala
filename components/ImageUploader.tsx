import React, { useState, useRef, useCallback } from 'react';
import type { UploadedFile } from '../types';
import type { Id } from '../convex/_generated/dataModel';

interface ImageUploaderProps {
  onImageUpload: (storageId: Id<"_storage">) => void;
  onClear: () => void;
  label: string;
  generateUploadUrl: () => Promise<string>;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onClear, label, generateUploadUrl, disabled }) => {
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = useCallback(async (file: File | null) => {
    if (disabled || !file || !file.type.startsWith('image/')) return;
    
    setIsUploading(true);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      onImageUpload(storageId);
    } catch (error) {
      console.error("Upload failed:", error);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  }, [generateUploadUrl, onImageUpload, disabled]);

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
  };
  
  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const clearSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onClear();
  }

  const cursorClass = disabled ? 'cursor-not-allowed' : previewUrl ? 'cursor-default' : 'cursor-pointer';

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        disabled={disabled}
      />
      <label
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !previewUrl && fileInputRef.current?.click()}
        className={`flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg transition-all duration-200
          ${previewUrl ? 'p-0 border-solid border-gray-300 dark:border-secondary-accent' : 'p-4'}
          ${dragOver ? 'border-gray-400 bg-gray-100 dark:border-primary-accent dark:bg-secondary-accent/50' : 'border-gray-300 hover:border-gray-400 dark:border-secondary-accent dark:hover:border-primary-accent'}
          ${cursorClass}
        `}
      >
        {previewUrl ? (
          <div className="relative w-full h-full">
            <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-md mx-auto" />
            {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-secondary-text">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <p className="mt-2 text-sm px-2">{label}</p>
          </div>
        )}
      </label>
       {previewUrl && !isUploading && (
        <button
            onClick={(e) => { e.preventDefault(); clearSelection(); }}
            className="absolute top-2 right-2 bg-white/70 text-black dark:bg-background/70 dark:text-primary-text rounded-full p-1.5 leading-none backdrop-blur-sm hover:bg-white dark:hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-background focus:ring-gray-700 dark:focus:ring-primary-accent"
            aria-label="Remove image"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>
      )}
    </div>
  );
};

export default ImageUploader;
