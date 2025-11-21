import React from 'react';
import { Step } from '../types';

interface TopShowcaseProps {
  personImage: string | null;
  clothImage: string | null;
  resultImage: string | null;
  currentStep: Step;
  onRetry?: () => void;
}

const Card = ({ 
  image, 
  label, 
  isActive, 
  isFilled,
  action
}: { 
  image: string | null; 
  label: string; 
  isActive: boolean; 
  isFilled: boolean;
  action?: React.ReactNode;
}) => {
  return (
    <div 
      className={`
        relative w-28 h-40 sm:w-36 sm:h-52 md:w-48 md:h-64 lg:w-56 lg:h-72 
        rounded-2xl border-4 shadow-2xl transition-all duration-500 ease-out
        flex items-center justify-center overflow-hidden bg-surface/50 backdrop-blur-sm
        ${isActive ? 'border-primary scale-105 z-10 ring-4 ring-primary/20' : 'border-white/10 opacity-70 scale-95'}
        ${isFilled ? 'bg-dark' : 'bg-surface'}
      `}
      style={{
        transform: isActive ? 'rotate(0deg) translateY(-10px)' : 'rotate(6deg)',
      }}
    >
      {image ? (
        <img src={image} alt={label} className="w-full h-full object-cover" />
      ) : (
        <div className="text-center p-4">
          <div className="w-10 h-10 rounded-full bg-white/10 mx-auto mb-2 flex items-center justify-center text-white/50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <span className="text-xs sm:text-sm text-white/40 font-medium">{label}</span>
        </div>
      )}
      
      {/* Gloss effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
      
      {/* Label Tag */}
      <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-md py-2 text-center pointer-events-none z-10">
        <p className="text-xs font-bold text-white tracking-wider uppercase">{label}</p>
      </div>

      {/* Action Button (e.g. Retry) */}
      {action}
    </div>
  );
};

export const TopShowcase: React.FC<TopShowcaseProps> = ({ personImage, clothImage, resultImage, currentStep, onRetry }) => {
  return (
    <div className="w-full py-8 sm:py-12 relative overflow-hidden perspective-1000">
      {/* Background Ambient Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="flex justify-center items-center gap-4 sm:gap-8 md:gap-12 relative z-10 px-4">
        {/* Step 1: Person */}
        <div className="transition-transform duration-500 hover:-translate-y-2">
            <Card 
              image={personImage} 
              label="人物" 
              isActive={currentStep === Step.SelectPerson}
              isFilled={!!personImage}
            />
        </div>

        {/* Step 2: Cloth */}
        <div className="transition-transform duration-500 hover:-translate-y-2">
            <Card 
              image={clothImage} 
              label="服装" 
              isActive={currentStep === Step.SelectCloth}
              isFilled={!!clothImage}
            />
        </div>

        {/* Step 3: Result */}
        <div className="transition-transform duration-500 hover:-translate-y-2">
            <Card 
              image={resultImage} 
              label="效果" 
              isActive={currentStep === Step.GenerateResult}
              isFilled={!!resultImage}
              action={
                (currentStep === Step.GenerateResult && resultImage && onRetry) ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetry();
                    }}
                    className="absolute bottom-10 right-2 sm:bottom-11 sm:right-2 p-2.5 bg-black/50 hover:bg-primary/90 backdrop-blur-md border border-white/20 rounded-full text-white transition-all duration-300 hover:scale-110 hover:rotate-180 shadow-lg z-20 group"
                    title="重新生成"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                       重试
                    </span>
                  </button>
                ) : null
              }
            />
        </div>
      </div>
    </div>
  );
};