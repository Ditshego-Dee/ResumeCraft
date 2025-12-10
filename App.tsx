import React, { useState, useEffect } from 'react';
import { ResumeData, TemplateType } from './types';
import { ResumeForm } from './components/ResumeForm';
import { ModernTemplate, ClassicTemplate, MinimalTemplate } from './components/Templates';
import { JobMatcher } from './components/JobMatcher';
import { DocumentationModal } from './components/DocumentationModal';
import { Download, LayoutTemplate, Printer, AlertTriangle, FileCode, FileText, ChevronDown, HelpCircle } from 'lucide-react';

const INITIAL_DATA: ResumeData = {
  personalInfo: {
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    summary: "Dedicated software engineer with 5+ years of experience in building scalable web applications. Proven track record of improving system performance and leading cross-functional teams.",
    linkedin: "linkedin.com/in/alexrivera",
    website: "alexrivera.dev"
  },
  experience: [
    {
      id: "1",
      company: "Tech Solutions Inc.",
      role: "Senior Frontend Developer",
      startDate: "01/2021",
      endDate: "Present",
      current: true,
      description: "• Led the migration of legacy codebase to React 18, improving load times by 40%.\n• Mentored junior developers and conducted code reviews to ensure high code quality.\n• Collaborated with UX designers to implement responsive and accessible interfaces."
    },
    {
      id: "2",
      company: "WebCorp",
      role: "Web Developer",
      startDate: "06/2018",
      endDate: "12/2020",
      current: false,
      description: "• Developed and maintained multiple e-commerce client websites using HTML, CSS, and JavaScript.\n• Integrated third-party APIs for payment processing and inventory management."
    }
  ],
  education: [
    {
      id: "1",
      institution: "University of Technology",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2014",
      endDate: "2018",
      current: false
    }
  ],
  skills: [
    { id: "1", name: "React", level: "Expert" },
    { id: "2", name: "TypeScript", level: "Advanced" },
    { id: "3", name: "Node.js", level: "Intermediate" },
    { id: "4", name: "Tailwind CSS", level: "Advanced" }
  ],
  projects: [
    {
      id: "1",
      name: "E-commerce Dashboard",
      description: "A comprehensive dashboard for tracking sales and inventory in real-time.",
      link: "github.com/alex/dashboard"
    }
  ]
};

