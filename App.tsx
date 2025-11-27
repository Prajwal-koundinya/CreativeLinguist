import React, { useState, useRef } from 'react';
import { analyzeText } from './services/geminiService';
import { AnalysisResult, FileData } from './types';
import AnalysisDashboard from './components/AnalysisDashboard';
import { DocumentTextIcon, CloudArrowUpIcon, BeakerIcon, ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      setFile({
        name: selectedFile.name,
        mimeType: selectedFile.type || 'text/plain',
        data: base64String
      });
      // Clear manual text input to avoid confusion, or keep it to append? 
      // Let's keep it but prioritize file in logic.
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!inputText && !file) {
      alert("Please enter text or upload a file.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Always enable search grounding as per requirements, letting the model decide when to use it via tools
      const data = await analyzeText(inputText, file ? { mimeType: file.mimeType, data: file.data } : undefined, true);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again. Ensure your API Key is valid and supports the requested features.");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-neon-dark text-slate-200 font-sans selection:bg-neon-blue selection:text-black">
      
      {/* Header */}
      <header className="border-b border-gray-900 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center">
              <BeakerIcon className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-lime-400">
              NeonLinguist AI
            </h1>
          </div>
          <div className="text-xs font-mono text-gray-500 hidden sm:block">
            Natural Language Processing
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* Intro / Empty State */}
        {!result && !loading && (
          <div className="mb-12 text-center max-w-2xl mx-auto pt-10">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white tracking-tight">
              Elevate your <span className="text-neon-text-gradient">writing</span>.
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Advanced linguistic analysis, rewriting suggestions, and fact-checking grounded in Google Search.
            </p>
          </div>
        )}

        {/* Input Area */}
        <div className={`transition-all duration-500 ease-in-out ${result ? 'mb-8' : 'mb-20 max-w-4xl mx-auto'}`}>
          <div className="bg-[#121212] p-1 rounded-2xl border border-gray-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="bg-[#0a0a0a] rounded-xl overflow-hidden relative">
              
              {/* Toolbar */}
              <div className="px-4 py-3 bg-[#18181b] border-b border-gray-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-md transition-colors"
                  >
                    <CloudArrowUpIcon className="w-4 h-4 text-neon-blue" />
                    Upload File
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".txt,.md,.pdf" 
                    onChange={handleFileChange} 
                  />
                  {file && (
                    <div className="flex items-center gap-2 bg-gray-900/50 px-2 py-1 rounded border border-gray-700">
                      <DocumentTextIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-neon-blue truncate max-w-[100px]">{file.name}</span>
                      <button onClick={clearFile} className="text-gray-500 hover:text-red-400 ml-1">×</button>
                    </div>
                  )}
                </div>

                {/* Search Toggle Removed */}
              </div>

              {/* Text Area */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={file ? "Add optional context or instructions for the file..." : "Paste your text here or upload a file to begin..."}
                className="w-full h-48 sm:h-64 bg-[#0a0a0a] text-gray-300 p-4 focus:outline-none resize-none font-mono text-sm"
              />

              {/* Action Bar */}
              <div className="absolute bottom-4 right-4 z-10">
                <button
                  onClick={handleAnalyze}
                  disabled={loading || (!inputText && !file)}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide shadow-lg
                    transition-all duration-300 transform active:scale-95
                    ${loading 
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-cyan-600 to-lime-600 hover:from-cyan-500 hover:to-lime-500 text-black hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      Run Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Skeleton / State */}
        {loading && !result && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-900 rounded-lg"></div>)}
              </div>
              <div className="h-48 bg-gray-900 rounded-xl"></div>
              <div className="h-64 bg-gray-900 rounded-lg"></div>
            </div>
            <div className="lg:col-span-1 h-full">
              <div className="h-full bg-gray-900 rounded-xl"></div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && <AnalysisDashboard result={result} />}

      </main>
    </div>
  );
};

export default App;