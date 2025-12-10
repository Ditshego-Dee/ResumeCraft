import React, { useState } from 'react';
import { analyzeWithAts } from '../services/geminiService';
import { AtsAnalysisResult, GeneratorStatus } from '../types';
import { Loader2, AlertCircle, CheckCircle2, XCircle, Lightbulb, Briefcase } from 'lucide-react';

interface JobMatcherProps {
  resumeText: string;
}

export const JobMatcher: React.FC<JobMatcherProps> = ({ resumeText }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<AtsAnalysisResult | null>(null);
  const [status, setStatus] = useState<GeneratorStatus>(GeneratorStatus.IDLE);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setStatus(GeneratorStatus.LOADING);
    try {
      const analysis = await analyzeWithAts(resumeText, jobDescription);
      setResult(analysis);
      setStatus(GeneratorStatus.SUCCESS);
    } catch (e) {
      setStatus(GeneratorStatus.ERROR);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
      <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
        <Briefcase className="text-orange-600" size={20} />
        Job Match & ATS Analysis
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-stone-700 mb-2">Paste Job Description</label>
        <textarea
          className="w-full p-3 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 h-32"
          placeholder="Paste the target job description here to analyze..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={status === GeneratorStatus.LOADING || !jobDescription}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {status === GeneratorStatus.LOADING ? (
          <>
            <Loader2 className="animate-spin" size={18} /> Analyzing...
          </>
        ) : (
          "Analyze Match"
        )}
      </button>

      {status === GeneratorStatus.ERROR && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm border border-red-100">
          <AlertCircle size={16} />
          Failed to analyze. Please check your API key and try again.
        </div>
      )}

      {result && status === GeneratorStatus.SUCCESS && (
        <div className="mt-6 space-y-6 animate-fadeIn">
          
          {/* Score Card */}
          <div className="flex items-center gap-5 bg-stone-50 p-5 rounded-lg border border-stone-100">
             <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-stone-200"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className={`${result.match_score > 75 ? 'text-green-500' : result.match_score > 50 ? 'text-yellow-500' : 'text-red-500'}`}
                    strokeDasharray={`${result.match_score}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute text-center">
                    <span className="block text-lg font-bold text-stone-800">{result.match_score}</span>
                    <span className="block text-[8px] uppercase tracking-wider text-stone-500">Score</span>
                </div>
             </div>
             <div>
               <h4 className="font-bold text-stone-800 text-sm mb-1">Analysis Summary</h4>
               <p className="text-xs text-stone-600 leading-relaxed">{result.analysis_summary}</p>
             </div>
          </div>

          {/* Keywords Analysis */}
          <div className="grid grid-cols-1 gap-4">
              <div>
                 <h4 className="font-semibold text-sm text-stone-700 mb-2 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-600" /> Matched Keywords
                 </h4>
                 <div className="flex flex-wrap gap-2">
                   {result.keyword_analysis.matched_terms.length > 0 ? (
                     result.keyword_analysis.matched_terms.map((term, i) => (
                       <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs border border-green-100 font-medium">
                         {term}
                       </span>
                     ))
                   ) : <span className="text-xs text-stone-400 italic">No exact matches found.</span>}
                 </div>
              </div>

              <div>
                 <h4 className="font-semibold text-sm text-stone-700 mb-2 flex items-center gap-2">
                    <XCircle size={14} className="text-red-500" /> Missing Keywords
                 </h4>
                 <div className="flex flex-wrap gap-2">
                   {result.keyword_analysis.missing_terms.length > 0 ? (
                     result.keyword_analysis.missing_terms.map((term, i) => (
                       <span key={i} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs border border-red-100 font-medium">
                         {term}
                       </span>
                     ))
                   ) : <span className="text-xs text-green-600 italic">Excellent! No major keywords missing.</span>}
                 </div>
              </div>
          </div>

          {/* Suggestions */}
          <div>
            <h4 className="font-semibold text-sm text-stone-700 mb-3 flex items-center gap-2">
                <Lightbulb size={16} className="text-yellow-500" /> High-Impact Suggestions
            </h4>
            <div className="space-y-3">
              {result.improvement_suggestions.map((item, i) => (
                <div key={i} className="bg-orange-50/50 border border-orange-100 p-3 rounded-lg">
                    <div className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-1">{item.section}</div>
                    <p className="text-sm text-stone-700">{item.suggestion}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};