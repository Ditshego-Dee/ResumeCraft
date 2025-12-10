export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  link?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
    summary: string;
    profilePicture?: string;
  };
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
}

export type TemplateType = 'modern' | 'classic' | 'minimal';

export interface AtsAnalysisResult {
  match_score: number;
  analysis_summary: string;
  keyword_analysis: {
    matched_terms: string[];
    missing_terms: string[];
  };
  improvement_suggestions: {
    section: string;
    suggestion: string;
  }[];
}

export enum GeneratorStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}