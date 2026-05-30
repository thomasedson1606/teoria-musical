import React, { useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus,
  Trophy, BookOpen, Loader2,
} from "lucide-react";

function getAccuracyColor(pct: number) {
  if (pct >= 80) return "text-green-600";
  if (pct >= 50) return "text-yellow-600";
  return "text-red-600";
}

function getAccuracyBg(pct: number) {
  if (pct >= 80) return "bg-green-100";
  if (pct >= 50) return "bg-yellow-100";
  return "bg-red-100";
}

function MiniBar({ value, maxValue, color }: { value: number; maxValue: number; color: string }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      ></div>
    </div>
  );
}

function ProgressChart({ sessions }: { sessions: any[] }) {
  if (sessions.length === 0) return null;

  const sorted = [...sessions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="space-y-2">
      {sorted.map((s: any, i: number) => {
        const pct = Math.round((s.correctAnswers / s.totalQuestions) * 100);
        return (
          <div key={s.id} className="flex items-center gap-3 text-sm">
            <span className="text-gray-400 w-8 text-right font-mono">#{i + 1}</span>
            <div className="flex-1">
              <MiniBar value={pct} maxValue={100} color={
                pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"
              } />
            </div>
            <span className={`font-semibold w-12 text-right ${getAccuracyColor(pct)}`}>
              {pct}%
            </span>
            <span className="text-gray-400 text-xs w-20 text-right">
              {new Date(s.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function StudentDetail() {
  const params = useParams();
  const studentName = params?.name ? decodeURIComponent(params.name) : "";
  const [, setLocation] = useLocation();

  const detailQuery = trpc.teacher.getStudentDetail.useQuery(
    { studentName },
    { retry: false }
  );

  const overallAccuracy = useMemo(() => {
    if (!detailQuery.data?.sessions?.length) return 0;
    const totalCorrect = detailQuery.data.sessions.reduce(
      (sum: number, s: any) => sum + s.correctAnswers, 0
    );
    const totalQ = detailQuery.data.sessions.reduce(
      (sum: number, s: any) => sum + s.totalQuestions, 0
    );
    return totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
  }, [detailQuery.data]);

  const recentAccuracy = useMemo(() => {
    if (!detailQuery.data?.sessions?.length) return 0;
    const last5 = detailQuery.data.sessions.slice(0, 5);
    const totalCorrect = last5.reduce((sum: number, s: any) => sum + s.correctAnswers, 0);
    const totalQ = last5.reduce((sum: number, s: any) => sum + s.totalQuestions, 0);
    return totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
  }, [detailQuery.data]);

  const totalSessions = detailQuery.data?.sessions?.length || 0;
  const totalCorrect = detailQuery.data?.sessions?.reduce(
    (sum: number, s: any) => sum + s.correctAnswers, 0
  ) || 0;
  const totalQ = detailQuery.data?.sessions?.reduce(
    (sum: number, s: any) => sum + s.totalQuestions, 0
  ) || 0;
  const totalWrong = totalQ - totalCorrect;

  const trend = recentAccuracy > overallAccuracy
    ? { icon: TrendingUp, color: "text-green-600", text: "Melhorando" }
    : recentAccuracy < overallAccuracy
    ? { icon: TrendingDown, color: "text-red-600", text: "Precisa de atenção" }
    : { icon: Minus, color: "text-gray-600", text: "Estável" };

  if (detailQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (!studentName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <p className="text-gray-500">Aluno não encontrado.</p>
      </div>
    );
  }

  const noteStats = detailQuery.data?.noteStats || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
              {studentName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{studentName}</h1>
              <p className="text-sm text-gray-500">Relatório detalhado de desempenho</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation("/teacher")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Painel
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-md border-0">
            <CardContent className="pt-6 text-center">
              <BookOpen className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{totalSessions}</p>
              <p className="text-xs text-gray-500">Sessões</p>
            </CardContent>
          </Card>
          <Card className="shadow-md border-0">
            <CardContent className="pt-6 text-center">
              <Trophy className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{totalCorrect}</p>
              <p className="text-xs text-gray-500">Acertos</p>
            </CardContent>
          </Card>
          <Card className="shadow-md border-0">
            <CardContent className="pt-6 text-center">
              <Minus className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{totalWrong}</p>
              <p className="text-xs text-gray-500">Erros</p>
            </CardContent>
          </Card>
          <Card className="shadow-md border-0">
            <CardContent className="pt-6 text-center">
              <trend.icon className={`w-6 h-6 ${trend.color} mx-auto mb-2`} />
              <p className={`text-2xl font-bold ${trend.color}`}>{overallAccuracy}%</p>
              <p className="text-xs text-gray-500">{trend.text}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Note Difficulty */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5" />
                Dificuldade por Nota
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {noteStats.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum dado disponível.</p>
              ) : (
                <div className="space-y-4">
                  {noteStats
                    .sort((a: any, b: any) => a.accuracy - b.accuracy)
                    .map((stat: any) => (
                      <div key={stat.note} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700 text-sm">{stat.note}</span>
                          <span className={`text-sm font-bold ${getAccuracyColor(stat.accuracy)}`}>
                            {stat.accuracy}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${getAccuracyBg(stat.accuracy)}`}
                            style={{ width: `${stat.accuracy}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{stat.correct} acertos</span>
                          <span>{stat.wrong} erros</span>
                          <span>{stat.total} total</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Over Time */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5" />
                Progresso ao Longo do Tempo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {(detailQuery.data?.sessions?.length ?? 0) === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhuma sessão encontrada.</p>
              ) : (
                <ProgressChart sessions={detailQuery.data?.sessions || []} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Session History */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-5 h-5" />
              Histórico de Sessões
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {(detailQuery.data?.sessions?.length ?? 0) === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhuma sessão encontrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">#</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Acertos</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Total</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Aproveitamento</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detailQuery.data?.sessions || []).map((s: any, i: number) => {
                      const pct = Math.round((s.correctAnswers / s.totalQuestions) * 100);
                      return (
                        <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-3 font-mono text-gray-400">{i + 1}</td>
                          <td className="py-3 px-3 font-semibold text-green-600">{s.correctAnswers}</td>
                          <td className="py-3 px-3 text-gray-600">{s.totalQuestions}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getAccuracyBg(pct)} ${getAccuracyColor(pct)}`}>
                              {pct}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-gray-400 text-xs">
                            {new Date(s.createdAt).toLocaleString("pt-BR")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
