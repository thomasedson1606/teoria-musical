import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { GraduationCap, ArrowLeft, AlertCircle, UserPlus, Database } from "lucide-react";
import { verifyTeacher, registerTeacher, getApiUrl, setApiUrl, clearApiUrl } from "@/lib/sheetsApi";

export default function TeacherLogin() {
  const [, setLocation] = useLocation();
  const [teacherCode, setTeacherCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [setupCode, setSetupCode] = useState("");
  const [setupSchool, setSetupSchool] = useState("");
  const [setupSubject, setSetupSubject] = useState("");
  const [setupSuccess, setSetupSuccess] = useState("");
  const [showSheetsConfig, setShowSheetsConfig] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState(getApiUrl() || "");

  useEffect(() => {
    const existing = localStorage.getItem("teacher_token");
    if (existing) setLocation("/teacher");
    setSheetsUrl(getApiUrl() || "");
  }, []);

  const handleLogin = async () => {
    if (!teacherCode.trim()) { setError("Por favor, insira seu código de professor."); return; }
    setError(null);
    const found = await verifyTeacher(teacherCode.trim());
    if (!found) { setError("Código inválido. Verifique ou cadastre-se primeiro."); return; }
    localStorage.setItem("teacher_token", teacherCode.trim());
    localStorage.setItem("teacher_info", JSON.stringify(found));
    setLocation("/teacher");
  };

  const handleSetup = async () => {
    if (!setupCode.trim() || setupCode.trim().length < 4) { setError("O código deve ter no mínimo 4 caracteres."); return; }
    setError(null);
    setSetupSuccess("");
    const ok = await registerTeacher(setupCode.trim(), setupSchool.trim(), setupSubject.trim());
    if (!ok) { setError("Este código já existe."); return; }
    setSetupSuccess("Professor cadastrado com sucesso! Faça login.");
    setShowSetup(false);
    setSetupCode("");
    setSetupSchool("");
    setSetupSubject("");
  };

  const handleSaveSheetsUrl = () => {
    if (sheetsUrl.trim()) {
      setApiUrl(sheetsUrl.trim());
    } else {
      clearApiUrl();
    }
    setShowSheetsConfig(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleLogin(); };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-4">
            <UserPlus className="w-14 h-14 text-indigo-600 mx-auto" />
            <h1 className="text-3xl font-bold text-gray-800">Cadastrar Professor</h1>
            <p className="text-gray-500">Crie um código para acesso ao painel</p>
          </div>
          <div className="bg-white rounded-xl shadow-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5">
              <h2 className="text-xl font-bold">Novo Cadastro</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Código do Professor *</label>
                <input type="text" placeholder="Mínimo 4 caracteres" value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition box-border"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Escola (opcional)</label>
                <input type="text" placeholder="Nome da escola" value={setupSchool}
                  onChange={(e) => setSetupSchool(e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition box-border"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Disciplina (opcional)</label>
                <input type="text" placeholder="Ex: Educação Musical" value={setupSubject}
                  onChange={(e) => setSetupSubject(e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition box-border"
                />
              </div>
              {error && <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span></div>}
              {setupSuccess && <div className="text-green-700 bg-green-50 p-3 rounded-lg text-sm font-medium">{setupSuccess}</div>}
              <button onClick={handleSetup}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition cursor-pointer"
              >Cadastrar</button>
              <div className="text-center">
                <button onClick={() => { setShowSetup(false); setError(null); setSetupSuccess(""); }}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center justify-center gap-1 mx-auto cursor-pointer"
                ><ArrowLeft className="w-4 h-4" /> Voltar ao Login</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <GraduationCap className="w-14 h-14 text-indigo-600 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-800">Acesso do Professor</h1>
          <p className="text-gray-500">Entre com seu código para acessar relatórios</p>
        </div>
        <div className="bg-white rounded-xl shadow-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5">
            <h2 className="text-xl font-bold">Login do Professor</h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Código do Professor</label>
              <input type="password" placeholder="Digite seu código secreto" value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition box-border"
              />
            </div>
            {error && <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span></div>}
            <button onClick={handleLogin}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition cursor-pointer"
            >Entrar</button>
            <div className="text-center space-y-2">
              <button onClick={() => setLocation("/")}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center justify-center gap-1 mx-auto cursor-pointer"
              ><ArrowLeft className="w-4 h-4" /> Voltar para Home</button>
              <button onClick={() => { setShowSetup(true); setError(null); }}
                className="text-gray-500 hover:text-indigo-600 text-xs flex items-center justify-center gap-1 mx-auto cursor-pointer"
              ><UserPlus className="w-3 h-3" /> Primeiro acesso? Cadastre-se</button>
              <button onClick={() => setShowSheetsConfig(true)}
                className="text-gray-500 hover:text-indigo-600 text-xs flex items-center justify-center gap-1 mx-auto cursor-pointer"
              ><Database className="w-3 h-3" /> Configurar Google Sheets</button>
            </div>
          </div>
        </div>
      </div>

      {showSheetsConfig && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowSheetsConfig(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800">Configurar Google Sheets</h3>
            <p className="text-sm text-gray-500">
              Cole a URL do seu Web App do Google Apps Script para salvar os dados na nuvem.
              Sem essa URL, os dados ficam salvos apenas no navegador (localStorage).
            </p>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">URL do Web App</label>
              <input type="url" placeholder="https://script.google.com/macros/s/..." value={sheetsUrl}
                onChange={(e) => setSheetsUrl(e.target.value)}
                className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition box-border"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSheetsConfig(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
              >Cancelar</button>
              <button onClick={handleSaveSheetsUrl}
                className="flex-1 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium cursor-pointer"
              >Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
