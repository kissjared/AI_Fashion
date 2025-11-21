import React, { useState, useEffect } from 'react';
import { TopShowcase } from './components/TopShowcase';
import { SelectionGrid } from './components/SelectionGrid';
import { Gallery } from './components/Gallery';
import { ImagePreview } from './components/ImagePreview';
import { PRESET_PEOPLE, PRESET_CLOTHES } from './constants';
import { ImageAsset, Step, HistoryItem } from './types';
import { fileToBase64, urlToBase64 } from './utils/imageHelper';
import * as GeminiService from './services/geminiService';

function App() {
  // State
  const [currentStep, setCurrentStep] = useState<Step>(Step.SelectPerson);
  const [peopleList, setPeopleList] = useState<ImageAsset[]>(PRESET_PEOPLE);
  const [clothesList, setClothesList] = useState<ImageAsset[]>(PRESET_CLOTHES);
  
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedClothId, setSelectedClothId] = useState<string | null>(null);
  
  // Store full base64 data for API processing
  const [personImageData, setPersonImageData] = useState<string | null>(null);
  const [clothImageData, setClothImageData] = useState<string | null>(null);
  const [resultImageData, setResultImageData] = useState<string | null>(null);
  
  const [clothPrompt, setClothPrompt] = useState('');
  const [isGeneratingCloth, setIsGeneratingCloth] = useState(false);
  const [isGeneratingResult, setIsGeneratingResult] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [previewItem, setPreviewItem] = useState<HistoryItem | null>(null);

  // Helpers
  const handleSelectPerson = async (item: ImageAsset) => {
    setSelectedPersonId(item.id);
    setErrorMsg(null);
    try {
      // Use predefined base64 if stored (uploaded), else fetch URL
      if (item.isBase64) {
        setPersonImageData(item.url);
      } else {
        const b64 = await urlToBase64(item.url);
        setPersonImageData(b64);
      }
      // Auto advance for smooth flow, but optional
      setTimeout(() => setCurrentStep(Step.SelectCloth), 300);
    } catch (err: any) {
      setErrorMsg(err.message || "图片加载失败");
      setSelectedPersonId(null);
    }
  };

  const handleSelectCloth = async (item: ImageAsset) => {
    setSelectedClothId(item.id);
    setErrorMsg(null);
    try {
      if (item.isBase64) {
        setClothImageData(item.url);
      } else {
        const b64 = await urlToBase64(item.url);
        setClothImageData(b64);
      }
      // Don't auto-advance immediately, let user decide or generate custom
    } catch (err: any) {
      setErrorMsg(err.message || "图片加载失败");
      setSelectedClothId(null);
    }
  };

  const handleUploadPerson = async (file: File) => {
    try {
      const b64 = await fileToBase64(file);
      const newItem: ImageAsset = { id: `upload_p_${Date.now()}`, url: b64, isBase64: true };
      setPeopleList([newItem, ...peopleList]);
      handleSelectPerson(newItem);
    } catch (e) {
      setErrorMsg("文件读取失败");
    }
  };

  const handleUploadCloth = async (file: File) => {
    try {
      const b64 = await fileToBase64(file);
      const newItem: ImageAsset = { id: `upload_c_${Date.now()}`, url: b64, isBase64: true };
      setClothesList([newItem, ...clothesList]);
      handleSelectCloth(newItem);
    } catch (e) {
      setErrorMsg("文件读取失败");
    }
  };

  const handleGenerateCloth = async () => {
    if (!clothPrompt.trim()) return;
    setIsGeneratingCloth(true);
    setErrorMsg(null);
    try {
      const b64 = await GeminiService.generateClothingImage(clothPrompt);
      const newItem: ImageAsset = { id: `gen_c_${Date.now()}`, url: b64, isBase64: true };
      setClothesList([newItem, ...clothesList]);
      handleSelectCloth(newItem);
      setClothPrompt('');
    } catch (e: any) {
      setErrorMsg("生成服装失败: " + (e.message || 'Unknown error'));
    } finally {
      setIsGeneratingCloth(false);
    }
  };

  const handleGenerateTryOn = async () => {
    if (!personImageData || !clothImageData) {
      setErrorMsg("请先选择人物和服装");
      return;
    }
    
    setIsGeneratingResult(true);
    setCurrentStep(Step.GenerateResult);
    setErrorMsg(null);
    // Do not clear resultImageData immediately if retrying, to avoid flicker? 
    // Actually, clearing it shows loading state better on the Card.
    setResultImageData(null);

    try {
      const resultB64 = await GeminiService.generateTryOnResult(personImageData, clothImageData);
      setResultImageData(resultB64);
      
      // Add to history
      const newHistory: HistoryItem = {
        id: `h_${Date.now()}`,
        personImage: personImageData,
        clothImage: clothImageData,
        resultImage: resultB64,
        timestamp: Date.now()
      };
      setHistory(prev => [newHistory, ...prev]);

    } catch (e: any) {
      setErrorMsg("试穿生成失败，请重试。错误信息：" + (e.message || 'API Error'));
      setCurrentStep(Step.SelectCloth); // Go back on error
    } finally {
      setIsGeneratingResult(false);
    }
  };

  const restoreHistory = (item: HistoryItem) => {
    setPersonImageData(item.personImage);
    setClothImageData(item.clothImage);
    setResultImageData(item.resultImage);
    setCurrentStep(Step.GenerateResult);
  };

  // Determine display images for top card
  // For presets, we might display the URL directly if selection matches, or the base64 data if we have it
  const displayPerson = selectedPersonId ? (peopleList.find(p => p.id === selectedPersonId)?.url || personImageData) : personImageData;
  const displayCloth = selectedClothId ? (clothesList.find(c => c.id === selectedClothId)?.url || clothImageData) : clothImageData;

  return (
    <div className="min-h-screen bg-dark text-gray-100 flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="font-bold text-white text-lg">N</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">AI 霓裳 <span className="text-white/40 font-normal text-sm ml-2">Virtual Try-On</span></h1>
        </div>
        {!process.env.API_KEY && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-3 py-1 rounded text-xs">
            API Key Missing
          </div>
        )}
      </header>

      {/* Main Visual Area */}
      <TopShowcase 
        personImage={displayPerson} 
        clothImage={displayCloth} 
        resultImage={resultImageData}
        currentStep={currentStep}
        onRetry={handleGenerateTryOn}
      />

      {/* Error Message Toast */}
      {errorMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-full shadow-xl backdrop-blur animate-pulse">
          {errorMsg}
          <button onClick={() => setErrorMsg(null)} className="ml-4 hover:text-black">✕</button>
        </div>
      )}

      {/* Operation Area */}
      <main className="flex-1 bg-surface rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] mt-4 relative z-20 p-6 sm:p-8 max-w-6xl mx-auto w-full flex flex-col">
        
        <div className="flex justify-center mb-8 space-x-2">
          {[1, 2, 3].map(step => (
            <button
              key={step}
              onClick={() => {
                 if (step === 1) setCurrentStep(Step.SelectPerson);
                 if (step === 2 && personImageData) setCurrentStep(Step.SelectCloth);
                 if (step === 3 && resultImageData) setCurrentStep(Step.GenerateResult);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${currentStep === step ? 'w-12 bg-primary' : 'w-4 bg-white/10 hover:bg-white/30'}`}
            />
          ))}
        </div>

        {/* Step 1: Person Selection */}
        {currentStep === Step.SelectPerson && (
          <div className="animate-fadeIn">
             <SelectionGrid 
              title="第一步：选择模特 (Model)"
              items={peopleList}
              selectedId={selectedPersonId}
              onSelect={handleSelectPerson}
              onUpload={handleUploadPerson}
            />
            <div className="mt-8 text-center">
               {/* Only show next if valid selection */}
               <button 
                disabled={!personImageData}
                onClick={() => setCurrentStep(Step.SelectCloth)}
                className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                下一步：选择服装
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Cloth Selection & Generation */}
        {currentStep === Step.SelectCloth && (
          <div className="animate-fadeIn">
             
             {/* AI Cloth Generator */}
             <div className="mb-8 p-6 bg-dark/50 rounded-2xl border border-white/5">
                <h3 className="text-sm font-medium text-secondary mb-3 flex items-center gap-2">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   AI 设计服装 (AI Design)
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    value={clothPrompt}
                    onChange={(e) => setClothPrompt(e.target.value)}
                    placeholder="描述你想生成的服装，例如：一件红色的丝绸晚礼服..." 
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-secondary transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateCloth()}
                  />
                  <button 
                    onClick={handleGenerateCloth}
                    disabled={isGeneratingCloth || !clothPrompt}
                    className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-white font-medium rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center min-w-[120px]"
                  >
                    {isGeneratingCloth ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : '生成服装'}
                  </button>
                </div>
             </div>

             <SelectionGrid 
              title="第二步：选择服装 (Outfit)"
              items={clothesList}
              selectedId={selectedClothId}
              onSelect={handleSelectCloth}
              onUpload={handleUploadCloth}
            />

            <div className="mt-8 flex justify-center gap-4">
               <button 
                onClick={() => setCurrentStep(Step.SelectPerson)}
                className="px-6 py-3 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 transition-colors"
              >
                上一步
              </button>
              <button 
                disabled={!clothImageData}
                onClick={handleGenerateTryOn}
                className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-full hover:opacity-90 shadow-lg shadow-primary/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                开始试穿 (Try On)
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {currentStep === Step.GenerateResult && (
          <div className="animate-fadeIn flex flex-col items-center">
             
             {isGeneratingResult ? (
               <div className="py-20 text-center">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">正在施展魔法...</h3>
                  <p className="text-white/50">Nano Banana 正在为你量身定制</p>
               </div>
             ) : (
               <>
                 <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">试穿完成！</h2>
                    <p className="text-white/60">您觉得这套搭配如何？</p>
                 </div>
                 
                 {resultImageData && (
                   <a 
                      href={resultImageData} 
                      download={`tryon-${Date.now()}.png`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors mb-8"
                   >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      保存照片
                   </a>
                 )}

                 <button 
                    onClick={() => setCurrentStep(Step.SelectCloth)}
                    className="text-white/50 hover:text-white underline decoration-dotted"
                 >
                    再试一件
                 </button>
               </>
             )}
          </div>
        )}

        {/* Footer Gallery */}
        <Gallery 
          history={history} 
          onSelect={(item) => setPreviewItem(item)} 
        />

      </main>
      
      {/* Full Screen Image Preview */}
      <ImagePreview 
        item={previewItem} 
        onClose={() => setPreviewItem(null)} 
        onRestore={restoreHistory}
      />
      
    </div>
  );
}

export default App;