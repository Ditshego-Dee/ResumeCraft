import React, { useState } from 'react';
import { ResumeData, WorkExperience, Education, Skill, Project, GeneratorStatus } from '../types';
import { generateProfessionalSummary, optimizeExperienceDescription, generateSkills, refineContent } from '../services/geminiService';
import { Plus, Trash2, Wand2, ChevronDown, ChevronUp, Briefcase, GraduationCap, User, Wrench, FolderGit2, RefreshCw, Sparkles, Tag, Upload, X } from 'lucide-react';

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({ data, onChange }) => {
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [targetJob, setTargetJob] = useState('');
  const [industryKeywords, setIndustryKeywords] = useState('');

  const updateField = (section: keyof ResumeData, value: any) => {
    onChange({ ...data, [section]: value });
  };

  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonalInfo('profilePicture', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiSummary = async () => {
    setLoadingAI('summary');
    try {
      const summary = await generateProfessionalSummary(data, targetJob, industryKeywords);
      updatePersonalInfo('summary', summary);
    } catch (e) {
      alert("Failed to generate summary. Check console.");
    } finally {
      setLoadingAI(null);
    }
  };

  const handleRefineSummary = async () => {
    if (!data.personalInfo.summary) return;
    setLoadingAI('refine-summary');
    try {
        const refined = await refineContent(data.personalInfo.summary, "Make it more professional and concise");
        updatePersonalInfo('summary', refined);
    } catch (e) {
        alert("Failed to refine.");
    } finally {
        setLoadingAI(null);
    }
  };

  const handleAiOptimizeExp = async (index: number) => {
    setLoadingAI(`exp-${index}`);
    try {
      const exp = data.experience[index];
      const optimizedDesc = await optimizeExperienceDescription(exp, targetJob, industryKeywords);
      const newExp = [...data.experience];
      newExp[index] = { ...exp, description: optimizedDesc };
      updateField('experience', newExp);
    } catch (e) {
        alert("Failed to optimize. Check console.");
    } finally {
      setLoadingAI(null);
    }
  };

  const handleRefineExp = async (index: number) => {
    const exp = data.experience[index];
    if (!exp.description) return;
    setLoadingAI(`refine-exp-${index}`);
    try {
        const refined = await refineContent(exp.description, "Improve action verbs and clarity based on user edits");
        const newExp = [...data.experience];
        newExp[index] = { ...exp, description: refined };
        updateField('experience', newExp);
    } catch (e) {
        alert("Failed to refine.");
    } finally {
        setLoadingAI(null);
    }
  };

  const handleSuggestSkills = async () => {
    if(!targetJob && !industryKeywords) {
        alert("Please enter a Target Job Title or Industry Keywords below to extract skills.");
        return;
    }
    setLoadingAI('skills');
    try {
        const suggestedSkills = await generateSkills(targetJob, industryKeywords);
        const existingNames = new Set(data.skills.map(s => s.name.toLowerCase()));
        const newSkills: Skill[] = suggestedSkills
            .filter(name => !existingNames.has(name.toLowerCase()))
            .map(name => ({
                id: crypto.randomUUID(),
                name,
                level: 'Intermediate'
            }));
        
        updateField('skills', [...data.skills, ...newSkills]);
    } catch (e) {
        alert("Failed to suggest skills.");
    } finally {
        setLoadingAI(null);
    }
  }

  // Helper to manage array fields
  const addItem = (section: 'experience' | 'education' | 'projects' | 'skills') => {
    const id = crypto.randomUUID();
    let newItem: any;
    if (section === 'experience') {
      newItem = { id, company: '', role: '', startDate: '', endDate: '', current: false, description: '' };
    } else if (section === 'education') {
      newItem = { id, institution: '', degree: '', field: '', startDate: '', endDate: '', current: false };
    } else if (section === 'projects') {
      newItem = { id, name: '', description: '', link: '' };
    } else {
      newItem = { id, name: '', level: 'Intermediate' };
    }
    updateField(section, [...data[section], newItem]);
  };

  const removeItem = (section: 'experience' | 'education' | 'projects' | 'skills', id: string) => {
    const list = data[section] as any[];
    updateField(section, list.filter(item => item.id !== id));
  };

  const updateItem = (section: 'experience' | 'education' | 'projects' | 'skills', id: string, field: string, value: any) => {
    const list = data[section] as any[];
    const newList = list.map(item => item.id === id ? { ...item, [field]: value } : item);
    updateField(section, newList);
  };

  const sections = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'skills', label: 'Skills', icon: Wrench },
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Target Job Context */}
       <div className="p-4 bg-orange-50 border-b border-orange-100 flex-shrink-0 grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs font-semibold text-orange-800 uppercase tracking-wide mb-1 flex items-center gap-1">
               <Briefcase size={12} /> Target Role / Job Title
            </label>
            <input 
              type="text" 
              value={targetJob}
              onChange={(e) => setTargetJob(e.target.value)}
              placeholder="e.g. Senior React Developer"
              className="w-full text-sm p-2 border border-orange-200 rounded focus:ring-1 focus:ring-orange-500 bg-white text-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-orange-800 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Tag size={12} /> Industry Keywords / Jargon (Optional)
            </label>
            <input 
              type="text" 
              value={industryKeywords}
              onChange={(e) => setIndustryKeywords(e.target.value)}
              placeholder="e.g. Microservices, AWS, CI/CD, Agile (Guides AI output)"
              className="w-full text-sm p-2 border border-orange-200 rounded focus:ring-1 focus:ring-orange-500 bg-white text-stone-900"
            />
          </div>
       </div>

      {/* Navigation */}
      <div className="flex overflow-x-auto bg-white border-b border-stone-200 no-scrollbar flex-shrink-0">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeSection === s.id ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <s.icon size={16} /> {s.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* PERSONAL INFO */}
        {activeSection === 'personal' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Profile Picture Upload */}
             <div className="flex items-center gap-4 mb-2 p-3 bg-stone-50 rounded-lg border border-stone-100">
                {data.personalInfo.profilePicture ? (
                    <div className="relative group">
                        <img src={data.personalInfo.profilePicture} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                        <button 
                          onClick={() => updatePersonalInfo('profilePicture', '')} 
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove photo"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ) : (
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-stone-400 border-2 border-dashed border-stone-300">
                        <User size={24} />
                    </div>
                )}
                <div>
                    <label className="cursor-pointer bg-white border border-stone-300 px-3 py-1.5 rounded text-xs font-medium hover:bg-stone-50 hover:text-orange-600 transition-colors flex items-center gap-2 text-stone-700 shadow-sm">
                        <Upload size={14} /> 
                        {data.personalInfo.profilePicture ? 'Change Photo' : 'Upload Photo'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                    <p className="text-[10px] text-stone-500 mt-1">Optional. Recommended for Modern template.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Full Name</label>
                <input type="text" className="w-full p-2 border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={data.personalInfo.fullName} onChange={(e) => updatePersonalInfo('fullName', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Email</label>
                <input type="email" className="w-full p-2 border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={data.personalInfo.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Phone</label>
                <input type="text" className="w-full p-2 border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={data.personalInfo.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Location</label>
                <input type="text" className="w-full p-2 border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={data.personalInfo.location} onChange={(e) => updatePersonalInfo('location', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">LinkedIn URL</label>
                <input type="text" className="w-full p-2 border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={data.personalInfo.linkedin || ''} onChange={(e) => updatePersonalInfo('linkedin', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Portfolio/Website</label>
                <input type="text" className="w-full p-2 border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={data.personalInfo.website || ''} onChange={(e) => updatePersonalInfo('website', e.target.value)} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-stone-700">Professional Summary</label>
                <div className="flex gap-2">
                    <button 
                      onClick={handleRefineSummary}
                      disabled={loadingAI === 'refine-summary' || !data.personalInfo.summary}
                      className="text-xs flex items-center gap-1 text-stone-500 hover:text-stone-700 font-medium transition-colors border px-2 py-1 rounded"
                    >
                      <RefreshCw size={12} className={loadingAI === 'refine-summary' ? 'animate-spin' : ''} /> Learn from Edits
                    </button>
                    <button 
                      onClick={handleAiSummary}
                      disabled={loadingAI === 'summary'}
                      className="text-xs flex items-center gap-1 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-medium transition-colors px-2 py-1 rounded border border-rose-100"
                    >
                      <Sparkles size={12} /> {loadingAI === 'summary' ? 'Generating...' : 'Improve with AI'}
                    </button>
                </div>
              </div>
              <textarea 
                className="w-full p-3 border border-stone-300 rounded h-32 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" 
                value={data.personalInfo.summary} 
                onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                placeholder="Write a brief overview of your career..."
              />
            </div>
          </div>
        )}

        {/* EXPERIENCE */}
        {activeSection === 'experience' && (
          <div className="space-y-6 animate-fadeIn">
            {data.experience.map((exp, idx) => (
              <div key={exp.id} className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm relative group hover:border-orange-200 transition-colors">
                <button onClick={() => removeItem('experience', exp.id)} className="absolute top-4 right-4 text-stone-400 hover:text-red-500"><Trash2 size={16} /></button>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-stone-700 mb-1">Role/Title</label>
                    <input type="text" className="w-full p-2 border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={exp.role} onChange={(e) => updateItem('experience', exp.id, 'role', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-stone-700 mb-1">Company</label>
                    <input type="text" className="w-full p-2 border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={exp.company} onChange={(e) => updateItem('experience', exp.id, 'company', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Start Date</label>
                    <input type="text" placeholder="MM/YYYY" className="w-full p-2 border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={exp.startDate} onChange={(e) => updateItem('experience', exp.id, 'startDate', e.target.value)} />
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-stone-700 mb-1">End Date</label>
                      <input type="text" placeholder="MM/YYYY" disabled={exp.current} className="w-full p-2 border border-stone-300 rounded disabled:bg-stone-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={exp.endDate} onChange={(e) => updateItem('experience', exp.id, 'endDate', e.target.value)} />
                    </div>
                    <label className="flex items-center mb-3 gap-2 text-xs text-stone-600">
                      <input type="checkbox" className="text-orange-600 focus:ring-orange-500" checked={exp.current} onChange={(e) => updateItem('experience', exp.id, 'current', e.target.checked)} /> Current
                    </label>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-stone-700">Description</label>
                    <div className="flex gap-2">
                        <button 
                        onClick={() => handleRefineExp(idx)}
                        disabled={loadingAI === `refine-exp-${idx}` || !exp.description}
                        className="text-xs flex items-center gap-1 text-stone-500 hover:text-stone-700 font-medium transition-colors border px-2 py-1 rounded"
                        >
                        <RefreshCw size={12} className={loadingAI === `refine-exp-${idx}` ? 'animate-spin' : ''} /> Learn from Edits
                        </button>
                        <button 
                        onClick={() => handleAiOptimizeExp(idx)}
                        disabled={loadingAI === `exp-${idx}`}
                        className="text-xs flex items-center gap-1 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-medium transition-colors border border-rose-100 px-2 py-1 rounded"
                        >
                        <Sparkles size={12} /> {loadingAI === `exp-${idx}` ? 'Optimizing...' : 'Improve with AI'}
                        </button>
                    </div>
                  </div>
                  <textarea 
                    className="w-full p-2 border border-stone-300 rounded h-32 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" 
                    value={exp.description} 
                    onChange={(e) => updateItem('experience', exp.id, 'description', e.target.value)}
                    placeholder="• Achieved X by doing Y..."
                  />
                </div>
              </div>
            ))}
            <button onClick={() => addItem('experience')} className="w-full py-2 border-2 border-dashed border-stone-300 rounded-lg text-stone-500 hover:border-orange-500 hover:text-orange-500 transition-colors flex justify-center items-center gap-2 text-sm font-medium">
              <Plus size={16} /> Add Position
            </button>
          </div>
        )}

        {/* EDUCATION */}
        {activeSection === 'education' && (
          <div className="space-y-6 animate-fadeIn">
             {data.education.map(edu => (
               <div key={edu.id} className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm relative hover:border-orange-200 transition-colors">
                 <button onClick={() => removeItem('education', edu.id)} className="absolute top-4 right-4 text-stone-400 hover:text-red-500"><Trash2 size={16} /></button>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2">
                     <label className="block text-xs font-medium text-stone-700 mb-1">Institution</label>
                     <input type="text" className="w-full p-2 border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={edu.institution} onChange={(e) => updateItem('education', edu.id, 'institution', e.target.value)} />
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-stone-700 mb-1">Degree</label>
                     <input type="text" className="w-full p-2 border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={edu.degree} onChange={(e) => updateItem('education', edu.id, 'degree', e.target.value)} />
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-stone-700 mb-1">Field of Study</label>
                     <input type="text" className="w-full p-2 border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={edu.field} onChange={(e) => updateItem('education', edu.id, 'field', e.target.value)} />
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-stone-700 mb-1">Start Date</label>
                     <input type="text" className="w-full p-2 border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={edu.startDate} onChange={(e) => updateItem('education', edu.id, 'startDate', e.target.value)} />
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-stone-700 mb-1">End Date</label>
                     <input type="text" className="w-full p-2 border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={edu.endDate} onChange={(e) => updateItem('education', edu.id, 'endDate', e.target.value)} />
                   </div>
                 </div>
               </div>
             ))}
             <button onClick={() => addItem('education')} className="w-full py-2 border-2 border-dashed border-stone-300 rounded-lg text-stone-500 hover:border-orange-500 hover:text-orange-500 transition-colors flex justify-center items-center gap-2 text-sm font-medium">
              <Plus size={16} /> Add Education
            </button>
          </div>
        )}

        {/* PROJECTS */}
        {activeSection === 'projects' && (
           <div className="space-y-6 animate-fadeIn">
            {data.projects.map(proj => (
              <div key={proj.id} className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm relative hover:border-orange-200 transition-colors">
                <button onClick={() => removeItem('projects', proj.id)} className="absolute top-4 right-4 text-stone-400 hover:text-red-500"><Trash2 size={16} /></button>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Project Name</label>
                    <input type="text" className="w-full p-2 border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={proj.name} onChange={(e) => updateItem('projects', proj.id, 'name', e.target.value)} />
                  </div>
                   <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Link (Optional)</label>
                    <input type="text" className="w-full p-2 border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" value={proj.link || ''} onChange={(e) => updateItem('projects', proj.id, 'link', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Description</label>
                     <textarea 
                        className="w-full p-2 border border-stone-300 rounded h-24 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50" 
                        value={proj.description} 
                        onChange={(e) => updateItem('projects', proj.id, 'description', e.target.value)}
                        placeholder="Brief description of the project..."
                      />
                  </div>
                </div>
              </div>
            ))}
             <button onClick={() => addItem('projects')} className="w-full py-2 border-2 border-dashed border-stone-300 rounded-lg text-stone-500 hover:border-orange-500 hover:text-orange-500 transition-colors flex justify-center items-center gap-2 text-sm font-medium">
              <Plus size={16} /> Add Project
            </button>
           </div>
        )}

        {/* SKILLS */}
        {activeSection === 'skills' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-sm font-semibold text-orange-900">AI Skill Suggestions</h4>
                        <p className="text-xs text-orange-700 mt-1">Based on the target job title and industry keywords provided above.</p>
                    </div>
                    <button 
                        onClick={handleSuggestSkills}
                        disabled={loadingAI === 'skills'}
                        className="bg-white text-orange-600 border border-orange-200 px-3 py-1.5 rounded text-xs font-medium hover:bg-orange-50 transition-colors flex items-center gap-1 shadow-sm"
                    >
                        <Wand2 size={12} /> {loadingAI === 'skills' ? 'Analyzing...' : 'Suggest Skills'}
                    </button>
                </div>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {data.skills.map(skill => (
                    <div key={skill.id} className="flex items-center gap-2">
                        <input 
                            type="text" 
                            className="flex-1 p-2 text-sm border border-stone-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50/50"
                            value={skill.name}
                            onChange={(e) => updateItem('skills', skill.id, 'name', e.target.value)}
                            placeholder="Skill (e.g. React)"
                        />
                        <button onClick={() => removeItem('skills', skill.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                    </div>
                 ))}
             </div>
             
             <button onClick={() => addItem('skills')} className="w-full py-2 border-2 border-dashed border-stone-300 rounded-lg text-stone-500 hover:border-orange-500 hover:text-orange-500 transition-colors flex justify-center items-center gap-2 text-sm font-medium">
              <Plus size={16} /> Add Skill
            </button>
          </div>
        )}

      </div>
    </div>
  );
};