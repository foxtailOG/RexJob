import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

// Assume process.env.API_KEY is available
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
      atsScore: {
        type: Type.NUMBER,
        description: 'An estimated ATS compatibility score out of 100.',
      },
      strengths: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of what the resume does well for ATS.',
      },
      recommendations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            area: { type: Type.STRING, description: 'e.g., Keywords, Formatting, Action Verbs' },
            suggestion: { type: Type.STRING, description: 'A specific suggestion for improvement.' },
          },
        },
        description: 'A list of actionable recommendations to improve the resume.',
      },
      suggestedJobs: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            reason: { type: Type.STRING },
          },
        },
        description: 'A list of 5 suggested job titles.',
      },
    },
     required: ["atsScore", "strengths", "recommendations", "suggestedJobs"],
  };


export const analyzeResumeForATS = async (resumeText: string): Promise<AnalysisResult> => {
    if (!API_KEY) {
        // Return mock data if API key is not available
        return new Promise(resolve => setTimeout(() => resolve({
            atsScore: 85,
            strengths: ["Strong action verbs used throughout.", "Clear, concise descriptions of responsibilities."],
            recommendations: [
                { area: "Keywords", suggestion: "Incorporate more keywords from job descriptions relevant to 'Software Engineer'." },
                { area: "Formatting", suggestion: "Ensure dates are consistently formatted (e.g., MM/YYYY)." }
            ],
            suggestedJobs: [
                { title: "Senior Frontend Developer", reason: "Strong experience in React and UI/UX principles." },
                { title: "Full Stack Engineer", reason: "Experience with both frontend and backend technologies mentioned." }
            ]
        }), 1500));
    }

  const prompt = `
    Analyze the following resume text for Applicant Tracking System (ATS) compatibility and suggest improvements. Also, suggest 5 relevant job titles based on the resume.

    Resume Text:
    ---
    ${resumeText}
    ---

    Provide your analysis in the following JSON format. Ensure the JSON is valid and complete.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });
    
    const jsonText = response.text.trim();
    // A simple validation to ensure we have a parseable object.
    if (jsonText.startsWith('{') && jsonText.endsWith('}')) {
        return JSON.parse(jsonText);
    } else {
         throw new Error('Received malformed JSON from AI.');
    }
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to get analysis from AI. Please check your API key and try again.');
  }
};