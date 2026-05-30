import React, { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { StaffDisplay } from "@/components/StaffDisplay";
import { AnswerInput } from "@/components/AnswerInput";
import { FeedbackDisplay } from "@/components/FeedbackDisplay";
import { ResultsScreen } from "@/components/ResultsScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle } from "lucide-react";
import { getRandomNote } from "@shared/musicNotes";

const TOTAL_QUESTIONS = 10;

export default function ExerciseScreen() {
  const search = useSearch();
  const [, setLocation] = useLocation();

  const params = new URLSearchParams(search);
  const studentName = params.get("name") || "Aluno";

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [currentNote, setCurrentNote] = useState<string>("");
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<{
    isCorrect: boolean;
    correctNote: string;
    studentAnswer: string;
  } | null>(null);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSessionMutation = trpc.exercise.startSession.useMutation();
  const submitAnswerMutation = trpc.exercise.submitAnswer.useMutation();

  useEffect(() => {
    const initSession = async () => {
      try {
        const result = await startSessionMutation.mutateAsync({
          studentName,
          totalQuestions: TOTAL_QUESTIONS,
        });
        setSessionId(result.sessionId);
        generateNewNote();
      } catch (err) {
        console.error("Error starting session:", err);
        setError("Erro ao iniciar a sessão. Tente novamente.");
      }
    };

    initSession();
  }, []);

  const generateNewNote = () => {
    const randomNote = getRandomNote();
    setCurrentNote(randomNote);
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const result = await submitAnswerMutation.mutateAsync({
        sessionId,
        questionNumber: currentQuestion,
        correctNote: currentNote,
        studentAnswer: answer,
      });

      setLastFeedback({
        isCorrect: result.isCorrect,
        correctNote: result.correctNote,
        studentAnswer: answer,
      });

      setShowFeedback(true);

      setTimeout(() => {
        if (currentQuestion >= TOTAL_QUESTIONS) {
          setIsSessionComplete(true);
        } else {
          setCurrentQuestion(currentQuestion + 1);
          if (result.isCorrect) {
            setScore(score + 1);
          }
          generateNewNote();
          setShowFeedback(false);
        }
      }, 2000);
    } catch (err) {
      console.error("Error submitting answer:", err);
      setError("Erro ao enviar resposta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setLocation("/");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-6 h-6" />
              <p className="font-semibold">Erro</p>
            </div>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => setLocation("/")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg"
            >
              Voltar para Home
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Iniciando exercício...</p>
        </div>
      </div>
    );
  }

  if (isSessionComplete && lastFeedback) {
    return (
      <ResultsScreen
        studentName={studentName}
        correctAnswers={score}
        totalQuestions={TOTAL_QUESTIONS}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Exercício de Teoria Musical</CardTitle>
                <p className="text-indigo-100 text-sm mt-1">{studentName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-indigo-100">Questão</p>
                <p className="text-2xl font-bold">{currentQuestion}/{TOTAL_QUESTIONS}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <Progress
              value={(currentQuestion / TOTAL_QUESTIONS) * 100}
              className="h-2"
            />
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardContent className="pt-8">
            {!showFeedback ? (
              <>
                <div className="text-center mb-6">
                  <p className="text-gray-600 font-medium">Identifique a nota musical</p>
                </div>

                <StaffDisplay note={currentNote} />

                <AnswerInput
                  onSubmit={handleAnswerSubmit}
                  isLoading={isLoading}
                />
              </>
            ) : lastFeedback ? (
              <FeedbackDisplay
                isCorrect={lastFeedback.isCorrect}
                correctNote={lastFeedback.correctNote}
                studentAnswer={lastFeedback.studentAnswer}
                score={score}
                totalQuestions={TOTAL_QUESTIONS}
              />
            ) : null}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Acertos</p>
                <p className="text-2xl font-bold text-green-600">{score}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Erros</p>
                <p className="text-2xl font-bold text-red-600">{currentQuestion - 1 - score}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Desempenho</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {Math.round((score / (currentQuestion - 1)) * 100) || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
