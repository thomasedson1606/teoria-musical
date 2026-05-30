import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { GraduationCap, ArrowLeft, AlertCircle, Loader2, UserPlus } from "lucide-react";

export default function TeacherLogin() {
  const [, setLocation] = useLocation();
  const [teacherCode, setTeacherCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [setupCode, setSetupCode] = useState("");
  const [setupSchool, setSetupSchool] = useState("");
  const [setupSubject, setSetupSubject] = useState("");
  const [setupSuccess, setSetupSuccess] = useState("");

  const loginMutation = trpc.teacher.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("teacher_token", data.token);
      localStorage.setItem("teacher_info", JSON.stringify(data.teacher));
      setLocation("/teacher");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const setupMutation = trpc.teacher.setup.useMutation({
    onSuccess: (data) => {
      setSetupSuccess(data.message);
      setShowSetup(false);
      setSetupCode("");
      setSetupSchool("");
      setSetupSubject("");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleLogin = () => {
    if (!teacherCode.trim()) {
      setError("Por favor, insira seu código de professor.");
      return;
    }
    setError(null);
    loginMutation.mutate({ teacherCode: teacherCode.trim() });
  };

  const handleSetup = () => {
    if (!setupCode.trim() || setupCode.trim().length < 4) {
      setError("O código deve ter no mínimo 4 caracteres.");
      return;
    }
    setError(null);
    setSetupSuccess("");
    setupMutation.mutate({
      teacherCode: setupCode.trim(),
      schoolName: setupSchool.trim() || undefined,
      subject: setupSubject.trim() || undefined,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-4">
            <UserPlus className="w-14 h-14 text-indigo-600 mx-auto" />
            <h1 className="text-3xl font-bold text-gray-800">Cadastrar Professor</h1>
            <p className="text-gray-500">Crie um código para acesso ao painel</p>
          </div>

          <Card className="shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-xl">Novo Cadastro</CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Código do Professor *
                </label>
                <Input
                  type="text"
                  placeholder="Mínimo 4 caracteres"
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Escola (opcional)
                </label>
                <Input
                  type="text"
                  placeholder="Nome da escola"
                  value={setupSchool}
                  onChange={(e) => setSetupSchool(e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Disciplina (opcional)
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Educação Musical"
                  value={setupSubject}
                  onChange={(e) => setSetupSubject(e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {setupSuccess && (
                <div className="text-green-700 bg-green-50 p-3 rounded-lg text-sm font-medium">
                  {setupSuccess}
                </div>
              )}

              <Button
                onClick={handleSetup}
                disabled={setupMutation.isPending}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition"
                size="lg"
              >
                {setupMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Cadastrando...</>
                ) : (
                  "Cadastrar"
                )}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => { setShowSetup(false); setError(null); setSetupSuccess(""); }}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao Login
                </button>
              </div>
            </CardContent>
          </Card>
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
          <p className="text-gray-500">Entre com seu código para acessar relatórios e analytics</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-xl">Login do Professor</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código do Professor
              </label>
              <Input
                type="password"
                placeholder="Digite seu código secreto"
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleLogin}
              disabled={loginMutation.isPending}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition"
              size="lg"
            >
              {loginMutation.isPending ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Entrando...</>
              ) : (
                "Entrar"
              )}
            </Button>

            <div className="text-center space-y-2">
              <button
                onClick={() => setLocation("/")}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para Home
              </button>
              <button
                onClick={() => { setShowSetup(true); setError(null); }}
                className="text-gray-500 hover:text-indigo-600 text-xs flex items-center justify-center gap-1 mx-auto"
              >
                <UserPlus className="w-3 h-3" />
                Primeiro acesso? Cadastre-se
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
