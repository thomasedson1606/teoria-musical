import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createSession,
  addAnswer,
  getSessionById,
  getSessionAnswers,
  updateSessionCorrectAnswers,
  getAllSessions,
} from "./db";
import { teacherRouter } from "./routers/teacher";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  exercise: router({
    /**
     * Start a new exercise session
     */
    startSession: publicProcedure
      .input(
        z.object({
          studentName: z.string().min(1),
          totalQuestions: z.number().int().positive().default(10),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createSession(input.studentName, input.totalQuestions);
        return { sessionId: result };
      }),

    /**
     * Submit an answer for a question
     */
    submitAnswer: publicProcedure
      .input(
        z.object({
          sessionId: z.number().int().positive(),
          questionNumber: z.number().int().positive(),
          correctNote: z.string(),
          studentAnswer: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const isCorrect = input.studentAnswer.toLowerCase() === input.correctNote.toLowerCase();
        await addAnswer(
          input.sessionId,
          input.questionNumber,
          input.correctNote,
          input.studentAnswer,
          isCorrect
        );

        // Update session correct answers count
        const sessionAnswers = await getSessionAnswers(input.sessionId);
        const correctCount = sessionAnswers.filter(a => a.isCorrect === 1).length;
        await updateSessionCorrectAnswers(input.sessionId, correctCount);

        return { isCorrect, correctNote: input.correctNote };
      }),

    /**
     * Get session results
     */
    getSessionResults: publicProcedure
      .input(z.number().int().positive())
      .query(async ({ input: sessionId }) => {
        const session = await getSessionById(sessionId);
        if (!session) throw new Error("Session not found");

        const sessionAnswers = await getSessionAnswers(sessionId);
        const correctCount = sessionAnswers.filter(a => a.isCorrect === 1).length;
        const percentage = Math.round((correctCount / session.totalQuestions) * 100);

        return {
          session,
          answers: sessionAnswers,
          stats: {
            correctCount,
            totalQuestions: session.totalQuestions,
            percentage,
          },
        };
      }),
  }),

  teacher: teacherRouter,

  ranking: router({
    /**
     * Get all sessions (for ranking) - Only for admin/teacher
     */
    getAllSessions: protectedProcedure
      .use(async ({ ctx, next }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Access denied: Only administrators can view rankings");
        }
        return next({ ctx });
      })
      .query(async () => {
      const allSessions = await getAllSessions();

      return allSessions.map(session => ({
        ...session,
        percentage: Math.round((session.correctAnswers / session.totalQuestions) * 100),
      }));
    }),

    /**
     * Get session details - Only for admin/teacher
     */
    getSessionDetails: protectedProcedure
      .use(async ({ ctx, next }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Access denied: Only administrators can view rankings");
        }
        return next({ ctx });
      })
      .input(z.number().int().positive())
      .query(async ({ input: sessionId }) => {
        const session = await getSessionById(sessionId);
        if (!session) throw new Error("Session not found");

        const sessionAnswers = await getSessionAnswers(sessionId);

        return { session, answers: sessionAnswers };
      }),
  }),
});

export type AppRouter = typeof appRouter;
