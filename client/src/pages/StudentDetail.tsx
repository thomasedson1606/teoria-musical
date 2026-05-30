import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Trophy, BookOpen } from "lucide-react";

const STORAGE_KEY = "teoria_musical_leaderboard";

function loadLeaderboard() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function getAccuracyColor(pct: number) { if (pct >= 80) return "text-green-600"; if (pct >= 50) return "text-yellow-600"; return "text-red-600"; }
function getAccuracyBg(pct: number) { if (pct >= 80) return "bg-green-100"; if (pct >= 50) return "bg-yellow-100"; return "bg-red-100"; }

export default function StudentDetail() {
  const params = useParams();
  const studentName = params?.name ? decodeURIComponent(params.name) : "";
  const [, setLocation] = useLocation();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("teacher_token");
    if (!token) { setLocation("/teacher-login"); return; }
    setLeaderboard(loadLeaderboard());
  }, []);

  const sessions = useMemo(() => {
    const entries = leaderboard.filter((e: any) => e.name === studentName);
    return entries.map((e: any, i: number) => ({
      id: i + 1,
      correctAnswers: e.score || 0,
      totalQuestions: 20,
      wrongAnswers: e.wrong || 0,
      createdAt: e.date ? new Date(e.date.split("/").reverse().join("-")).toISOString() : new Date().toISOString(),
    })).reverse();
  }, [leaderboard, studentName]);

  const overallAccuracy = useMemo(() => {
    if (!sessions.length) return 0;
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalQ = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
    return totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
  }, [sessions]);

  const recentAccuracy = useMemo(() => {
    if (!sessions.length) return 0;
    const last5 = sessions.slice(0, 5);
    const totalCorrect = last5.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalQ = last5.reduce((sum, s) => sum + s.totalQuestions, 0);
    return totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
  }, [sessions]);

  const totalSessions = sessions.length;
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
  const totalWrong = sessions.reduce((sum, s) => sum + s.wrongAnswers, 0);

  const trend = recentAccuracy > overallAccuracy
    ? { icon: TrendingUp as React.ElementType, color: "text-green-600", text: "Melhorando" }
    : recentAccuracy < overallAccuracy
    ? { icon: TrendingDown as React.ElementType, color: "text-red-600", text: "Precisa de atenção" }
    : { icon: Minus as React.ElementType, color: "text-gray-600", text: "Estável" };

  if (!studentName) {
    return <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center"><p className="text-gray-500">Aluno não encontrado.</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">{studentName.charAt(0).toUpperCase()}</div>
            <div><h1 className="text-2xl md:text-3xl font-bold text-gray-800">{studentName}</h1><p className="text-sm text-gray-500">Relatório detalhado de desempenho</p></div>
          </div>
          <button onClick={() => setLocation("/teacher")} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"><ArrowLeft className="w-4 h-4" />Voltar ao Painel</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, color: "text-indigo-600", label: "Sessões", value: totalSessions },
            { icon: Trophy, color: "text-green-600", label: "Acertos", value: totalCorrect },
            { icon: Minus, color: "text-red-600", label: "Erros", value: totalWrong },
            { icon: trend.icon, color: trend.color, label: trend.text, value: `${overallAccuracy}%` },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md border-0 p-6 text-center">
              {React.createElement(card.icon, { className: `w-6 h-6 ${card.color} mx-auto mb-2` })}
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4"><h2 className="flex items-center gap-2 text-base font-bold"><TrendingUp className="w-5 h-5" />Progresso ao Longo do Tempo</h2></div>
            <div className="p-4">
              {sessions.length === 0 ? <p className="text-gray-400 text-center py-8">Nenhuma sessão encontrada.</p> : (
                <div className="space-y-2">
                  {[...sessions].reverse().map((s: any, i: number) => {
                    const pct = Math.round((s.correctAnswers / s.totalQuestions) * 100);
                    return (
                      <div key={s.id} className="flex items-center gap-3 text-sm">
                        <span className="text-gray-400 w-8 text-right font-mono">#{i + 1}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className={`font-semibold w-12 text-right ${getAccuracyColor(pct)}`}>{pct}%</span>
                        <span className="text-gray-400 text-xs w-20 text-right">{new Date(s.createdAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4"><h2 className="flex items-center gap-2 text-base font-bold"><BookOpen className="w-5 h-5" />Histórico de Sessões</h2></div>
            <div className="p-4">
              {sessions.length === 0 ? <p className="text-gray-400 text-center py-8">Nenhuma sessão encontrada.</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">#</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Acertos</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Total</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Aproveitamento</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">Data</th>
                    </tr></thead>
                    <tbody>
                      {sessions.map((s: any, i: number) => {
                        const pct = Math.round((s.correctAnswers / s.totalQuestions) * 100);
                        return (
                          <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-3 font-mono text-gray-400">{i + 1}</td>
                            <td className="py-3 px-3 font-semibold text-green-600">{s.correctAnswers}</td>
                            <td className="py-3 px-3 text-gray-600">{s.totalQuestions}</td>
                            <td className="py-3 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getAccuracyBg(pct)} ${getAccuracyColor(pct)}`}>{pct}%</span></td>
                            <td className="py-3 px-3 text-right text-gray-400 text-xs">{new Date(s.createdAt).toLocaleString("pt-BR")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
