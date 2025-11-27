export interface WordFrequency {
  word: string;
  count: number;
}

export interface Suggestion {
  original: string;
  improvement: string;
  reason: string;
  type: 'grammar' | 'clarity' | 'style';
}

export interface AnalysisResult {
  summary: string;
  readabilityScore: number; // 0-100
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestions: Suggestion[];
  wordFrequency: WordFrequency[];
  factCheck?: {
    verified: boolean;
    notes: string;
    sources: string[];
  };
}

export interface FileData {
  name: string;
  mimeType: string;
  data: string; // Base64
  content?: string; // Text content if available/extracted
}

export enum AnalysisMode {
  LINGUISTIC = 'LINGUISTIC',
  DEEP_RESEARCH = 'DEEP_RESEARCH'
}