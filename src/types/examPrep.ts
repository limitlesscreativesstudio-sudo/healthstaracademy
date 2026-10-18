// CNA State Exam Prep Types

export type QuizMode = 'study' | 'timed' | 'category';

export type QuestionCategory = 
  | 'patient-rights'
  | 'infection-control'
  | 'safety-emergency'
  | 'basic-nursing'
  | 'personal-care'
  | 'vital-signs'
  | 'nutrition-hydration'
  | 'elimination'
  | 'mobility'
  | 'mental-health'
  | 'communication'
  | 'end-of-life'
  | 'abuse-neglect'
  | 'body-mechanics'
  | 'hipaa';

export interface CategoryInfo {
  id: QuestionCategory;
  name: string;
  description: string;
}

export interface Question {
  id: number;
  category: QuestionCategory;
  scenario: string;
  stem: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: {
    correct: string;
    incorrectA?: string;
    incorrectB?: string;
    incorrectC?: string;
    incorrectD?: string;
  };
  cdphReference?: string;
  keywords: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizSession {
  id: string;
  mode: QuizMode;
  startTime: Date;
  endTime?: Date;
  questions: Question[];
  answers: Record<number, 'A' | 'B' | 'C' | 'D' | null>;
  bookmarkedQuestions: number[];
  currentQuestionIndex: number;
  category?: QuestionCategory;
  isComplete: boolean;
}

export interface QuizResult {
  sessionId: string;
  mode: QuizMode;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  percentage: number;
  categoryBreakdown: Record<QuestionCategory, {
    total: number;
    correct: number;
    percentage: number;
  }>;
  timeSpent: number; // in seconds
  averageTimePerQuestion: number;
  completedAt: Date;
}

export interface UserProgress {
  totalQuestionsAnswered: number;
  totalCorrect: number;
  overallPercentage: number;
  categoryPerformance: Record<QuestionCategory, {
    attempted: number;
    correct: number;
    percentage: number;
  }>;
  weakestCategories: QuestionCategory[];
  strongestCategories: QuestionCategory[];
  streak: number;
  lastPracticeDate: string;
  missedQuestionIds: number[];
  flaggedQuestionIds: number[];
  quizHistory: QuizResult[];
  achievements: string[];
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'patient-rights', name: 'Patient Rights & Ethical Responsibilities', description: 'Rights of residents, informed consent, and ethical decision-making' },
  { id: 'infection-control', name: 'Infection Control & Standard Precautions', description: 'Hand hygiene, PPE, isolation procedures, and preventing disease spread' },
  { id: 'safety-emergency', name: 'Safety & Emergency Procedures', description: 'Fire safety, fall prevention, and emergency response protocols' },
  { id: 'basic-nursing', name: 'Basic Nursing Skills', description: 'Fundamental nursing procedures and bedside care' },
  { id: 'personal-care', name: 'Personal Care Skills', description: 'Bathing, grooming, dressing, and personal hygiene assistance' },
  { id: 'vital-signs', name: 'Vital Signs & Measurements', description: 'Temperature, pulse, respiration, blood pressure, and weight measurements' },
  { id: 'nutrition-hydration', name: 'Nutrition & Hydration', description: 'Feeding assistance, special diets, and fluid intake monitoring' },
  { id: 'elimination', name: 'Elimination & Toileting', description: 'Bowel and bladder care, catheter care, and ostomy assistance' },
  { id: 'mobility', name: 'Range of Motion & Mobility', description: 'Transfers, ambulation, positioning, and exercise assistance' },
  { id: 'mental-health', name: 'Mental Health & Social Needs', description: 'Cognitive impairments, emotional support, and social interaction' },
  { id: 'communication', name: 'Communication & Documentation', description: 'Effective communication, charting, and reporting observations' },
  { id: 'end-of-life', name: 'End-of-Life Care', description: 'Comfort care, hospice, and supporting dying residents and families' },
  { id: 'abuse-neglect', name: 'Abuse, Neglect & Reporting', description: 'Recognizing and reporting abuse, neglect, and exploitation' },
  { id: 'body-mechanics', name: 'Body Mechanics & Positioning', description: 'Proper lifting techniques and resident positioning' },
  { id: 'hipaa', name: 'HIPAA & Confidentiality', description: 'Privacy regulations and protecting resident information' },
];

export const getCategoryById = (id: QuestionCategory): CategoryInfo | undefined => {
  return CATEGORIES.find(cat => cat.id === id);
};
