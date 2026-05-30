import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  getTeacherByCode,
  getAllStudentNames,
  getStudentSessions,
  getStudentNoteStats,
  getDashboardStats,
  getRecentSessions,
  getGlobalNoteStats,
  getDb,
} from "../db";
import { teachers } from "../../drizzle/schema";

function decodeTeacherToken(token: string): { teacherId: number; teacherCode: string } | null {
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded && decoded.teacherId && decoded.teacherCode) {
      return decoded;
    }
  } catch {}
  return null;
}

function encodeTeacherToken(teacherId: number, teacherCode: string): string {
  return btoa(JSON.stringify({ teacherId, teacherCode, ts: Date.now() }));
}

const teacherProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const token = ctx.req.headers["x-teacher-token"] as string | undefined;
  if (!token) {
    throw new Error("Acesso não autorizado. Faça login como professor.");
  }
  const decoded = decodeTeacherToken(token);
  if (!decoded) {
    throw new Error("Token inválido ou expirado.");
  }
  const teacher = await getTeacherByCode(decoded.teacherCode);
  if (!teacher || teacher.id !== decoded.teacherId) {
    throw new Error("Token inválido ou expirado.");
  }
  return next({ ctx: { ...ctx, teacher } });
});

export const teacherRouter = router({
  setup: publicProcedure
    .input(z.object({
      teacherCode: z.string().min(4, "O código deve ter no mínimo 4 caracteres"),
      schoolName: z.string().optional(),
      subject: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const existing = await getTeacherByCode(input.teacherCode);
      if (existing) {
        throw new Error("Este código já está em uso.");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(teachers).values({
        teacherCode: input.teacherCode,
        schoolName: input.schoolName ?? null,
        subject: input.subject ?? null,
      });
      return { success: true, message: "Professor cadastrado com sucesso!" };
    }),

  login: publicProcedure
    .input(z.object({
      teacherCode: z.string().min(1, "Código do professor é obrigatório"),
    }))
    .mutation(async ({ input }) => {
      const teacher = await getTeacherByCode(input.teacherCode);
      if (!teacher) {
        throw new Error("Código de professor inválido.");
      }
      const token = encodeTeacherToken(teacher.id, teacher.teacherCode);
      return {
        token,
        teacher: {
          id: teacher.id,
          schoolName: teacher.schoolName,
          subject: teacher.subject,
        },
      };
    }),

  me: teacherProcedure.query(async ({ ctx }) => {
    return ctx.teacher;
  }),

  getDashboard: teacherProcedure.query(async () => {
    const stats = await getDashboardStats();
    const recentSessions = await getRecentSessions(20);
    const noteStats = await getGlobalNoteStats();
    return { stats, recentSessions, noteStats };
  }),

  getStudents: teacherProcedure.query(async () => {
    return await getAllStudentNames();
  }),

  getStudentDetail: teacherProcedure
    .input(z.object({
      studentName: z.string().min(1),
    }))
    .query(async ({ input }) => {
      const sessions = await getStudentSessions(input.studentName);
      const noteStats = await getStudentNoteStats(input.studentName);
      return { sessions, noteStats };
    }),
});
