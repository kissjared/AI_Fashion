import React from 'react';
import { HistoryItem } from '../types';

interface GalleryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ history, onSelect }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full mt-12 pt-8 border-t border-white/10">
      <h3 className="text-white text-lg font-medium mb-4 px-2">历史记录 (Gallery)</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 gallery-scroll px-2">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex-shrink-0 w-24 sm:w-32 cursor-pointer group"
          >
            <div className="aspect-[3/4] rounded-lg overflow-hidden border border-white/10 group-hover:border-primary transition-colors relative">
              <img src={item.resultImage} alt="Result" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <span className="text-[10px] text-white">点击查看</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};