import React from 'react';
import { ImageAsset } from '../types';

interface SelectionGridProps {
  items: ImageAsset[];
  selectedId: string | null;
  onSelect: (item: ImageAsset) => void;
  onUpload: (file: File) => void;
  title: string;
}

export const SelectionGrid: React.FC<SelectionGridProps> = ({ items, selectedId, onSelect, onUpload, title }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
        <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
        {title}
      </h3>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Upload Button */}
        <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/20 hover:border-primary hover:bg-white/5 cursor-pointer transition-colors flex flex-col items-center justify-center group">
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) onUpload(e.target.files[0]);
            }}
          />
          <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-primary text-white flex items-center justify-center transition-colors mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
          <span className="text-xs text-white/60 group-hover:text-white">上传照片</span>
        </label>

        {/* Presets */}
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`
              relative aspect-[3/4] rounded-xl overflow-hidden group transition-all
              ${selectedId === item.id ? 'ring-4 ring-primary scale-95' : 'hover:ring-2 hover:ring-white/30'}
            `}
          >
            <img 
              src={item.url} 
              alt="Preset" 
              className="w-full h-full object-cover"
              loading="lazy"
              crossOrigin="anonymous" 
            />
            {selectedId === item.id && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};