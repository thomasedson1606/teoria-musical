const API_URL_KEY = "sheets_api_url";

export function getApiUrl(): string | null {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_SHEETS_API_URL) {
    return import.meta.env.VITE_SHEETS_API_URL as string;
  }
  try { return localStorage.getItem(API_URL_KEY); }
  catch { return null; }
}

export function setApiUrl(url: string) {
  localStorage.setItem(API_URL_KEY, url);
}

export function clearApiUrl() {
  localStorage.removeItem(API_URL_KEY);
}

/* ---- localStorage keys ---- */

const STAFF_KEY = "teoria_musical_leaderboard";
const PIANO_KEY = "teoria_musical_piano_leaderboard";
const TEACHERS_KEY = "teoria_musical_teachers";

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

/* ---- JSONP helper (bypasses CORS for reads) ---- */

function jsonp(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const cb = "j" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    (window as any)[cb] = (data: any) => {
      delete (window as any)[cb];
      const s = document.getElementById("j_" + cb);
      if (s) s.remove();
      resolve(data);
    };
    const sep = url.includes("?") ? "&" : "?";
    const script = document.createElement("script");
    script.id = "j_" + cb;
    script.src = url + sep + "callback=" + cb;
    script.onerror = () => {
      delete (window as any)[cb];
      script.remove();
      reject(new Error("JSONP failed"));
    };
    document.head.appendChild(script);
  });
}

/* ---- Save (localStorage + no-cors POST) ---- */

function postNoCors(url: string, data: any) {
  try {
    fetch(url, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
  } catch { /* silent */ }
}

export async function saveResult(data: {
  name: string; score: number; wrong: number; pct: number;
  time: number; date: string; activity: "staff" | "piano";
  clef?: string; difficulty?: string;
}) {
  const entry = { ...data, timestamp: Date.now() };
  const key = data.activity === "piano" ? PIANO_KEY : STAFF_KEY;
  const lb = data.activity === "piano" ? loadPianoLB() : loadStaffLB();
  lb.push(entry);
  lb.sort((a: any, b: any) => b.score - a.score || a.time - b.time);
  localStorage.setItem(key, JSON.stringify(lb.slice(0, 50)));

  const url = getApiUrl();
  if (url) postNoCors(url, { action: "saveResult", ...entry });
}

/* ---- Read leaderboard (JSONP first, fallback localStorage) ---- */

export async function getStaffLeaderboard(): Promise<any[]> {
  const url = getApiUrl();
  if (url) {
    try {
      const all: any[] = await jsonp(url + "?action=getLeaderboard");
      if (Array.isArray(all)) {
        const filtered = all.filter(r => r.activity === "staff" || !r.activity);
        if (filtered.length) return filtered;
      }
    } catch { /* fallback */ }
  }
  return loadStaffLB();
}

export async function getPianoLeaderboard(): Promise<any[]> {
  const url = getApiUrl();
  if (url) {
    try {
      const all: any[] = await jsonp(url + "?action=getLeaderboard");
      if (Array.isArray(all)) {
        const filtered = all.filter(r => r.activity === "piano");
        if (filtered.length) return filtered;
      }
    } catch { /* fallback */ }
  }
  return loadPianoLB();
}

/* ---- Teacher (JSONP verify + no-cors register) ---- */

export async function registerTeacher(code: string, schoolName = "", subject = ""): Promise<boolean> {
  const local = loadTeachersLocal();
  if (local.some((t: any) => t.code === code)) return false;
  const teacher = { code, schoolName, subject, createdAt: new Date().toISOString() };
  local.push(teacher);
  saveTeachersLocal(local);
  const url = getApiUrl();
  if (url) postNoCors(url, { action: "registerProfessor", code, schoolName, subject });
  return true;
}

export async function verifyTeacher(code: string): Promise<any | null> {
  const url = getApiUrl();
  if (url) {
    try {
      const data: any = await jsonp(url + "?action=verifyProfessor&code=" + encodeURIComponent(code));
      if (data && data.professor) {
        const local = loadTeachersLocal();
        if (!local.some((t: any) => t.code === code)) {
          local.push(data.professor);
          saveTeachersLocal(local);
        }
        return data.professor;
      }
    } catch { /* fallback */ }
  }
  const local = loadTeachersLocal();
  return local.find((t: any) => t.code === code) || null;
}

/* ---- Delete (no-cors POST + localStorage) ---- */

export async function getTeachers(): Promise<any[]> {
  const url = getApiUrl();
  if (url) {
    try {
      const data: any[] = await jsonp(url + "?action=getProfessors");
      if (Array.isArray(data) && data.length) return data;
    } catch { /* fallback */ }
  }
  return loadTeachersLocal();
}

export async function deleteStudent(name: string) {
  const staff = loadStaffLB().filter(e => e.name !== name);
  saveStaffLB(staff);
  const piano = loadPianoLB().filter(e => e.name !== name);
  savePianoLB(piano);
  const url = getApiUrl();
  if (url) postNoCors(url, { action: "deleteStudent", name });
  return true;
}

export async function deleteTeacher(code: string) {
  const local = loadTeachersLocal().filter(t => t.code !== code);
  saveTeachersLocal(local);
  const url = getApiUrl();
  if (url) postNoCors(url, { action: "deleteTeacher", code });
  return true;
}

export function isApiEnvConfigured(): boolean {
  return typeof import.meta !== "undefined" && !!import.meta.env?.VITE_SHEETS_API_URL;
}
