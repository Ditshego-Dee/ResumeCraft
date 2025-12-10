import React from 'react';
import { ResumeData } from '../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Link as LinkIcon } from 'lucide-react';

interface TemplateProps {
  data: ResumeData;
  scale?: number;
}

// ================= MODERN TEMPLATE =================
export const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white text-stone-800 flex flex-row">
      {/* Sidebar */}
      <div className="w-1/3 bg-stone-900 text-white p-6 flex flex-col gap-6">
        <div className="text-center mb-4">
          <div className="w-24 h-24 bg-stone-700 rounded-full mx-auto flex items-center justify-center text-3xl font-bold mb-4 overflow-hidden border-2 border-stone-600 relative">
             {data.personalInfo.profilePicture ? (
                <img src={data.personalInfo.profilePicture} alt={data.personalInfo.fullName} className="w-full h-full object-cover" />
             ) : (
                <span>{data.personalInfo.fullName.charAt(0)}</span>
             )}
          </div>
          <h2 className="text-xl font-bold uppercase tracking-widest mb-1">{data.personalInfo.fullName}</h2>
        </div>

        <div className="space-y-3 text-sm">
          <h3 className="text-stone-400 uppercase tracking-widest text-xs font-semibold border-b border-stone-700 pb-1 mb-3">Contact</h3>
          {data.personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail size={14} /> <span className="break-all">{data.personalInfo.email}</span>
            </div>
          )}
          {data.personalInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone size={14} /> <span>{data.personalInfo.phone}</span>
            </div>
          )}
          {data.personalInfo.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} /> <span>{data.personalInfo.location}</span>
            </div>
          )}
          {data.personalInfo.linkedin && (
            <div className="flex items-center gap-2">
              <Linkedin size={14} /> <a href={data.personalInfo.linkedin} className="hover:text-stone-300">LinkedIn</a>
            </div>
          )}
          {data.personalInfo.website && (
            <div className="flex items-center gap-2">
              <Globe size={14} /> <a href={data.personalInfo.website} className="hover:text-stone-300">Portfolio</a>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-stone-400 uppercase tracking-widest text-xs font-semibold border-b border-stone-700 pb-1 mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map(skill => (
              <span key={skill.id} className="bg-stone-800 px-2 py-1 rounded text-xs text-stone-200">
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-8 space-y-6">
        {data.personalInfo.summary && (
          <section>
            <h3 className="text-stone-900 font-bold uppercase tracking-wider border-b-2 border-stone-200 pb-2 mb-3">Profile</h3>
            <p className="text-sm leading-relaxed text-stone-600 whitespace-pre-line">{data.personalInfo.summary}</p>
          </section>
        )}

        <section>
          <h3 className="text-stone-900 font-bold uppercase tracking-wider border-b-2 border-stone-200 pb-2 mb-4">Experience</h3>
          <div className="space-y-4">
            {data.experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-stone-800">{exp.role}</h4>
                  <span className="text-xs text-stone-500 font-medium">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="text-sm text-stone-600 font-semibold mb-2">{exp.company}</div>
                <div className="text-sm text-stone-600 leading-relaxed whitespace-pre-line pl-2 border-l-2 border-stone-200">
                  {exp.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-stone-900 font-bold uppercase tracking-wider border-b-2 border-stone-200 pb-2 mb-4">Education</h3>
          <div className="space-y-4">
            {data.education.map(edu => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-stone-800">{edu.institution}</h4>
                  <span className="text-xs text-stone-500 font-medium">{edu.startDate} - {edu.current ? 'Present' : edu.endDate}</span>
                </div>
                <div className="text-sm text-stone-600">{edu.degree}, {edu.field}</div>
              </div>
            ))}
          </div>
        </section>

         {data.projects.length > 0 && (
          <section>
            <h3 className="text-stone-900 font-bold uppercase tracking-wider border-b-2 border-stone-200 pb-2 mb-4">Projects</h3>
            <div className="space-y-4">
              {data.projects.map(proj => (
                <div key={proj.id}>
                  <h4 className="font-bold text-stone-800 flex items-center gap-2">
                    {proj.name}
                    {proj.link && <a href={proj.link} className="text-stone-400 hover:text-stone-600"><LinkIcon size={12}/></a>}
                  </h4>
                  <p className="text-sm text-stone-600 leading-relaxed mt-1">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// ================= CLASSIC TEMPLATE =================
export const ClassicTemplate: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white text-stone-900 p-10 font-serif">
      <header className="text-center border-b-2 border-stone-800 pb-6 mb-8">
        <h1 className="text-3xl font-bold mb-3 uppercase tracking-wide">{data.personalInfo.fullName}</h1>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-stone-600">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
          {data.personalInfo.linkedin && <span>• LinkedIn</span>}
        </div>
      </header>

      {data.personalInfo.summary && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-stone-300 mb-3 pb-1">Professional Summary</h2>
          <p className="text-sm leading-relaxed text-justify">{data.personalInfo.summary}</p>
        </section>
      )}

      <section className="mb-6">
        <h2 className="text-lg font-bold uppercase border-b border-stone-300 mb-4 pb-1">Experience</h2>
        <div className="space-y-5">
          {data.experience.map(exp => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-base">{exp.company}</h3>
                <span className="text-sm italic">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <div className="text-sm font-semibold mb-2">{exp.role}</div>
              <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-line pl-4">
                 {exp.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-bold uppercase border-b border-stone-300 mb-4 pb-1">Education</h2>
        <div className="space-y-3">
          {data.education.map(edu => (
            <div key={edu.id} className="flex justify-between">
              <div>
                <h3 className="font-bold text-sm">{edu.institution}</h3>
                <div className="text-sm italic">{edu.degree} in {edu.field}</div>
              </div>
              <div className="text-sm">{edu.startDate} – {edu.current ? 'Present' : edu.endDate}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-8">
        <section className="flex-1">
           <h2 className="text-lg font-bold uppercase border-b border-stone-300 mb-3 pb-1">Skills</h2>
           <p className="text-sm leading-relaxed">
             {data.skills.map(s => s.name).join(' • ')}
           </p>
        </section>
      </div>
    </div>
  );
};

// ================= MINIMAL TEMPLATE =================
export const MinimalTemplate: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white text-stone-900 p-8 font-mono">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">{data.personalInfo.fullName}</h1>
          <p className="text-sm text-stone-500 max-w-md">{data.personalInfo.summary}</p>
        </div>
        <div className="text-right text-xs text-stone-500 space-y-1">
          <p>{data.personalInfo.email}</p>
          <p>{data.personalInfo.phone}</p>
          <p>{data.personalInfo.location}</p>
          <p>{data.personalInfo.website}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8">
        <div className="col-span-1 space-y-8">
           <section>
            <h6 className="font-bold uppercase text-xs tracking-widest border-b border-stone-900 pb-2 mb-3">Skills</h6>
            <ul className="text-xs space-y-1">
              {data.skills.map(s => <li key={s.id}>{s.name}</li>)}
            </ul>
           </section>

           <section>
            <h6 className="font-bold uppercase text-xs tracking-widest border-b border-stone-900 pb-2 mb-3">Education</h6>
            {data.education.map(edu => (
              <div key={edu.id} className="mb-3 text-xs">
                <div className="font-bold">{edu.institution}</div>
                <div>{edu.degree}</div>
                <div className="text-stone-500">{edu.endDate}</div>
              </div>
            ))}
           </section>
        </div>

        <div className="col-span-3 space-y-8">
           <section>
            <h6 className="font-bold uppercase text-xs tracking-widest border-b border-stone-900 pb-2 mb-4">Experience</h6>
            {data.experience.map(exp => (
              <div key={exp.id} className="mb-6">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-sm">{exp.role}</h3>
                  <span className="text-xs text-stone-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="text-xs mb-2 text-stone-600">{exp.company}</div>
                <p className="text-xs leading-5 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
           </section>

           {data.projects.length > 0 && (
             <section>
              <h6 className="font-bold uppercase text-xs tracking-widest border-b border-stone-900 pb-2 mb-4">Projects</h6>
              {data.projects.map(proj => (
                <div key={proj.id} className="mb-4">
                  <h3 className="font-bold text-sm">{proj.name}</h3>
                  <p className="text-xs mt-1 text-stone-600">{proj.description}</p>
                </div>
              ))}
             </section>
           )}
        </div>
      </div>
    </div>
  );
};