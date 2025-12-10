import React from 'react';
import { X, Book, Cpu, Layers, Zap, AlertTriangle } from 'lucide-react';

interface DocumentationModalProps {
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <Book className="text-orange-600" /> ResumeCraft Documentation
            </h2>
            <p className="text-sm text-stone-500 mt-1">Technical Report & User Guide</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          <section>
            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2 mb-3">
              <Cpu size={20} className="text-orange-600" /> Architecture & Tech Stack
            </h3>
            <div className="bg-stone-50 p-4 rounded-lg border border-stone-100 text-sm text-stone-700 space-y-2">
              <p><strong>Frontend:</strong> React 19, TypeScript, Vite.</p>
              <p><strong>Styling:</strong> Tailwind CSS for responsive, utility-first design.</p>
              <p><strong>AI Integration:</strong> Google GenAI SDK (@google/genai) communicating directly with Gemini 2.5 Flash.</p>
              <p><strong>Storage:</strong> LocalStorage for persistence of user data between sessions.</p>
              <p><strong>PDF Generation:</strong> html2pdf.js for DOM-to-Canvas rendering.</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2 mb-3">
              <Layers size={20} className="text-orange-600" /> Workflow & Logic
            </h3>
            <div className="space-y-4">
              <div className="border-l-4 border-orange-200 pl-4">
                <h4 className="font-bold text-sm">1. Content Generation & Refinement</h4>
                <p className="text-sm text-stone-600">User inputs are processed by Gemini 2.5 Flash. The "Optimize" function rewrites descriptions using strong action verbs and industry keywords. The "Learn from Edits" loop allows users to manually tweak text and ask the AI to polish that specific version, ensuring the AI adapts to user preference.</p>
              </div>
              <div className="border-l-4 border-orange-200 pl-4">
                <h4 className="font-bold text-sm">2. Job Matching (ATS Analysis)</h4>
                <p className="text-sm text-stone-600">The system performs a semantic analysis of the resume against a target Job Description. It returns a structured dataset including:
                  <ul className="list-disc pl-4 mt-1">
                    <li><strong>Match Score (0-100):</strong> Calculated based on skill and responsibility alignment.</li>
                    <li><strong>Keyword Gap Analysis:</strong> Identifies which critical terms are matched vs. missing.</li>
                    <li><strong>Improvement Suggestions:</strong> Provides section-specific actionable advice (STAR method) to improve the score.</li>
                  </ul>
                </p>
              </div>
              <div className="border-l-4 border-orange-200 pl-4">
                <h4 className="font-bold text-sm">3. Template System</h4>
                <p className="text-sm text-stone-600">Three distinct templates (Modern, Classic, Minimal) render the same data source. PDF export is handled via client-side rendering canvas capture to ensure visual fidelity.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2 mb-3">
              <Zap size={20} className="text-orange-600" /> API Usage & Optimization
            </h3>
            <ul className="list-disc pl-5 text-sm text-stone-700 space-y-1">
              <li><strong>Model:</strong> <code>gemini-2.5-flash</code> is used for all tasks due to its speed and high token efficiency.</li>
              <li><strong>JSON Mode:</strong> Strictly enforced for ATS analysis to ensure the UI can programmatically parse scores and keyword lists.</li>
              <li><strong>Token Economy:</strong> Prompts are concise to minimize latency.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-orange-600" /> Limitations & Future Work
            </h3>
             <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-sm text-stone-700">
               <ul className="list-disc pl-5 space-y-1">
                 <li><strong>DOCX Export:</strong> Currently uses an HTML-to-Word XML hack. A server-side solution (like docx.js) would provide better formatting fidelity.</li>
                 <li><strong>ATS Parsing:</strong> The current checker analyzes text content alignment. It does not analyze the underlying PDF binary structure (which some older ATS systems struggle with).</li>
                 <li><strong>Mobile Layout:</strong> While responsive, complex resume editing is optimized for Desktop/Tablet.</li>
               </ul>
             </div>
          </section>

        </div>
        
        <div className="p-6 border-t border-stone-200 bg-stone-50 text-right">
          <button onClick={onClose} className="px-6 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors text-sm font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};