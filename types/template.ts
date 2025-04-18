// Template data types

export interface TemplateSection {
  id: string;
  title: string;
  description: string;
}

export interface Template {
  id: string;
  title: string;
  sections: TemplateSection[];
}

// Default templates
export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'meeting_notes',
    title: 'Meeting Notes',
    sections: [
      {
        id: 'meeting_highlights',
        title: 'Meeting Highlights',
        description: 'Key points and important information discussed during the meeting.'
      },
      {
        id: 'action_items',
        title: 'Action Items',
        description: 'Tasks, assignments, and follow-up items that need to be completed.'
      },
      {
        id: 'meeting_summary',
        title: 'Meeting Summary',
        description: 'A brief overview of what was discussed and decided in the meeting.'
      }
    ]
  }
];
