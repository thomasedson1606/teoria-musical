import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, BarChart3 } from "lucide-react";

interface ResultsScreenProps {
  studentName: string;
  correctAnswers: number;
  totalQuestions: number;
  onRestart: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  studentName,
  correctAnswers,
  totalQuestions,
  onRestart,
}) => {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const performance = percentage >= 80 ? "Excelente!" : percentage >= 60 ? "Bom!" : "Continue praticando!";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <Trophy className="w-12 h-12 mx-auto mb-3" />
          <CardTitle className="text-2xl">Exercício Concluído!</CardTitle>
        </CardHeader>

        <CardContent className="pt-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">Aluno</p>
            <p className="text-2xl font-bold text-gray-800">{studentName}</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-indigo-600 mr-2" />
              <span className="text-gray-700 font-medium">Seu Desempenho</span>
            </div>

            <div className="text-center mb-6">
              <p className="text-5xl font-bold text-indigo-600 mb-2">{percentage}%</p>
              <p className="text-lg font-semibold text-gray-700">{performance}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Acertos</p>
                <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
              </div>
              <div className="bg-white rounded p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Erros</p>
                <p className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</p>
              </div>
            </div>
          </div>

          <Button
            onClick={onRestart}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg"
            size="lg"
          >
            Fazer Novo Exercício
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
