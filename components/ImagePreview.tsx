import React from 'react';
import { HistoryItem } from '../types';

interface ImagePreviewProps {
  item: HistoryItem | null;
  onClose: () => void;
  onRestore: (item: HistoryItem) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ item, onClose, onRestore }) => {
  if (!item) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center" 
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-0 sm:-right-12 text-white/50 hover:text-white p-2 transition-colors z-10"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        {/* Image */}
        <img 
          src={item.resultImage} 
          alt="Full size result" 
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/10 bg-dark"
        />
        
        {/* Actions */}
        <div className="mt-6 flex gap-4">
           <button
             onClick={() => {
               onRestore(item);
               onClose();
             }}
             className="px-6 py-2.5 bg-primary hover:bg-primary/80 text-white rounded-full font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             使用此搭配
           </button>
           <a 
              href={item.resultImage} 
              download={`tryon-${item.timestamp}.png`}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors flex items-center gap-2 border border-white/10"
           >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              保存图片
           </a>
        </div>
      </div>
    </div>
  );
};