import { eq, sql, desc, count, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, sessions, answers, teachers } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a new exercise session
 */
export async function createSession(studentName: string, totalQuestions: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(sessions).values({
    studentName,
    totalQuestions,
    correctAnswers: 0,
  });

  return result[0]?.insertId || 0;
}

/**
 * Get a session by ID
 */
export async function getSessionById(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  return result[0];
}

/**
 * Add an answer to a session
 */
export async function addAnswer(
  sessionId: number,
  questionNumber: number,
  correctNote: string,
  studentAnswer: string,
  isCorrect: boolean
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(answers).values({
    sessionId,
    questionNumber,
    correctNote,
    studentAnswer,
    isCorrect: isCorrect ? 1 : 0,
  });
}

/**
 * Get all answers for a session
 */
export async function getSessionAnswers(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(answers).where(eq(answers.sessionId, sessionId));
}

/**
 * Update session correct answers count
 */
export async function updateSessionCorrectAnswers(sessionId: number, correctCount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(sessions)
    .set({ correctAnswers: correctCount })
    .where(eq(sessions.id, sessionId));
}

/**
 * Get all sessions (for ranking)
 */
export async function getAllSessions() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(sessions).orderBy(sessions.createdAt);
}

// ===================== TEACHER AUTH =====================

/**
 * Find teacher by code
 */
export async function getTeacherByCode(code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(teachers)
    .where(eq(teachers.teacherCode, code))
    .limit(1);
  return result[0];
}

/**
 * Find teacher by user ID
 */
export async function getTeacherByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(teachers)
    .where(eq(teachers.userId, userId))
    .limit(1);
  return result[0];
}

// ===================== ANALYTICS QUERIES =====================

/**
 * Get all unique student names
 */
export async function getAllStudentNames() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({ name: sessions.studentName })
    .from(sessions)
    .groupBy(sessions.studentName)
    .orderBy(sessions.studentName);

  return result.map(r => r.name);
}

/**
 * Get all sessions for a specific student
 */
export async function getStudentSessions(studentName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(sessions)
    .where(eq(sessions.studentName, studentName))
    .orderBy(desc(sessions.createdAt));
}

/**
 * Get note difficulty stats for a student
 * Returns how many times each note was answered correctly vs incorrectly
 */
export async function getStudentNoteStats(studentName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const studentSessions = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(eq(sessions.studentName, studentName));
  const sessionIds = studentSessions.map(s => s.id);
  if (sessionIds.length === 0) return [];

  const result = await db
    .select({
      note: answers.correctNote,
      total: count(answers.id),
      correct: sql`SUM(${answers.isCorrect})`,
    })
    .from(answers)
    .where(inArray(answers.sessionId, sessionIds))
    .groupBy(answers.correctNote)
    .orderBy(answers.correctNote);

  return result.map(r => ({
    note: r.note,
    total: Number(r.total),
    correct: Number(r.correct),
    wrong: Number(r.total) - Number(r.correct),
    accuracy: Number(r.total) > 0 ? Math.round((Number(r.correct) / Number(r.total)) * 100) : 0,
  }));
}

/**
 * Get overall dashboard stats
 */
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const totalStudents = await db
    .select({ count: sql`COUNT(DISTINCT ${sessions.studentName})` })
    .from(sessions);
  const totalSessions = await db
    .select({ count: count() })
    .from(sessions);
  const totalAnswers = await db
    .select({ count: count() })
    .from(answers);

  return {
    totalStudents: Number(totalStudents[0]?.count ?? 0),
    totalSessions: Number(totalSessions[0]?.count ?? 0),
    totalAnswers: Number(totalAnswers[0]?.count ?? 0),
  };
}

/**
 * Get recent sessions across all students
 */
export async function getRecentSessions(limit: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(sessions)
    .orderBy(desc(sessions.createdAt))
    .limit(limit);
}

/**
 * Get overall note difficulty across all students
 */
export async function getGlobalNoteStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      note: answers.correctNote,
      total: count(answers.id),
      correct: sql`SUM(${answers.isCorrect})`,
    })
    .from(answers)
    .groupBy(answers.correctNote)
    .orderBy(answers.correctNote);

  return result.map(r => ({
    note: r.note,
    total: Number(r.total),
    correct: Number(r.correct),
    wrong: Number(r.total) - Number(r.correct),
    accuracy: Number(r.total) > 0 ? Math.round((Number(r.correct) / Number(r.total)) * 100) : 0,
  }));
}

// TODO: add feature queries here as your schema grows.