const App: React.FC = () => {
  const [data, setData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('resumeData');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('modern');
  const [showJobMatcher, setShowJobMatcher] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(data));
  }, [data]);

  const handleDownloadPdf = async () => {
    const element = document.getElementById('resume-preview');
    if (!element) return;
    
    setIsExporting(true);
    setShowExportMenu(false);
    
    // We use a library via CDN in index.html, but typescript doesn't know about it.
    // @ts-ignore
    const html2pdf = window.html2pdf;

    const opt = {
      margin: 0,
      filename: `${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
        await html2pdf().set(opt).from(element).save();
    } catch (e) {
        console.error("PDF generation failed", e);
        alert("PDF Generation failed. Please try standard print.");
    } finally {
        setIsExporting(false);
    }
  };

  const handleDownloadHtml = () => {
    const element = document.getElementById('resume-preview');
    if (!element) return;
    setShowExportMenu(false);

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${data.personalInfo.fullName} Resume</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-white">
            ${element.innerHTML}
        </body>
        </html>
    `;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocx = () => {
     // A simple hack to export as a Word-readable HTML file
     const element = document.getElementById('resume-preview');
     if (!element) return;
     setShowExportMenu(false);

     const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <title>${data.personalInfo.fullName} Resume</title>
            <!-- Tailwind CDN won't work in Word, so we rely on the inline styles computed by the browser or simple defaults -->
            <style>
               body { font-family: Arial, sans-serif; }
            </style>
        </head>
        <body>
            ${element.innerHTML}
        </body>
        </html>
     `;
     const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword'
     });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.download = `${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.doc`;
     link.click();
     URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const getResumeText = (): string => {
      // Helper to flatten resume data for ATS analysis
      return `
        ${data.personalInfo.fullName}
        ${data.personalInfo.summary}
        
        EXPERIENCE:
        ${data.experience.map(e => `${e.role} at ${e.company}. ${e.description}`).join('\n')}
        
        SKILLS:
        ${data.skills.map(s => s.name).join(', ')}
        
        EDUCATION:
        ${data.education.map(e => `${e.degree} in ${e.field} from ${e.institution}`).join('\n')}
      `;
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-stone-100 overflow-hidden font-sans text-stone-900">
      {/* Header */}
      <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 z-20 shadow-sm no-print">
        <div className="flex items-center gap-2">
          <div className="bg-orange-600 text-white p-1.5 rounded-lg">
             <LayoutTemplate size={20} />
          </div>
          <h1 className="text-xl font-bold text-stone-800 tracking-tight">ResumeCraft</h1>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex bg-stone-100 p-1 rounded-lg">
              {(['modern', 'classic', 'minimal'] as TemplateType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTemplate(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                    activeTemplate === t ? 'bg-white text-orange-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {t}
                </button>
              ))}
           </div>
           
           <div className="h-6 w-px bg-stone-300 mx-2"></div>

           <button 
             onClick={() => setShowJobMatcher(!showJobMatcher)}
             className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${showJobMatcher ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'}`}
           >
             <AlertTriangle size={14} /> ATS Check
           </button>
           
           <button 
             onClick={() => setShowDocs(true)}
             className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-50"
           >
             <HelpCircle size={14} /> Docs
           </button>

           <div className="relative">
                <button 
                    onClick={() => setShowExportMenu(!showExportMenu)} 
                    disabled={isExporting}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-sm disabled:opacity-70"
                >
                    <Download size={14} /> {isExporting ? 'Exporting...' : 'Export'} <ChevronDown size={12} />
                </button>
                
                {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-stone-100 overflow-hidden z-50">
                        <button onClick={handleDownloadPdf} className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2">
                            <FileText size={14} /> PDF Document
                        </button>
                        <button onClick={handleDownloadHtml} className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2">
                             <FileCode size={14} /> HTML File
                        </button>
                        <button onClick={handleDownloadDocx} className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2">
                             <FileText size={14} /> Word (.doc)
                        </button>
                    </div>
                )}
           </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Editor */}
        <div className="w-full md:w-[450px] lg:w-[500px] flex-shrink-0 bg-white shadow-xl z-10 no-print flex flex-col h-full border-r border-stone-200">
            {showJobMatcher ? (
                <div className="p-4 h-full overflow-y-auto bg-stone-50/50">
                    <button onClick={() => setShowJobMatcher(false)} className="mb-4 text-sm text-stone-500 hover:text-stone-800 flex items-center gap-1">← Back to Editor</button>
                    <JobMatcher resumeText={getResumeText()} />
                </div>
            ) : (
                <ResumeForm data={data} onChange={setData} />
            )}
        </div>

        {/* Right: Preview */}
        <div className="flex-1 overflow-auto bg-stone-100 p-8 flex justify-center items-start">
          <div 
            id="resume-preview" 
            className="bg-white shadow-2xl origin-top print:shadow-none print:m-0 print:w-full"
            style={{ 
                width: '8.5in', 
                minHeight: '11in',
                transform: 'scale(1)', // Can add zoom logic here
            }}
          >
             {activeTemplate === 'modern' && <ModernTemplate data={data} />}
             {activeTemplate === 'classic' && <ClassicTemplate data={data} />}
             {activeTemplate === 'minimal' && <MinimalTemplate data={data} />}
          </div>
        </div>
      </div>
      
      {showDocs && <DocumentationModal onClose={() => setShowDocs(false)} />}
    </div>
  );
};

export default App;