
import React, { useRef } from 'react';
import { UploadedImage } from '../types';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  id: string;
  label: string;
  description: string;
  onImageSelect: (file: File) => void;
  image: UploadedImage | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  id,
  label,
  description,
  onImageSelect,
  image,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-semibold text-gray-100">{label}</h3>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      <div
        className="relative w-full aspect-square bg-gray-900 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center text-center p-2 cursor-pointer hover:border-indigo-500 hover:bg-gray-800/50 transition-all duration-300 group"
        onClick={handleClick}
      >
        <input
          type="file"
          id={id}
          ref={inputRef}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        {image ? (
          <img
            src={image.preview}
            alt={label}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center text-gray-500 group-hover:text-indigo-400 transition-colors">
            <UploadIcon className="w-10 h-10 mb-2" />
            <span className="font-semibold">Click to upload</span>
            <span className="text-xs mt-1">PNG, JPG, WEBP</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
