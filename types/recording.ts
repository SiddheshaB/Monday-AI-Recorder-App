/**
 * Recording data types
 */

export interface RecordingSection {
  title: string;
  content: string;
}

export interface Recording {
  id: string;
  title: string;
  transcript: string;
  date: string;
  duration?: number;
  templateId?: string;
  processedSections?: RecordingSection[];
}
