import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ResumeData, WorkExperience, AtsAnalysisResult } from '../types';

// Helper to get client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateProfessionalSummary = async (data: ResumeData, targetJobTitle?: string, industryKeywords?: string): Promise<string> => {
  const ai = getAiClient();
  const jobContext = targetJobTitle ? `Targeting the role of: ${targetJobTitle}` : '';
  const keywordContext = industryKeywords ? `Integrate these specific technical keywords/jargon naturally: ${industryKeywords}` : 'Use industry-standard terminology.';
  
  const prompt = `
    You are an expert career coach and resume writer. 
    Write a concise, high-impact professional resume summary (MAXIMUM 40-50 WORDS) for the following candidate.
    ${jobContext}
    ${keywordContext}
    
    Candidate Info:
    Name: ${data.personalInfo.fullName}
    Current/Past Roles: ${data.experience.map(e => e.role).join(', ')}
    Key Skills: ${data.skills.map(s => s.name).join(', ')}
    
    STRICT OUTPUT RULES:
    1. Return ONLY the summary paragraph text. 
    2. DO NOT include "Here is a summary", "Summary:", or any conversational filler.
    3. The summary MUST be short (2-3 sentences max) to fit perfectly in a resume header without overlapping.
    4. Focus on years of experience and key achievements.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const optimizeExperienceDescription = async (exp: WorkExperience, targetJobTitle?: string, industryKeywords?: string): Promise<string> => {
  const ai = getAiClient();
  const jobContext = targetJobTitle ? `Target Role: ${targetJobTitle}.` : '';
  const keywordContext = industryKeywords ? `MUST include these specific technical keywords/jargon: ${industryKeywords}.` : 'Include high-value industry-specific jargon and technical terminology.';
  
  const prompt = `
    You are an expert technical resume writer. Rewrite the following job description to be concise, high-impact, and results-driven.
    
    Context:
    ${jobContext}
    ${keywordContext}
    
    Guidelines:
    1. STRICTLY use bullet points (•).
    2. LIMIT to 3-4 bullet points maximum.
    3. Keep each bullet point concise (max 1-2 lines) to prevent layout overflow.
    4. Start every bullet with a power verb (e.g., Architected, Deployed, Optimized).
    5. Quantify results where possible (numbers, percentages).
    6. Replace generic terms with specific industry jargon.

    STRICT OUTPUT RULES:
    1. Return ONLY the list of bullet points.
    2. DO NOT include "Here is the rewritten description", "Revised version:", or any conversational text.
    3. Do not wrap the output in markdown code blocks.

    Role: ${exp.role} at ${exp.company}
    Original Description:
    ${exp.description}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || exp.description;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// New function for "Feedback Loop" / Refinement
export const refineContent = async (currentText: string, instruction: string = "Improve clarity and impact"): Promise<string> => {
  const ai = getAiClient();
  
  const prompt = `
    Act as a professional editor. Refine the following resume content based on this instruction: "${instruction}".
    Maintain the core facts but improve flow, grammar, and professional tone.
    Ensure keywords relevant to the industry are preserved.
    Keep the output concise and suitable for a resume layout.
    
    STRICT OUTPUT RULES:
    1. Return ONLY the refined text.
    2. DO NOT include "Here is the improved text" or any conversational filler.
    
    Content to refine:
    ${currentText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || currentText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const analyzeWithAts = async (resumeText: string, jobDescription: string): Promise<AtsAnalysisResult> => {
  const ai = getAiClient();

  const prompt = `
    You are an expert Resume Analyst specializing in Applicant Tracking Systems (ATS) and professional resume optimization. Your task is to analyze a candidate's existing resume content against a specific job description. Your output MUST be a single, valid JSON object that strictly adheres to the requested schema.

    --- JOB DESCRIPTION ---
    ${jobDescription.substring(0, 5000)}

    --- CANDIDATE RESUME CONTENT ---
    ${resumeText.substring(0, 5000)}

    --- TASK INSTRUCTIONS ---
    1. **Calculate Match Score:** Assess the candidate's content alignment with the JD's core skills and responsibilities. Score must be an integer (0-100).
    2. **Identify Key Match Terms:** Extract the top 5 most critical keywords from the JD that are explicitly present in the resume.
    3. **Identify Gaps/Missing Terms:** Extract the top 3 most critical keywords/requirements from the JD that are missing or under-emphasized in the resume.
    4. **Provide High-Impact Suggestions:** Give 2-3 specific, high-impact action items (using the STAR or XYZ method) that the candidate should implement to raise the score, referencing the missing terms.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      match_score: { type: Type.INTEGER },
      analysis_summary: { type: Type.STRING },
      keyword_analysis: {
        type: Type.OBJECT,
        properties: {
          matched_terms: { type: Type.ARRAY, items: { type: Type.STRING } },
          missing_terms: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["matched_terms", "missing_terms"]
      },
      improvement_suggestions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            section: { type: Type.STRING },
            suggestion: { type: Type.STRING }
          },
          required: ["section", "suggestion"]
        }
      }
    },
    required: ["match_score", "analysis_summary", "keyword_analysis", "improvement_suggestions"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AtsAnalysisResult;
  } catch (error) {
    console.error("ATS Analysis Error:", error);
    throw error;
  }
};

export const generateSkills = async (jobInput: string, industryKeywords?: string): Promise<string[]> => {
    const ai = getAiClient();
    const prompt = `
      Identify the top 10 most valuable hard and soft skills for the following job context.
      
      Job Context: "${jobInput}"
      ${industryKeywords ? `Focus areas/Keywords: "${industryKeywords}"` : ''}
      
      Instructions:
      1. If the input is a Job Description, extract the most critical matching skills.
      2. If the input is just a Job Title, infer the most in-demand high-value skills for 2024/2025 in that specific industry.
      3. Prioritize specific tools, frameworks, and methodologies (jargon) over generic terms (e.g., use "Kubernetes" instead of "Containerization" if applicable).
      
      Return ONLY a JSON array of strings.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
      });
      const text = response.text;
      return text ? JSON.parse(text) : [];
    } catch (error) {
      console.error("Skill generation error", error);
      return [];
    }
}