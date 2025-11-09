import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz, useSubmitQuiz } from '@/hooks/useCourses';
import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

console.info('✝️ Quiz Page — Christ is Lord over assessment');

export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { data: quiz, isLoading } = useQuiz(quizId!);
  const submitQuiz = useSubmitQuiz();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <PageTemplate title="Quiz Not Found">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            This quiz could not be found.
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];

  const handleSubmit = () => {
    // Calculate score based on answered questions
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((q: any) => {
      const points = q.points || 10;
      totalPoints += points;
      if (answers[q.id] === q.answer_index) {
        earnedPoints += points;
      }
    });

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    setScore(percentage);
    setSubmitted(true);

    // Submit to database
    submitQuiz.mutate(
      {
        courseId: quiz.course_id,
        moduleId: quiz.module_id,
        score: percentage,
      },
      {
        onSuccess: () => {
          toast({
            title: percentage >= 70 ? '✅ Quiz Passed!' : '❌ Quiz Not Passed',
            description: `You scored ${percentage}%. ${percentage >= 70 ? 'ScrollCoins have been added!' : 'Keep studying and try again.'}`,
          });
        },
      }
    );
  };

  const allAnswered = questions.length > 0 && questions.every((q: any) => answers[q.id] !== undefined);

  return (
    <PageTemplate title={quiz.title || 'Module Quiz'}>
      <div className="space-y-6">
        {submitted && score !== null && (
          <Card className={score >= 70 ? 'border-green-500' : 'border-red-500'}>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {score >= 70 ? (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500" />
                  )}
                  <div>
                    <p className="text-lg font-semibold">
                      {score >= 70 ? 'Congratulations!' : 'Keep Practicing'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your score: <span className="font-bold text-lg">{score}%</span>
                    </p>
                  </div>
                </div>
                <Button onClick={() => navigate(-1)}>Back to Module</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {questions.length > 0 ? (
          questions.map((q: any, idx: number) => (
            <Card key={q.id}>
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-start justify-between">
                  <span>
                    {idx + 1}. {q.prompt}
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {q.points || 10} pts
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {q.choices && q.choices.map((choice: string, i: number) => (
                    <label
                      key={i}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                        submitted
                          ? i === q.answer_index
                            ? 'border-green-500 bg-green-500/10'
                            : answers[q.id] === i
                            ? 'border-red-500 bg-red-500/10'
                            : ''
                          : answers[q.id] === i
                          ? 'border-primary bg-primary/10'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === i}
                        onChange={() => !submitted && setAnswers({ ...answers, [q.id]: i })}
                        disabled={submitted}
                        className="w-4 h-4"
                      />
                      <span className="flex-1">{choice}</span>
                      {submitted && i === q.answer_index && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {submitted && answers[q.id] === i && i !== q.answer_index && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No questions available for this quiz.
            </CardContent>
          </Card>
        )}

        {!submitted && questions.length > 0 && (
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || submitQuiz.isPending}
              className="flex items-center gap-2"
            >
              {submitQuiz.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
