import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import type { AuthenticatedUser } from "../shared/types";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUserType = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUserType = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });
});

describe("exercise procedures", () => {
  it("should start a new exercise session", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.exercise.startSession({
      studentName: "João Silva",
      totalQuestions: 10,
    });

    expect(result).toHaveProperty("sessionId");
    expect(typeof result.sessionId).toBe("number");
  });

  it("should submit an answer and validate correctness", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Start session
    const sessionResult = await caller.exercise.startSession({
      studentName: "Maria Santos",
      totalQuestions: 10,
    });

    // Submit correct answer
    const answerResult = await caller.exercise.submitAnswer({
      sessionId: sessionResult.sessionId,
      questionNumber: 1,
      correctNote: "Dó",
      studentAnswer: "Dó",
    });

    expect(answerResult.isCorrect).toBe(true);
    expect(answerResult.correctNote).toBe("Dó");
  });

  it("should detect incorrect answers", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const sessionResult = await caller.exercise.startSession({
      studentName: "Pedro Costa",
      totalQuestions: 10,
    });

    const answerResult = await caller.exercise.submitAnswer({
      sessionId: sessionResult.sessionId,
      questionNumber: 1,
      correctNote: "Dó",
      studentAnswer: "Ré",
    });

    expect(answerResult.isCorrect).toBe(false);
  });

  it("should get session results", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const sessionResult = await caller.exercise.startSession({
      studentName: "Ana Lima",
      totalQuestions: 2,
    });

    await caller.exercise.submitAnswer({
      sessionId: sessionResult.sessionId,
      questionNumber: 1,
      correctNote: "Dó",
      studentAnswer: "Dó",
    });

    await caller.exercise.submitAnswer({
      sessionId: sessionResult.sessionId,
      questionNumber: 2,
      correctNote: "Ré",
      studentAnswer: "Mi",
    });

    const results = await caller.exercise.getSessionResults(sessionResult.sessionId);

    expect(results.stats.correctCount).toBe(1);
    expect(results.stats.totalQuestions).toBe(2);
    expect(results.stats.percentage).toBe(50);
  });
});

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}
