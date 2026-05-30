import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface FeedbackDisplayProps {
  isCorrect: boolean;
  correctNote: string;
  studentAnswer: string;
  score: number;
  totalQuestions: number;
}

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  isCorrect,
  correctNote,
  studentAnswer,
  score,
  totalQuestions,
}) => {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {isCorrect ? (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle className="w-16 h-16 text-green-500" />
          <h3 className="text-2xl font-bold text-green-600">Parabéns!</h3>
          <p className="text-lg text-gray-700">Resposta correta: <span className="font-bold">{correctNote}</span></p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <XCircle className="w-16 h-16 text-red-500" />
          <h3 className="text-2xl font-bold text-red-600">Incorreto</h3>
          <p className="text-gray-700">Você respondeu: <span className="font-bold">{studentAnswer}</span></p>
          <p className="text-lg text-gray-700">Resposta correta: <span className="font-bold">{correctNote}</span></p>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 w-full max-w-xs">
        <p className="text-center text-gray-600 text-sm mb-2">Placar</p>
        <p className="text-center text-3xl font-bold text-indigo-600">
          {score} / {totalQuestions}
        </p>
        <p className="text-center text-sm text-gray-600 mt-2">
          {Math.round((score / totalQuestions) * 100)}%
        </p>
      </div>
    </div>
  );
};
