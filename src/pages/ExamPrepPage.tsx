import { useState } from "react";
import { QuizProvider, useQuiz } from "@/contexts/QuizContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, QuestionCategory, getCategoryById } from "@/types/examPrep";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import { BookOpen, Clock, Target, CheckCircle, XCircle, Bookmark, ArrowLeft, ArrowRight, RotateCcw, Trophy, Brain, Timer } from "lucide-react";

const ModeSelection = () => {
  const { startQuiz } = useQuiz();
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null);
  const [questionCount, setQuestionCount] = useState(25);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">California CNA State Exam Prep</h1>
        <p className="text-gray-medium max-w-2xl mx-auto">Master the 175 CDPH-aligned practice questions and boost your confidence for the California CNA certification exam.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-medium transition-shadow cursor-pointer border-2 hover:border-primary" onClick={() => startQuiz('study', undefined, 175)}>
          <CardHeader className="text-center">
            <BookOpen className="w-12 h-12 mx-auto text-primary mb-2" />
            <CardTitle>Study Mode</CardTitle>
            <CardDescription>Learn at your own pace with immediate feedback and detailed explanations</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-medium space-y-1">
              <li>✓ Unlimited time per question</li>
              <li>✓ Instant feedback & explanations</li>
              <li>✓ Navigate freely between questions</li>
              <li>✓ Bookmark questions for review</li>
            </ul>
            <Button className="w-full mt-4">Start Studying</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-medium transition-shadow cursor-pointer border-2 hover:border-secondary" onClick={() => startQuiz('timed')}>
          <CardHeader className="text-center">
            <Timer className="w-12 h-12 mx-auto text-secondary mb-2" />
            <CardTitle>Timed Exam Mode</CardTitle>
            <CardDescription>Simulate real exam conditions with 75 questions in 2 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-medium space-y-1">
              <li>✓ 2-hour countdown timer</li>
              <li>✓ 75 randomized questions</li>
              <li>✓ No going back (like real exam)</li>
              <li>✓ Results at the end only</li>
            </ul>
            <Button variant="secondary" className="w-full mt-4">Start Exam</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-medium transition-shadow border-2 hover:border-accent">
          <CardHeader className="text-center">
            <Target className="w-12 h-12 mx-auto text-accent mb-2" />
            <CardTitle>Category Drill</CardTitle>
            <CardDescription>Focus on specific skill areas to strengthen weak spots</CardDescription>
          </CardHeader>
          <CardContent>
            <select 
              className="w-full p-2 border rounded mb-2 text-sm"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value as QuestionCategory)}
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              className="w-full p-2 border rounded mb-4 text-sm"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            >
              <option value={10}>10 Questions</option>
              <option value={25}>25 Questions</option>
              <option value={50}>50 Questions</option>
            </select>
            <Button 
              variant="outline" 
              className="w-full border-accent text-accent hover:bg-accent hover:text-white"
              disabled={!selectedCategory}
              onClick={() => selectedCategory && startQuiz('category', selectedCategory, questionCount)}
            >
              Start Drill
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 bg-muted">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Brain className="w-5 h-5" /> 15 CDPH-Aligned Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {CATEGORIES.map(cat => (
              <Badge key={cat.id} variant="outline" className="justify-center py-2 text-xs">
                {cat.name.split(' ').slice(0, 2).join(' ')} ({cat.questionCount})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const QuizInterface = () => {
  const { currentSession, answerQuestion, nextQuestion, previousQuestion, toggleBookmark, endQuiz, resetQuiz } = useQuiz();
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizResult, setQuizResult] = useState<ReturnType<typeof endQuiz>>(null);

  if (!currentSession) return null;

  if (currentSession.isComplete || quizResult) {
    const result = quizResult || endQuiz();
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <Trophy className="w-16 h-16 mx-auto text-primary mb-4" />
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{result?.correctAnswers}</div>
                <div className="text-sm text-gray-medium">Correct</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{result?.incorrectAnswers}</div>
                <div className="text-sm text-gray-medium">Incorrect</div>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-3xl font-bold text-primary">{result?.percentage}%</div>
                <div className="text-sm text-gray-medium">Score</div>
              </div>
            </div>
            <div className="text-center text-sm text-gray-medium">
              Time: {Math.floor((result?.timeSpent || 0) / 60)}m {(result?.timeSpent || 0) % 60}s | 
              Avg: {result?.averageTimePerQuestion}s per question
            </div>
            <Button className="w-full" onClick={resetQuiz}>Back to Menu</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = currentSession.questions[currentSession.currentQuestionIndex];
  const userAnswer = currentSession.answers[question.id];
  const isBookmarked = currentSession.bookmarkedQuestions.includes(question.id);
  const progress = ((currentSession.currentQuestionIndex + 1) / currentSession.questions.length) * 100;
  const categoryInfo = getCategoryById(question.category);

  const handleAnswer = (answer: 'A' | 'B' | 'C' | 'D') => {
    answerQuestion(question.id, answer);
    if (currentSession.mode === 'study') setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentSession.currentQuestionIndex === currentSession.questions.length - 1) {
      setQuizResult(endQuiz());
    } else {
      nextQuestion();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={resetQuiz}><ArrowLeft className="w-4 h-4 mr-1" /> Exit</Button>
        <Badge variant="outline">{categoryInfo?.name}</Badge>
        <span className="text-sm text-gray-medium">Q {currentSession.currentQuestionIndex + 1}/{currentSession.questions.length}</span>
      </div>

      <Progress value={progress} className="mb-6 h-2" />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <Badge className="mb-2" variant={question.difficulty === 'easy' ? 'secondary' : question.difficulty === 'hard' ? 'destructive' : 'default'}>
              {question.difficulty}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => toggleBookmark(question.id)}>
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
            </Button>
          </div>
          {question.scenario && <p className="text-gray-medium italic mb-2">{question.scenario}</p>}
          <CardTitle className="text-lg">{question.stem}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(['A', 'B', 'C', 'D'] as const).map((option) => {
            const isSelected = userAnswer === option;
            const isCorrect = question.correctAnswer === option;
            const showResult = showExplanation && userAnswer;
            
            let buttonClass = "w-full justify-start text-left p-4 h-auto";
            if (showResult) {
              if (isCorrect) buttonClass += " bg-green-100 border-green-500 text-green-800";
              else if (isSelected && !isCorrect) buttonClass += " bg-red-100 border-red-500 text-red-800";
            } else if (isSelected) {
              buttonClass += " border-primary bg-primary/10";
            }

            return (
              <Button
                key={option}
                variant="outline"
                className={buttonClass}
                onClick={() => !showExplanation && handleAnswer(option)}
                disabled={showExplanation}
              >
                <span className="font-bold mr-3">{option}.</span>
                <span className="flex-1">{question.options[option]}</span>
                {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-600 ml-2" />}
                {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 ml-2" />}
              </Button>
            );
          })}

          {showExplanation && (
            <Card className="mt-4 bg-muted border-l-4 border-l-primary">
              <CardContent className="p-4">
                <h4 className="font-bold text-green-700 mb-2">✓ Correct Answer: {question.correctAnswer}</h4>
                <p className="text-sm mb-3">{question.explanation.correct}</p>
                {question.cdphReference && (
                  <p className="text-xs text-gray-medium italic">Reference: {question.cdphReference}</p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-4">
            {currentSession.mode !== 'timed' && (
              <Button variant="outline" onClick={previousQuestion} disabled={currentSession.currentQuestionIndex === 0}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
            )}
            <div className="flex-1" />
            {currentSession.mode === 'study' && !showExplanation && userAnswer && (
              <Button onClick={() => setShowExplanation(true)} className="mr-2">Show Explanation</Button>
            )}
            <Button onClick={handleNext}>
              {currentSession.currentQuestionIndex === currentSession.questions.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ExamPrepContent = () => {
  const { currentSession } = useQuiz();
  return currentSession ? <QuizInterface /> : <ModeSelection />;
};

const ExamPrepPage = () => {
  return (
    <QuizProvider>
      <SEO
        title="CNA State Exam Prep | Health Star Academy"
        description="Practice with 175 CDPH-aligned questions for the California CNA certification exam. Study mode, timed exams, and category drills."
        canonical="/programs/exam-prep"
        keywords="CNA practice exam, California CNA test prep, nursing assistant certification exam, CDPH CNA questions, CNA study guide, state exam practice, CNA certification test"
        structuredData={buildBreadcrumbSchema([{ name: "Programs", path: "/programs" }, { name: "Exam Prep", path: "/programs/exam-prep" }])}
      />
      <div className="container-custom section-padding">
        <ExamPrepContent />
        
        <div className="mt-12 p-6 bg-muted rounded-lg text-sm text-gray-medium">
          <h3 className="font-bold text-charcoal mb-2">California CNA State Exam Preparation Tool</h3>
          <p className="mb-2">This interactive prep tool is designed by Health Star Academy educators with extensive knowledge of the California Department of Public Health (CDPH) Certified Nurse Assistant certification requirements.</p>
          <p className="italic">Important Disclaimer: This tool is for preparation and educational purposes only. Success on this practice platform does not guarantee passing the official California CNA State Certification Exam.</p>
        </div>
      </div>
    </QuizProvider>
  );
};

export default ExamPrepPage;
