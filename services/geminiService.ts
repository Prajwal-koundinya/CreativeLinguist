import { AnalysisResult } from "../types";

export const analyzeText = async (
  text: string, 
  fileData?: { mimeType: string; data: string },
  enableSearch: boolean = false
): Promise<AnalysisResult> => {
  
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        fileData,
        enableSearch
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data as AnalysisResult;

  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};
