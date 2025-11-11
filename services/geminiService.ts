
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

// Access the API key from Vite environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not set. Please add it to your environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
      atsScore: {
        type: Type.NUMBER,
        description: 'An estimated ATS compatibility score out of 100, based on the job description.',
      },
      strengths: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of what the resume does well for ATS in relation to the job description.',
      },
      recommendations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            area: { type: Type.STRING, description: 'e.g., Keywords, Formatting, Action Verbs' },
            suggestion: { type: Type.STRING, description: 'A specific suggestion for improvement to better match the job description.' },
          },
        },
        description: 'A list of actionable recommendations to improve the resume for this specific job.',
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
        description: 'A list of 5 suggested job titles based on the resume and job description.',
      },
    },
     required: ["atsScore", "strengths", "recommendations", "suggestedJobs"],
  };


export const analyzeResumeForATS = async (resumeText: string, jobDescription: string): Promise<AnalysisResult> => {
  const prompt = `
    Analyze the following resume text for Applicant Tracking System (ATS) compatibility and its fitness for the specific job description provided. The ATS score should reflect how well the resume is tailored to the job description.

    Job Description:
    ---
    ${jobDescription}
    ---

    Resume Text:
    ---
    ${resumeText}
    ---

    Provide your analysis in the following JSON format. Ensure the JSON is valid and complete. The strengths, recommendations, and suggested jobs should all be in the context of the provided job description.
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

    const rawJsonText = response.text;
    if (!rawJsonText) {
      throw new Error('Empty response from AI');
    }
    // The response can sometimes be wrapped in markdown backticks.
    const jsonText = rawJsonText.trim().replace(/^```json\s*/, '').replace(/```$/, '');

    return JSON.parse(jsonText);

  } catch (error) {
    console.error('Error analyzing resume:', error);
     if (error instanceof SyntaxError) { // Catches JSON.parse errors
        throw new Error('The AI returned an invalid response. Please try again.');
    }
    throw new Error('The AI analysis service is currently unavailable. Please try again later.');
  }
};