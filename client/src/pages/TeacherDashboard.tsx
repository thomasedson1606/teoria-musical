import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  GraduationCap, Users, ClipboardList, HelpCircle,
  ArrowLeft, LogOut, Loader2, TrendingUp, TrendingDown, Minus,
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

export default function TeacherDashboard() {
  const [, setLocation] = useLocation();
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [showStudents, setShowStudents] = useState(true);

  const dashboardQuery = trpc.teacher.getDashboard.useQuery(undefined, {
    retry: false,
  });
  const studentsQuery = trpc.teacher.getStudents.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    const info = localStorage.getItem("teacher_info");
    if (info) {
      try { setTeacherInfo(JSON.parse(info)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (dashboardQuery.error || studentsQuery.error) {
      localStorage.removeItem("teacher_token");
      localStorage.removeItem("teacher_info");
      setLocation("/teacher-login");
    }
  }, [dashboardQuery.error, studentsQuery.error]);

  const handleLogout = () => {
    localStorage.removeItem("teacher_token");
    localStorage.removeItem("teacher_info");
    setLocation("/teacher-login");
  };

  if (dashboardQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando painel...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardQuery.data?.stats;
  const recentSessions = dashboardQuery.data?.recentSessions || [];
  const noteStats = dashboardQuery.data?.noteStats || [];
  const students = studentsQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Painel do Professor</h1>
              {teacherInfo && (
                <p className="text-sm text-gray-500">
                  {teacherInfo.schoolName && `${teacherInfo.schoolName} • `}
                  {teacherInfo.subject && `${teacherInfo.subject} • `}
                  Bem-vindo!
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-md border-0">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-full">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stats?.totalStudents ?? 0}</p>
                <p className="text-sm text-gray-500">Total de Alunos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-0">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <ClipboardList className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stats?.totalSessions ?? 0}</p>
                <p className="text-sm text-gray-500">Total de Sessões</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-0">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-full">
                <HelpCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stats?.totalAnswers ?? 0}</p>
                <p className="text-sm text-gray-500">Total de Respostas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student List */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Alunos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {students.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum aluno encontrado.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {students.map((name: string) => (
                    <button
                      key={name}
                      onClick={() => setLocation(`/teacher/student/${encodeURIComponent(name)}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors text-left border border-gray-100"
                    >
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{name}</p>
                        <p className="text-xs text-gray-400">Ver relatório completo</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Note Difficulty */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Dificuldade das Notas (Geral)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {noteStats.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum dado disponível.</p>
              ) : (
                <div className="space-y-3">
                  {noteStats
                    .sort((a: any, b: any) => a.accuracy - b.accuracy)
                    .map((stat: any) => (
                      <div key={stat.note} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-gray-700">{stat.note}</span>
                          <span className={`font-semibold ${getAccuracyColor(stat.accuracy)}`}>
                            {stat.accuracy}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all ${getAccuracyBg(stat.accuracy)}`}
                            style={{ width: `${stat.accuracy}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400">
                          {stat.correct} acertos / {stat.wrong} erros ({stat.total} total)
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Sessões Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {recentSessions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhuma sessão recente.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-600">Aluno</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-600">Acertos</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-600">Total</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-600">Aproveitamento</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-600">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSessions.map((s: any) => {
                      const pct = Math.round((s.correctAnswers / s.totalQuestions) * 100);
                      return (
                        <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 font-medium text-gray-800">{s.studentName}</td>
                          <td className="py-3 px-2 text-center text-green-600 font-semibold">{s.correctAnswers}</td>
                          <td className="py-3 px-2 text-center text-gray-600">{s.totalQuestions}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getAccuracyBg(pct)} ${getAccuracyColor(pct)}`}>
                              {pct >= 80 ? <TrendingUp className="w-3 h-3" /> : pct >= 50 ? <Minus className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {pct}%
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right text-gray-400 text-xs">
                            {new Date(s.createdAt).toLocaleDateString("pt-BR")}
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
