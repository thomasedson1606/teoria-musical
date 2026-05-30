import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, BookOpen } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [studentName, setStudentName] = useState("");
  const [, setLocation] = useLocation();

  const handleStartExercise = () => {
    if (studentName.trim()) {
      setLocation(`/exercise?name=${encodeURIComponent(studentName)}`);
    }
  };

  const handleGoToRanking = () => {
    setLocation("/ranking");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleStartExercise();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Music className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Teoria Musical
            </h1>
            <Music className="w-10 h-10 text-purple-600" />
          </div>
          <p className="text-lg text-gray-600">
            Exercícios interativos de leitura de notas no pentagrama
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
          </CardHeader>

          <CardContent className="pt-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Digite seu nome para começar:
              </label>
              <Input
                type="text"
                placeholder="Seu nome completo"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
              />
            </div>

            <Button
              onClick={handleStartExercise}
              disabled={!studentName.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105"
              size="lg"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Iniciar Exercício
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            <Button
              onClick={handleGoToRanking}
              variant="outline"
              className="w-full border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-3 rounded-lg transition"
              size="lg"
            >
              Ver Painel de Ranking
            </Button>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-800 mb-2">Como Funciona</h3>
              <p className="text-sm text-gray-600">
                Responda 20 atividades sobre notas musicais no pentagrama em Clave de Sol. Dois tipos de exercícios: identifique a nota clicando nos botões ou posicione a nota arrastando-a. Receba feedback imediato e acompanhe seu desempenho.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-800 mb-2">Painel do Professor</h3>
              <p className="text-sm text-gray-600">
                Acesse o ranking para visualizar o desempenho de todos os alunos e acompanhar o progresso.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
