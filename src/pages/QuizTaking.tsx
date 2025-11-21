import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function QuizTaking() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const { data: quiz } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          *,
          course_modules(
            id,
            title,
            quiz_data
          )
        `)
        .eq("id", quizId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (finalAnswers: Record<number, string>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const quizData = quiz?.course_modules?.quiz_data as any;
      const questions = quizData?.questions || [];
      
      let correctCount = 0;
      questions.forEach((q: any, index: number) => {
        if (finalAnswers[index] === q.correctAnswer) {
          correctCount++;
        }
      });

      const finalScore = Math.round((correctCount / questions.length) * 100);
      setScore(finalScore);
      setShowResults(true);

      // Save attempt
      await supabase.from("adaptive_quiz_attempts").insert({
        user_id: user.id,
        quiz_id: quizId,
        score: finalScore,
        questions_presented: questions,
        difficulty_progression: {},
      });

      return finalScore;
    },
  });

  if (!quiz) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  const quizData = quiz.course_modules?.quiz_data as any;
  const questions = quizData?.questions || [];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      toast({
        title: "Incomplete quiz",
        description: "Please answer all questions before submitting",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate(answers);
  };

  if (showResults) {
    const passed = score >= (quiz.passing_score || 70);
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            {passed ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            <CardTitle className="text-3xl">
              {passed ? "Congratulations!" : "Keep Learning"}
            </CardTitle>
            <CardDescription>
              You scored {score}% on this quiz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Your Score</p>
                <Progress value={score} className="h-4" />
              </div>
              <p className="text-muted-foreground">
                {passed
                  ? "You've successfully completed this quiz!"
                  : `You need ${quiz.passing_score || 70}% to pass. Review the material and try again.`}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            {!passed && (
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry Quiz
              </Button>
            )}
            <Button onClick={() => navigate(-1)}>
              Return to Course
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>{quiz.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Question {currentQuestion + 1} of {questions.length}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">{question?.question}</h3>
            <RadioGroup
              value={answers[currentQuestion] || ""}
              onValueChange={handleAnswer}
            >
              {question?.options?.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent cursor-pointer">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
