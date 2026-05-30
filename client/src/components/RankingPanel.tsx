import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp } from "lucide-react";

interface SessionData {
  id: number;
  studentName: string;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  createdAt: Date;
}

interface RankingPanelProps {
  sessions: SessionData[];
  isLoading?: boolean;
}

export const RankingPanel: React.FC<RankingPanelProps> = ({ sessions, isLoading = false }) => {
  const sortedSessions = [...sessions].sort((a, b) => b.percentage - a.percentage);

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 80) return <Badge className="bg-green-500">Excelente</Badge>;
    if (percentage >= 60) return <Badge className="bg-blue-500">Bom</Badge>;
    return <Badge className="bg-orange-500">Precisa Melhorar</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            <CardTitle className="text-xl">Painel de Ranking</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Carregando dados...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma sessão registrada ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Posição</TableHead>
                    <TableHead className="font-semibold">Aluno</TableHead>
                    <TableHead className="font-semibold text-center">Acertos</TableHead>
                    <TableHead className="font-semibold text-center">Erros</TableHead>
                    <TableHead className="font-semibold text-center">Desempenho</TableHead>
                    <TableHead className="font-semibold">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSessions.map((session, index) => (
                    <TableRow key={session.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                          {index === 1 && <Trophy className="w-5 h-5 text-gray-400" />}
                          {index === 2 && <Trophy className="w-5 h-5 text-orange-600" />}
                          <span className="font-semibold text-gray-700">{index + 1}º</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">{session.studentName}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-green-600">{session.correctAnswers}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-red-600">{session.totalQuestions - session.correctAnswers}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-bold text-indigo-600">{session.percentage}%</span>
                          {getPerformanceBadge(session.percentage)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{formatDate(session.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {sessions.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              <CardTitle className="text-lg">Estatísticas Gerais</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Total de Sessões</p>
                <p className="text-2xl font-bold text-blue-600">{sessions.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Média de Acertos</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(sessions.reduce((sum, s) => sum + s.correctAnswers, 0) / sessions.length)}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Desempenho Médio</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(sessions.reduce((sum, s) => sum + s.percentage, 0) / sessions.length)}%
                </p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Alunos Únicos</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {new Set(sessions.map(s => s.studentName)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
