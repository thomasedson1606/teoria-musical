import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { GraduationCap, Users, ClipboardList, HelpCircle, ArrowLeft, LogOut, TrendingUp, TrendingDown, Minus, Trash2 } from "lucide-react";
import { getStaffLeaderboard, getPianoLeaderboard, getTeachers, deleteStudent, deleteTeacher } from "@/lib/sheetsApi";

function getAccuracyColor(pct: number) { if (pct >= 80) return "text-green-600"; if (pct >= 50) return "text-yellow-600"; return "text-red-600"; }
function getAccuracyBg(pct: number) { if (pct >= 80) return "bg-green-100"; if (pct >= 50) return "bg-yellow-100"; return "bg-red-100"; }

export default function TeacherDashboard() {
  const [, setLocation] = useLocation();
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [confirmDeleteTeacher, setConfirmDeleteTeacher] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [staff, piano] = await Promise.all([getStaffLeaderboard(), getPianoLeaderboard()]);
    setLeaderboard([...staff, ...piano].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0)));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("teacher_token");
    if (!token) { setLocation("/teacher-login"); return; }
    const info = localStorage.getItem("teacher_info");
    if (info) { try { setTeacherInfo(JSON.parse(info)); } catch {} }
    loadData();
    getTeachers().then(setTeachers).catch(() => {});
  }, []);

  const stats = useMemo(() => {
    const entries = leaderboard;
    const uniqueStudents = new Set(entries.map((e: any) => e.name)).size;
    const totalSessions = entries.length;
    const totalCorrect = entries.reduce((s: number, e: any) => s + (e.score || 0), 0);
    const totalWrong = entries.reduce((s: number, e: any) => s + (e.wrong || 0), 0);
    return { totalStudents: uniqueStudents, totalSessions, totalAnswers: totalCorrect + totalWrong, totalCorrect, totalWrong };
  }, [leaderboard]);

  const recentSessions = useMemo(() => {
    return [...leaderboard].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 20);
  }, [leaderboard]);

  const students = useMemo(() => {
    return [...new Set(leaderboard.map((e: any) => e.name))] as string[];
  }, [leaderboard]);

  const handleLogout = () => {
    localStorage.removeItem("teacher_token");
    localStorage.removeItem("teacher_info");
    setLocation("/teacher-login");
  };

  const handleDeleteStudent = async (name: string) => {
    await deleteStudent(name);
    setConfirmDelete(null);
    loadData();
  };

  const handleDeleteTeacher = async (code: string) => {
    await deleteTeacher(code);
    setConfirmDeleteTeacher(null);
    getTeachers().then(setTeachers).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Painel do Professor</h1>
              {teacherInfo && <p className="text-sm text-gray-500">{teacherInfo.schoolName && `${teacherInfo.schoolName} • `}{teacherInfo.subject && `${teacherInfo.subject} • `}Bem-vindo!</p>}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setLocation("/")} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"><ArrowLeft className="w-4 h-4" />Home</button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 cursor-pointer"><LogOut className="w-4 h-4" />Sair</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{ icon: Users, color: "bg-indigo-100", iconColor: "text-indigo-600", label: "Total de Alunos", value: stats.totalStudents },
            { icon: ClipboardList, color: "bg-purple-100", iconColor: "text-purple-600", label: "Total de Sessões", value: stats.totalSessions },
            { icon: HelpCircle, color: "bg-emerald-100", iconColor: "text-emerald-600", label: "Total de Respostas", value: stats.totalAnswers },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md border-0 p-6 flex items-center gap-4">
              <div className={`p-3 ${card.color} rounded-full`}>{React.createElement(card.icon, { className: `w-6 h-6 ${card.iconColor}` })}</div>
              <div><p className="text-3xl font-bold text-gray-800">{card.value}</p><p className="text-sm text-gray-500">{card.label}</p></div>
            </div>
          ))}
        </div>

        {teachers.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4"><h2 className="flex items-center gap-2 text-lg font-bold"><Users className="w-5 h-5" />Gerenciar Professores</h2></div>
            <div className="p-4 flex flex-wrap gap-2">
              {teachers.map((t: any, i: number) => (
                <div key={i} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-amber-800">{t.schoolName || "Sem escola"} — {t.subject || "Sem disciplina"} <span className="text-amber-500">({t.code})</span></span>
                  <button onClick={() => setConfirmDeleteTeacher(t.code)}
                    className="p-1 text-amber-400 hover:text-red-600 hover:bg-amber-100 rounded transition-colors cursor-pointer"
                    title="Excluir professor"
                  ><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4"><h2 className="flex items-center gap-2 text-lg font-bold"><Users className="w-5 h-5" />Alunos</h2></div>
            <div className="p-4">
              {students.length === 0 ? <p className="text-gray-400 text-center py-8">Nenhum aluno encontrado.</p> : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {students.map((name: string) => {
                    const entries = leaderboard.filter((e: any) => e.name === name);
                    const best = Math.max(...entries.map((e: any) => e.pct || 0));
                    return (
                      <div key={name} className="flex items-center gap-2">
                        <button onClick={() => setLocation(`/teacher/student/${encodeURIComponent(name)}`)}
                          className="flex-1 flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors text-left border border-gray-100 cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1"><p className="font-medium text-gray-800">{name}</p><p className="text-xs text-gray-400">{entries.length} sessões · Melhor: {best}%</p></div>
                        </button>
                        <button onClick={() => setConfirmDelete(name)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir aluno"
                        ><Trash2 className="w-4 h-4" /></button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4"><h2 className="flex items-center gap-2 text-lg font-bold"><TrendingUp className="w-5 h-5" />Sessões Recentes</h2></div>
            <div className="p-4">
              {recentSessions.length === 0 ? <p className="text-gray-400 text-center py-8">Nenhuma sessão recente.</p> : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentSessions.map((s: any, i: number) => {
                    const pct = s.pct || Math.round((s.score / (s.score + s.wrong || 20)) * 100);
                    const total = (s.score || 0) + (s.wrong || 0) || 20;
                    return (
                      <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                        <div><p className="font-medium text-gray-800 text-sm">{s.name}</p><p className="text-xs text-gray-400">{s.date || "N/A"} {s.activity && <>({s.activity === "piano" ? "Teclado" : "Pentagrama"})</>}</p></div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{s.score}/{total}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getAccuracyBg(pct)} ${getAccuracyColor(pct)}`}>
                            {pct >= 80 ? <TrendingUp className="w-3 h-3" /> : pct >= 50 ? <Minus className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {confirmDeleteTeacher && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDeleteTeacher(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800">Excluir professor</h3>
            <p className="text-sm text-gray-500">Tem certeza que deseja excluir o professor com código <strong>{confirmDeleteTeacher}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteTeacher(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
              >Cancelar</button>
              <button onClick={() => handleDeleteTeacher(confirmDeleteTeacher)}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 cursor-pointer"
              >Excluir</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800">Excluir aluno</h3>
            <p className="text-sm text-gray-500">Tem certeza que deseja excluir <strong>{confirmDelete}</strong>? Todas as sessões dele serão removidas.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
              >Cancelar</button>
              <button onClick={() => handleDeleteStudent(confirmDelete)}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 cursor-pointer"
              >Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
