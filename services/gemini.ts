import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FormTemplate, FieldType, AIAnalysisResult } from '../types';

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for Form Generation
const formSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the feedback form" },
    description: { type: Type.STRING, description: "Short description for the user filling the form" },
    industry: { type: Type.STRING, description: "The industry category" },
    fields: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique simplified key for field (e.g., 'cleanliness')" },
          label: { type: Type.STRING, description: "The question text" },
          type: { type: Type.STRING, enum: ['text', 'rating', 'choice', 'yesno'] },
          options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Options for choice questions" },
          required: { type: Type.BOOLEAN }
        },
        required: ["id", "label", "type"]
      }
    }
  },
  required: ["title", "description", "fields"]
};

// Schema for Analysis
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Executive summary of the feedback" },
    sentimentScore: { type: Type.NUMBER, description: "Overall sentiment score from 0 (negative) to 100 (positive)" },
    sentimentTrend: { type: Type.STRING, enum: ['positive', 'neutral', 'negative'] },
    keyThemes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of recurring topics" },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING, description: "Actionable advice" },
          priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
        },
        required: ["title", "description", "priority"]
      }
    }
  },
  required: ["summary", "sentimentScore", "recommendations"]
};

export const generateFormWithAI = async (prompt: string): Promise<Partial<FormTemplate>> => {
  const client = getClient();
  const fullPrompt = `Create a professional feedback form based on this request: "${prompt}". 
  Ensure questions are relevant and actionable. Use 'rating' for satisfaction questions.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: formSchema,
        systemInstruction: "You are an expert survey designer for large institutions.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as Partial<FormTemplate>;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

export const analyzeFeedbackWithAI = async (
  formContext: FormTemplate, 
  responses: Record<string, any>[]
): Promise<AIAnalysisResult> => {
  const client = getClient();
  
  // Prepare data for context
  const dataString = JSON.stringify(responses.slice(0, 50)); // Limit to 50 for token safety in this demo
  const contextString = `Form Title: ${formContext.title}. Industry: ${formContext.industry}.`;
  
  const prompt = `Analyze the following survey responses. 
  ${contextString}
  
  Responses Data:
  ${dataString}
  
  Provide a deep analysis with a focus on actionable management decisions.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a senior data analyst consultant. Your goal is to give critical, constructive, and actionable advice based on data patterns.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
};