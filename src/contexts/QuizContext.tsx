import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Question, QuizMode, QuizSession, QuizResult, UserProgress, QuestionCategory, CATEGORIES } from '@/types/examPrep';
import { cnaQuestions } from '@/data/cnaQuestions';

interface QuizContextType {
  questions: Question[];
  currentSession: QuizSession | null;
  userProgress: UserProgress;
  startQuiz: (mode: QuizMode, category?: QuestionCategory, questionCount?: number) => void;
  answerQuestion: (questionId: number, answer: 'A' | 'B' | 'C' | 'D') => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  toggleBookmark: (questionId: number) => void;
  endQuiz: () => QuizResult | null;
  resetQuiz: () => void;
  getQuizResult: () => QuizResult | null;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

const STORAGE_KEY = 'cna_quiz_progress';

const getInitialProgress = (): UserProgress => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    overallPercentage: 0,
    categoryPerformance: {} as Record<QuestionCategory, { attempted: number; correct: number; percentage: number }>,
    weakestCategories: [],
    strongestCategories: [],
    streak: 0,
    lastPracticeDate: '',
    missedQuestionIds: [],
    flaggedQuestionIds: [],
    quizHistory: [],
    achievements: []
  };
};

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [questions] = useState<Question[]>(cnaQuestions);
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>(getInitialProgress);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
  }, [userProgress]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startQuiz = (mode: QuizMode, category?: QuestionCategory, questionCount: number = 75) => {
    let selectedQuestions: Question[];
    
    if (mode === 'category' && category) {
      selectedQuestions = shuffleArray(questions.filter(q => q.category === category)).slice(0, questionCount);
    } else if (mode === 'timed') {
      selectedQuestions = shuffleArray(questions).slice(0, 75);
    } else {
      selectedQuestions = shuffleArray(questions).slice(0, questionCount);
    }

    const session: QuizSession = {
      id: Date.now().toString(),
      mode,
      startTime: new Date(),
      questions: selectedQuestions,
      answers: {},
      bookmarkedQuestions: [],
      currentQuestionIndex: 0,
      category,
      isComplete: false
    };

    setCurrentSession(session);
  };

  const answerQuestion = (questionId: number, answer: 'A' | 'B' | 'C' | 'D') => {
    if (!currentSession) return;
    setCurrentSession(prev => prev ? {
      ...prev,
      answers: { ...prev.answers, [questionId]: answer }
    } : null);
  };

  const nextQuestion = () => {
    if (!currentSession) return;
    if (currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
      setCurrentSession(prev => prev ? {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      } : null);
    }
  };

  const previousQuestion = () => {
    if (!currentSession || currentSession.mode === 'timed') return;
    if (currentSession.currentQuestionIndex > 0) {
      setCurrentSession(prev => prev ? {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      } : null);
    }
  };

  const toggleBookmark = (questionId: number) => {
    if (!currentSession) return;
    setCurrentSession(prev => {
      if (!prev) return null;
      const bookmarks = prev.bookmarkedQuestions.includes(questionId)
        ? prev.bookmarkedQuestions.filter(id => id !== questionId)
        : [...prev.bookmarkedQuestions, questionId];
      return { ...prev, bookmarkedQuestions: bookmarks };
    });
  };

  const getQuizResult = (): QuizResult | null => {
    if (!currentSession) return null;

    const categoryBreakdown = {} as Record<QuestionCategory, { total: number; correct: number; percentage: number }>;
    CATEGORIES.forEach(cat => {
      categoryBreakdown[cat.id] = { total: 0, correct: 0, percentage: 0 };
    });

    let correct = 0;
    let answered = 0;

    currentSession.questions.forEach(q => {
      const userAnswer = currentSession.answers[q.id];
      categoryBreakdown[q.category].total++;
      if (userAnswer) {
        answered++;
        if (userAnswer === q.correctAnswer) {
          correct++;
          categoryBreakdown[q.category].correct++;
        }
      }
    });

    Object.keys(categoryBreakdown).forEach(key => {
      const cat = categoryBreakdown[key as QuestionCategory];
      cat.percentage = cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0;
    });

    const timeSpent = Math.floor((new Date().getTime() - new Date(currentSession.startTime).getTime()) / 1000);

    return {
      sessionId: currentSession.id,
      mode: currentSession.mode,
      totalQuestions: currentSession.questions.length,
      correctAnswers: correct,
      incorrectAnswers: answered - correct,
      unanswered: currentSession.questions.length - answered,
      percentage: answered > 0 ? Math.round((correct / answered) * 100) : 0,
      categoryBreakdown,
      timeSpent,
      averageTimePerQuestion: answered > 0 ? Math.round(timeSpent / answered) : 0,
      completedAt: new Date()
    };
  };

  const endQuiz = (): QuizResult | null => {
    const result = getQuizResult();
    if (result) {
      setUserProgress(prev => ({
        ...prev,
        totalQuestionsAnswered: prev.totalQuestionsAnswered + result.totalQuestions - result.unanswered,
        totalCorrect: prev.totalCorrect + result.correctAnswers,
        overallPercentage: Math.round(((prev.totalCorrect + result.correctAnswers) / (prev.totalQuestionsAnswered + result.totalQuestions - result.unanswered)) * 100) || 0,
        quizHistory: [...prev.quizHistory.slice(-9), result],
        lastPracticeDate: new Date().toISOString().split('T')[0]
      }));
      setCurrentSession(prev => prev ? { ...prev, isComplete: true, endTime: new Date() } : null);
    }
    return result;
  };

  const resetQuiz = () => {
    setCurrentSession(null);
  };

  return (
    <QuizContext.Provider value={{
      questions,
      currentSession,
      userProgress,
      startQuiz,
      answerQuestion,
      nextQuestion,
      previousQuestion,
      toggleBookmark,
      endQuiz,
      resetQuiz,
      getQuizResult
    }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) throw new Error('useQuiz must be used within QuizProvider');
  return context;
};
