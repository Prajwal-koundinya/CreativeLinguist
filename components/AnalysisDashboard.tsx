import React from 'react';
import { AnalysisResult, Suggestion } from '../types';
import AnalysisCharts from './AnalysisCharts';
import { ArrowDownTrayIcon, SparklesIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

interface AnalysisDashboardProps {
  result: AnalysisResult;
}

const ScoreCard: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div className="bg-[#121212] p-4 rounded-lg border border-gray-800 flex flex-col items-center justify-center relative overflow-hidden">
    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color} opacity-70`}></div>
    <span className="text-gray-400 text-xs uppercase tracking-widest font-mono mb-2">{label}</span>
    <span className="text-3xl font-bold text-white">{value}</span>
  </div>
);

const SuggestionCard: React.FC<{ suggestion: Suggestion }> = ({ suggestion }) => {
  const typeColors = {
    grammar: 'text-red-400 border-red-900/30 bg-red-900/10',
    clarity: 'text-yellow-400 border-yellow-900/30 bg-yellow-900/10',
    style: 'text-purple-400 border-purple-900/30 bg-purple-900/10',
  };

  return (
    <div className="bg-[#121212] border border-gray-800 rounded-lg p-4 mb-3 transition-all hover:border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${typeColors[suggestion.type]} `}>
          {suggestion.type}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="text-gray-500 line-through decoration-red-500/50">{suggestion.original}</div>
        <div className="text-neon-green font-medium flex items-center gap-2">
          <SparklesIcon className="w-4 h-4" />
          {suggestion.improvement}
        </div>
        <div className="text-xs text-gray-400 mt-2 font-mono border-t border-gray-800 pt-2">
          {suggestion.reason}
        </div>
      </div>
    </div>
  );
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result }) => {
  
  const handleDownload = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(result, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "analysis_report.json";
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* Left Column: Metrics & Summary */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ScoreCard 
              label="Readability" 
              value={result.readabilityScore} 
              color="from-cyan-500 to-blue-600" 
            />
            <ScoreCard 
              label="Sentiment" 
              value={result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1)} 
              color={result.sentiment === 'positive' ? 'from-green-500 to-emerald-600' : 'from-orange-500 to-red-600'} 
            />
             <ScoreCard 
              label="Suggestions" 
              value={result.suggestions.length} 
              color="from-purple-500 to-pink-600" 
            />
             <ScoreCard 
              label="Words" 
              value={result.wordFrequency.reduce((acc, curr) => acc + curr.count, 0)} 
              color="from-gray-500 to-slate-600" 
            />
        </div>

        {/* Summary Box */}
        <div className="bg-[#121212] p-6 rounded-xl border border-gray-800 neon-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-neon-blue font-mono font-bold uppercase tracking-wider">Executive Summary</h3>
            {result.factCheck && (
              <span className="flex items-center gap-1 text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-full border border-green-800">
                <CheckBadgeIcon className="w-3 h-3" /> Grounded with Google Search
              </span>
            )}
          </div>
          <p className="text-gray-300 leading-relaxed text-sm md:text-base">
            {result.summary}
          </p>
          {result.factCheck && result.factCheck.sources && (
             <div className="mt-4 pt-4 border-t border-gray-800">
               <p className="text-xs text-gray-500 mb-2 font-mono">Sources:</p>
               <div className="flex flex-wrap gap-2">
                 {result.factCheck.sources.map((src, i) => (
                   <a key={i} href={src} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-600 hover:text-cyan-400 truncate max-w-[200px] underline">
                     {new URL(src).hostname}
                   </a>
                 ))}
               </div>
             </div>
          )}
        </div>

        {/* Charts */}
        <AnalysisCharts data={result.wordFrequency} />
      </div>

      {/* Right Column: Suggestions Feed */}
      <div className="lg:col-span-1 h-full">
        <div className="bg-[#121212] rounded-xl border border-gray-800 h-full flex flex-col">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#18181b]">
             <h3 className="text-neon-green font-mono font-bold uppercase tracking-wider text-sm">Active Improvements</h3>
             <button 
                onClick={handleDownload}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                title="Download JSON"
             >
               <ArrowDownTrayIcon className="w-5 h-5" />
             </button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[800px] custom-scrollbar space-y-2">
            {result.suggestions.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                <p>No major improvements found. Great job!</p>
              </div>
            ) : (
              result.suggestions.map((suggestion, idx) => (
                <SuggestionCard key={idx} suggestion={suggestion} />
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AnalysisDashboard;