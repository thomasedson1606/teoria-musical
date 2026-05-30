const API_URL_KEY = "sheets_api_url";

export function getApiUrl(): string | null {
  try { return localStorage.getItem(API_URL_KEY); }
  catch { return null; }
}

export function setApiUrl(url: string) {
  localStorage.setItem(API_URL_KEY, url);
}

export function clearApiUrl() {
  localStorage.removeItem(API_URL_KEY);
}

/* ---- localStorage helpers ---- */

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

/* ---- Public API ---- */

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
  if (!url) return;
  try {
    await fetch(url, { method: "POST", body: JSON.stringify({ action: "saveResult", ...entry }) });
  } catch { /* offline – data is safe in localStorage */ }
}

export async function getStaffLeaderboard(): Promise<any[]> {
  const url = getApiUrl();
  if (url) {
    try {
      const res = await fetch(url + "?action=getLeaderboard");
      const all: any[] = await res.json();
      if (Array.isArray(all)) return all.filter(r => r.activity === "staff" || !r.activity);
    } catch { /* fallback */ }
  }
  return loadStaffLB();
}

export async function getPianoLeaderboard(): Promise<any[]> {
  const url = getApiUrl();
  if (url) {
    try {
      const res = await fetch(url + "?action=getLeaderboard");
      const all: any[] = await res.json();
      if (Array.isArray(all)) return all.filter(r => r.activity === "piano");
    } catch { /* fallback */ }
  }
  return loadPianoLB();
}

export async function registerTeacher(code: string, schoolName = "", subject = ""): Promise<boolean> {
  const local = loadTeachersLocal();
  if (local.some((t: any) => t.code === code)) return false;
  local.push({ code, schoolName, subject, createdAt: new Date().toISOString() });
  localStorage.setItem(TEACHERS_KEY, JSON.stringify(local));

  const url = getApiUrl();
  if (!url) return true;
  try {
    await fetch(url, {
      method: "POST",
      body: JSON.stringify({ action: "registerProfessor", code, schoolName, subject }),
    });
  } catch { /* ok */ }
  return true;
}

export async function verifyTeacher(code: string): Promise<any | null> {
  const local = loadTeachersLocal();
  const found = local.find((t: any) => t.code === code);
  if (found) return found;

  const url = getApiUrl();
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ action: "verifyProfessor", code }),
    });
    const data = await res.json();
    return data.professor || null;
  } catch { return null; }
}
