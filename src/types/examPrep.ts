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
  questionCount: number;
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
  { id: 'patient-rights', name: 'Patient Rights & Ethical Responsibilities', description: 'Rights of residents, informed consent, and ethical decision-making', questionCount: 12 },
  { id: 'infection-control', name: 'Infection Control & Standard Precautions', description: 'Hand hygiene, PPE, isolation procedures, and preventing disease spread', questionCount: 15 },
  { id: 'safety-emergency', name: 'Safety & Emergency Procedures', description: 'Fire safety, fall prevention, and emergency response protocols', questionCount: 14 },
  { id: 'basic-nursing', name: 'Basic Nursing Skills', description: 'Fundamental nursing procedures and bedside care', questionCount: 16 },
  { id: 'personal-care', name: 'Personal Care Skills', description: 'Bathing, grooming, dressing, and personal hygiene assistance', questionCount: 13 },
  { id: 'vital-signs', name: 'Vital Signs & Measurements', description: 'Temperature, pulse, respiration, blood pressure, and weight measurements', questionCount: 12 },
  { id: 'nutrition-hydration', name: 'Nutrition & Hydration', description: 'Feeding assistance, special diets, and fluid intake monitoring', questionCount: 11 },
  { id: 'elimination', name: 'Elimination & Toileting', description: 'Bowel and bladder care, catheter care, and ostomy assistance', questionCount: 10 },
  { id: 'mobility', name: 'Range of Motion & Mobility', description: 'Transfers, ambulation, positioning, and exercise assistance', questionCount: 13 },
  { id: 'mental-health', name: 'Mental Health & Social Needs', description: 'Cognitive impairments, emotional support, and social interaction', questionCount: 10 },
  { id: 'communication', name: 'Communication & Documentation', description: 'Effective communication, charting, and reporting observations', questionCount: 12 },
  { id: 'end-of-life', name: 'End-of-Life Care', description: 'Comfort care, hospice, and supporting dying residents and families', questionCount: 8 },
  { id: 'abuse-neglect', name: 'Abuse, Neglect & Reporting', description: 'Recognizing and reporting abuse, neglect, and exploitation', questionCount: 10 },
  { id: 'body-mechanics', name: 'Body Mechanics & Positioning', description: 'Proper lifting techniques and resident positioning', questionCount: 11 },
  { id: 'hipaa', name: 'HIPAA & Confidentiality', description: 'Privacy regulations and protecting resident information', questionCount: 8 },
];

export const getCategoryById = (id: QuestionCategory): CategoryInfo | undefined => {
  return CATEGORIES.find(cat => cat.id === id);
};
