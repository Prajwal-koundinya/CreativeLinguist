import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is not defined in the environment.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Schema for the linguistic analysis
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A concise summary of the text." },
    readabilityScore: { type: Type.NUMBER, description: "Flesch-Kincaid reading ease score (0-100)." },
    sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"] },
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          improvement: { type: Type.STRING },
          reason: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["grammar", "clarity", "style"] },
        },
        required: ["original", "improvement", "reason", "type"]
      }
    },
    wordFrequency: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          count: { type: Type.NUMBER }
        },
        required: ["word", "count"]
      },
      description: "Top 10 most frequent significant words (excluding stop words)."
    }
  },
  required: ["summary", "readabilityScore", "sentiment", "suggestions", "wordFrequency"]
};

export const analyzeText = async (
  text: string, 
  fileData?: { mimeType: string; data: string },
  enableSearch: boolean = false
): Promise<AnalysisResult> => {
  
  try {
    const modelId = "gemini-2.5-flash";
    
    // Construct parts
    const parts: any[] = [];
    
    if (fileData) {
      parts.push({
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.data
        }
      });
    }

    // Base prompt instructions
    let prompt = `
      Perform a deep linguistic analysis on the provided content.
      1. Provide a concise summary.
      2. Calculate a readability score (0 difficult, 100 easy).
      3. Determine the overall sentiment.
      4. List specific sentence-level suggestions for rewriting to improve grammar, clarity, or style.
      5. Analyze word frequency, excluding common stop-words (the, a, and, etc.).
    `;

    if (text) {
      parts.push({ text: `Content to analyze: \n${text}` });
    }
    
    const config: any = {
      systemInstruction: "You are an expert computational linguist and editor.",
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
    };

    if (enableSearch) {
        // Guidelines: DO NOT set responseMimeType and responseSchema when using googleSearch.
        delete config.responseMimeType;
        delete config.responseSchema;

        config.tools = [{ googleSearch: {} }];
        
        prompt += `
        \n\nAdditionally, verify any factual claims using Google Search. If you find discrepancies, include them in the summary or suggestions.
        
        IMPORTANT: Return the output as valid JSON matching the following structure:
        {
          "summary": "string",
          "readabilityScore": number,
          "sentiment": "positive" | "neutral" | "negative",
          "suggestions": [
            { "original": "string", "improvement": "string", "reason": "string", "type": "grammar" | "clarity" | "style" }
          ],
          "wordFrequency": [
            { "word": "string", "count": number }
          ]
        }
        Do not use Markdown code blocks. Just return the raw JSON string.
        `;
    }
    
    // Add instructions to parts (fixing bug where prompt instructions were ignored)
    parts.push({ text: prompt });

    // Send request
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: config
    });

    let resultText = response.text;
    if (!resultText) throw new Error("No response generated");

    // Clean up markdown code blocks if present (needed when schema is disabled for Search)
    resultText = resultText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    const parsed = JSON.parse(resultText);
    
    // Check for grounding metadata if search was used
    let factCheckData = undefined;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (enableSearch && groundingChunks) {
       const sources = groundingChunks
        .map((chunk: any) => chunk.web?.uri)
        .filter((uri: string) => uri);
       
       if (sources.length > 0) {
           factCheckData = {
             verified: true,
             notes: "Sources consulted via Google Search.",
             sources: [...new Set(sources)] as string[]
           };
       }
    }

    return {
      ...parsed,
      factCheck: factCheckData
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};