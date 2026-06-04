import { db, hasConfig } from "./firebase";
import {
  collection, addDoc, getDocs, query,
  deleteDoc, doc, writeBatch,
} from "firebase/firestore";

const STAFF_KEY = "teoria_musical_leaderboard";
const PIANO_KEY = "teoria_musical_piano_leaderboard";
const TEACHERS_KEY = "teoria_musical_teachers";
const TURMAS_KEY = "teoria_musical_turmas";

function loadStaffLB(): any[] {
  try { return JSON.parse(localStorage.getItem(STAFF_KEY) || "[]"); } catch { return []; }
}
function loadPianoLB(): any[] {
  try { return JSON.parse(localStorage.getItem(PIANO_KEY) || "[]"); } catch { return []; }
}
function loadTeachersLocal(): any[] {
  try { return JSON.parse(localStorage.getItem(TEACHERS_KEY) || "[]"); } catch { return []; }
}
function saveStaffLB(data: any[]) {
  localStorage.setItem(STAFF_KEY, JSON.stringify(data));
}
function savePianoLB(data: any[]) {
  localStorage.setItem(PIANO_KEY, JSON.stringify(data));
}
function saveTeachersLocal(data: any[]) {
  localStorage.setItem(TEACHERS_KEY, JSON.stringify(data));
}

/* ---- Export helpers (kept for compatibility) ---- */

export function getApiUrl(): string | null {
  return hasConfig ? "firebase" : null;
}

export function setApiUrl(_url: string) {}

export function clearApiUrl() {}

export function isApiEnvConfigured(): boolean {
  return hasConfig;
}

/* ---- Save result (Firestore + localStorage) ---- */

/* ---- Turmas (localStorage + Firestore) ---- */

function loadTurmasLocal(): string[] {
  try { return JSON.parse(localStorage.getItem(TURMAS_KEY) || "[]"); } catch { return []; }
}
function saveTurmasLocal(data: string[]) {
  localStorage.setItem(TURMAS_KEY, JSON.stringify(data));
}

export async function getTurmas(): Promise<string[]> {
  if (db) {
    try {
      const snap = await getDocs(query(collection(db, "turmas")));
      const data = snap.docs.map(d => d.data().name as string);
      if (data.length) return data;
    } catch { /* fallback */ }
  }
  return loadTurmasLocal();
}

export async function addTurma(name: string): Promise<boolean> {
  const local = loadTurmasLocal();
  if (local.includes(name)) return false;
  local.push(name);
  saveTurmasLocal(local);
  if (db) {
    try {
      await addDoc(collection(db, "turmas"), { name, createdAt: new Date().toISOString() });
    } catch { /* silent */ }
  }
  return true;
}

export async function removeTurma(name: string): Promise<boolean> {
  const local = loadTurmasLocal().filter(t => t !== name);
  saveTurmasLocal(local);
  if (db) {
    try {
      const snap = await getDocs(query(collection(db, "turmas")));
      const target = snap.docs.find(d => d.data().name === name);
      if (target) await deleteDoc(doc(db, "turmas", target.id));
    } catch { /* silent */ }
  }
  return true;
}

/* ---- Save result (Firestore + localStorage) ---- */

export async function saveResult(data: {
  name: string; score: number; wrong: number; pct: number;
  time: number; date: string; activity: "staff" | "piano";
  clef?: string; difficulty?: string; turma?: string;
  mistakes?: Array<{question: string; answer: string; correct: string}>;
}) {
  const entry: any = { ...data, timestamp: Date.now() };
  const key = data.activity === "piano" ? PIANO_KEY : STAFF_KEY;
  const lb = data.activity === "piano" ? loadPianoLB() : loadStaffLB();
  lb.push(entry);
  lb.sort((a: any, b: any) => b.score - a.score || a.time - b.time);
  localStorage.setItem(key, JSON.stringify(lb.slice(0, 50)));
  if (db) {
    try {
      await addDoc(collection(db, "results"), entry);
    } catch { /* silent */ }
  }
}

/* ---- Read leaderboard (Firestore first, fallback localStorage) ---- */

async function getAllResults(): Promise<any[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, "results")));
    return snap.docs.map(d => ({ ...d.data(), _id: d.id }));
  } catch { return []; }
}

export async function getStaffLeaderboard(): Promise<any[]> {
  if (db) {
    const all = await getAllResults();
    const filtered = all.filter(r => r.activity === "staff" || !r.activity);
    if (filtered.length) return filtered;
  }
  return loadStaffLB();
}

export async function getPianoLeaderboard(): Promise<any[]> {
  if (db) {
    const all = await getAllResults();
    const filtered = all.filter(r => r.activity === "piano");
    if (filtered.length) return filtered;
  }
  return loadPianoLB();
}

/* ---- Teacher (Firestore + localStorage) ---- */

export async function registerTeacher(code: string, schoolName = "", subject = ""): Promise<boolean> {
  const local = loadTeachersLocal();
  if (local.some((t: any) => t.code === code)) return false;
  const teacher = { code, schoolName, subject, createdAt: new Date().toISOString() };
  local.push(teacher);
  saveTeachersLocal(local);
  if (db) {
    try {
      await addDoc(collection(db, "teachers"), teacher);
    } catch { /* silent */ }
  }
  return true;
}

export async function verifyTeacher(code: string): Promise<any | null> {
  if (db) {
    try {
      const snap = await getDocs(query(collection(db, "teachers")));
      const found = snap.docs.map(d => d.data()).find((t: any) => t.code === code);
      if (found) {
        const local = loadTeachersLocal();
        if (!local.some((t: any) => t.code === code)) {
          local.push(found);
          saveTeachersLocal(local);
        }
        return found;
      }
    } catch { /* fallback */ }
  }
  return loadTeachersLocal().find((t: any) => t.code === code) || null;
}

export async function getTeachers(): Promise<any[]> {
  if (db) {
    try {
      const snap = await getDocs(query(collection(db, "teachers")));
      const data = snap.docs.map(d => d.data());
      if (data.length) return data;
    } catch { /* fallback */ }
  }
  return loadTeachersLocal();
}

/* ---- Delete (Firestore + localStorage) ---- */

export async function deleteStudent(name: string) {
  const staff = loadStaffLB().filter((e: any) => e.name !== name);
  saveStaffLB(staff);
  const piano = loadPianoLB().filter((e: any) => e.name !== name);
  savePianoLB(piano);
  if (db) {
    try {
      const snap = await getDocs(query(collection(db, "results")));
      const batch = writeBatch(db);
      snap.docs.filter(d => d.data().name === name).forEach(d => batch.delete(d.ref));
      await batch.commit();
    } catch { /* silent */ }
  }
  return true;
}

export async function deleteTeacher(code: string) {
  const local = loadTeachersLocal().filter((t: any) => t.code !== code);
  saveTeachersLocal(local);
  if (db) {
    try {
      const snap = await getDocs(query(collection(db, "teachers")));
      const target = snap.docs.find(d => d.data().code === code);
      if (target) await deleteDoc(doc(db, "teachers", target.id));
    } catch { /* silent */ }
  }
  return true;
}
