import React, { useState, useEffect } from "react";
import { saveResult } from "@/lib/sheetsApi";

const TOTAL_Q = 10;
const STORAGE_KEY = "teoria_musical_piano_leaderboard";

const WHITE_NOTES = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"];
const ALL_NOTES = ["Dó", "Dó#", "Ré", "Ré#", "Mi", "Fá", "Fá#", "Sol", "Sol#", "Lá", "Lá#", "Si"];

const WHITE_WIDTH = 52;
const BLACK_WIDTH = 30;
const WHITE_HEIGHT = 160;
const BLACK_HEIGHT = 95;

const BLACK_POSITIONS = [
  { note: "Dó#", offset: 0 },
  { note: "Ré#", offset: 1 },
  { note: "Fá#", offset: 3 },
  { note: "Sol#", offset: 4 },
  { note: "Lá#", offset: 5 },
];

function shuffle<T>(arr: T[]): T[] {
  let a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadLeaderboard(): any[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function generateQuestions(): string[] {
  let result: string[] = [];
  while (result.length < TOTAL_Q) {
    result = result.concat(shuffle([...WHITE_NOTES]));
  }
  return result.slice(0, TOTAL_Q);
}

export default function PianoActivity({ studentName: propName, onFinish }: { studentName?: string; onFinish?: () => void }) {
  const [screen, setScreen] = useState<"home" | "quiz" | "result">(propName ? "quiz" : "home");
  const [studentName, setStudentName] = useState(propName || "");
  const [nameError, setNameError] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [questions, setQuestions] = useState<string[]>(() => propName ? generateQuestions() : []);
  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [chosenNote, setChosenNote] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackClass, setFeedbackClass] = useState("");

  useEffect(() => {
    setLeaderboard(loadLeaderboard());
  }, []);

  const startQuiz = () => {
    if (!studentName.trim()) { setNameError(true); return; }
    setNameError(false);
    setQuestions(generateQuestions());
    setCurrent(0);
    setCorrect(0);
    setWrong(0);
    setAnswered(false);
    setChosenNote(null);
    setFeedbackText("");
    setFeedbackClass("");
    setScreen("quiz");
  };

  const checkAnswer = (chosen: string) => {
    if (answered) return;
    setChosenNote(chosen);
    const isCorrect = chosen === questions[current];
    if (isCorrect) {
      setCorrect((p) => p + 1);
      setFeedbackText("✓ Correto!");
      setFeedbackClass("ok");
    } else {
      setWrong((p) => p + 1);
      setFeedbackText(`✗ A nota correta era ${questions[current]}`);
      setFeedbackClass("err");
    }
    setAnswered(true);
  };

  const nextQuestion = () => {
    if (current + 1 >= TOTAL_Q) {
      finishExercise();
      return;
    }
    setCurrent((p) => p + 1);
    setAnswered(false);
    setChosenNote(null);
    setFeedbackText("");
    setFeedbackClass("");
  };

  const finishExercise = async () => {
    const entry = {
      name: studentName.trim(),
      score: correct,
      wrong,
      pct: Math.round((correct / TOTAL_Q) * 100),
      time: 0,
      date: new Date().toLocaleDateString("pt-BR"),
      activity: "piano" as const,
    };
    await saveResult(entry);
    setLeaderboard(loadLeaderboard());
    setScreen("result");
  };

  const retry = () => {
    setQuestions(generateQuestions());
    setCurrent(0);
    setCorrect(0);
    setWrong(0);
    setAnswered(false);
    setChosenNote(null);
    setFeedbackText("");
    setFeedbackClass("");
    setScreen("quiz");
  };

  const currentNote = questions[current];

  const pianoWidth = WHITE_NOTES.length * WHITE_WIDTH;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to br, #f3f0ff via-white to #faf5ff)", padding: "20px" }}>
      {screen === "home" && (
        <div style={{ maxWidth: "700px", margin: "0 auto", paddingTop: "40px" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>🎹</div>
            <h1 style={{ fontSize: "36px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Teclado</h1>
            <p style={{ fontSize: "16px", color: "#666", marginTop: "8px" }}>Identifique as notas no teclado do piano</p>
          </div>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
            <div style={{ background: "linear-gradient(to right, #6366f1, #a855f7)", color: "#fff", borderRadius: "12px 12px 0 0", padding: "20px", marginBottom: "24px", marginLeft: "-32px", marginRight: "-32px", marginTop: "-32px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Bem-vindo!</h2>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "#555", display: "block", marginBottom: "8px" }}>Digite seu nome para começar:</label>
              <input type="text" placeholder="Seu nome completo" value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startQuiz()}
                style={{ width: "100%", padding: "12px 14px", fontSize: "15px", border: "2px solid #e0e0e0", borderRadius: "8px", outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
              />
              {nameError && <p style={{ fontSize: "12px", color: "#c0392b", marginTop: "6px" }}>Por favor, insira seu nome para continuar.</p>}
            </div>
            <button onClick={startQuiz} disabled={!studentName.trim()}
              style={{ width: "100%", background: "linear-gradient(to right, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: "8px", padding: "14px", fontSize: "16px", fontWeight: 600, cursor: studentName.trim() ? "pointer" : "default", opacity: studentName.trim() ? 1 : 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}
            >🎹 Iniciar Exercício</button>
            <button onClick={() => onFinish?.()}
              style={{ width: "100%", background: "#fff", color: "#6366f1", border: "2px solid #6366f1", borderRadius: "8px", padding: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f0ff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >← Voltar para Home</button>
          </div>
        </div>
      )}

      {screen === "quiz" && (
        <div style={{ maxWidth: "700px", margin: "0 auto", paddingTop: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: "13px", color: "#777", marginBottom: "12px" }}>
              Aluno: <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{studentName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "14px", color: "#555", fontWeight: 500 }}>Questão {current + 1} de {TOTAL_Q}</div>
              <div style={{ fontSize: "13px", color: "#888" }}>Acertos: {correct} | Erros: {wrong}</div>
            </div>
            <div style={{ height: "7px", background: "#e8e8e8", borderRadius: "99px", marginBottom: "20px", overflow: "hidden" }}>
              <div style={{ height: "100%", background: "linear-gradient(to right, #6366f1, #a855f7)", borderRadius: "99px", transition: "width 0.35s ease", width: `${((current) / TOTAL_Q) * 100}%` }}></div>
            </div>
            <p style={{ textAlign: "center", fontSize: "16px", color: "#555", marginBottom: "16px" }}>
              Qual é a nota destacada no teclado?
            </p>

            {/* Piano Keyboard */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", width: "100%", overflow: "hidden" }}>
              <div style={{ position: "relative", background: "#1a1a1a", padding: "8px 8px 0", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                <div style={{ display: "flex" }}>
                  {WHITE_NOTES.map((note, i) => (
                    <div key={note}
                      style={{
                        width: WHITE_WIDTH, height: WHITE_HEIGHT,
                        background: currentNote === note && !answered ? "#93c5fd" : chosenNote === note && answered ? (chosenNote === currentNote ? "#93c5fd" : "#fca5a5") : "#fff",
                        borderLeft: i === 0 ? "1px solid #ccc" : "none",
                        borderRight: "1px solid #ccc",
                        borderBottom: "1px solid #ccc",
                        boxSizing: "border-box",
                        position: "relative",
                        zIndex: 1,
                        transition: "background 0.15s",
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
                {BLACK_POSITIONS.map(({ note, offset }) => (
                  <div key={note}
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8 + offset * WHITE_WIDTH + WHITE_WIDTH - BLACK_WIDTH / 2,
                      width: BLACK_WIDTH, height: BLACK_HEIGHT,
                      background: currentNote === note ? "#6366f1" : "#1a1a1a",
                      border: currentNote === note ? "2px solid #a855f7" : "1px solid #000",
                      borderRadius: "0 0 5px 5px",
                      zIndex: 2,
                      boxSizing: "border-box",
                      transition: "background 0.15s, border 0.15s",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className={`feedback-msg ${feedbackClass}`} style={{ textAlign: "center", fontSize: "15px", fontWeight: 600, minHeight: "22px", marginBottom: "12px" }}>{feedbackText}</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "7px", marginBottom: "12px" }}>
              {WHITE_NOTES.map((note) => {
                let btnStyle: any = { padding: "11px 4px", fontSize: "15px", fontWeight: 600, border: "1.5px solid #ccc", borderRadius: "8px", background: "#fff", color: "#1a1a1a", cursor: "pointer", transition: "background 0.12s" };
                if (answered) {
                  if (note === questions[current]) { btnStyle.background = "#e8f8ef"; btnStyle.borderColor = "#1D9E75"; btnStyle.color = "#0f6e56"; }
                  else if (note === chosenNote) { btnStyle.background = "#fdecea"; btnStyle.borderColor = "#c0392b"; btnStyle.color = "#c0392b"; }
                }
                return <button key={note} disabled={answered}
                  onClick={() => checkAnswer(note)}
                  style={btnStyle}
                >{note}</button>;
              })}
            </div>

            <button onClick={nextQuestion} disabled={!answered}
              style={{ width: "100%", padding: "14px", fontSize: "16px", fontWeight: 600, background: "linear-gradient(to right, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: "8px", cursor: answered ? "pointer" : "default", opacity: answered ? 1 : 0.5, marginTop: "8px" }}
            >{current >= TOTAL_Q - 1 ? "Ver resultado →" : "Próxima →"}</button>
          </div>
        </div>
      )}

      {screen === "result" && (
        <div style={{ maxWidth: "700px", margin: "0 auto", paddingTop: "20px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#1a1a1a", textAlign: "center", marginBottom: "24px" }}>Resultado final 🎉</h1>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", textAlign: "center", marginBottom: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
            <p style={{ fontSize: "14px", color: "#555", marginBottom: "12px" }}>Parabéns, <strong>{studentName}</strong>!</p>
            <div style={{ fontSize: "72px", fontWeight: 800, background: "linear-gradient(to right, #6366f1, #a855f7)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, margin: "12px 0" }}>{correct}</div>
            <p style={{ fontSize: "15px", color: "#888", margin: "8px 0" }}>de {TOTAL_Q} acertos</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
            {[
              { label: "Acertos", value: correct, color: "#1a1a1a" },
              { label: "Erros", value: wrong, color: "#1a1a1a" },
              { label: "Aproveitamento", value: `${Math.round((correct / TOTAL_Q) * 100)}%`, color: "#1a1a1a" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "26px", fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: "12px" }}>🏆 Placar geral</h3>
          <PianoLeaderboard leaderboard={leaderboard} />
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "20px" }}>
            <button onClick={() => { setScreen("home"); setStudentName(""); }}
              style={{ background: "#fff", color: "#1a1a1a", border: "1.5px solid #ccc", borderRadius: "8px", padding: "12px 28px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
            >Novo aluno</button>
            <button onClick={retry}
              style={{ background: "linear-gradient(to right, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 28px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
            >Tentar novamente</button>
            <button onClick={() => onFinish?.()}
              style={{ background: "#fff", color: "#6366f1", border: "2px solid #6366f1", borderRadius: "8px", padding: "12px 28px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
            >Home</button>
          </div>
        </div>
      )}

      <style>{`
        .feedback-msg { text-align: center; font-size: 15px; font-weight: 600; min-height: 22px; }
        .feedback-msg.ok { color: #1D9E75; }
        .feedback-msg.err { color: #c0392b; }
      `}</style>
    </div>
  );
}

function PianoLeaderboard({ leaderboard }: { leaderboard: any[] }) {
  if (!leaderboard.length) {
    return (
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody><tr><td colSpan={4} style={{ textAlign: "center", color: "#aaa", padding: "32px", fontSize: "14px" }}>Nenhum resultado ainda.</td></tr></tbody>
        </table>
      </div>
    );
  }
  return (
    <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ background: "#fafafa", borderBottom: "1px solid #eee" }}>
          <th style={{ fontSize: "12px", fontWeight: 600, color: "#888", textAlign: "left", padding: "10px 14px" }}>#</th>
          <th style={{ fontSize: "12px", fontWeight: 600, color: "#888", textAlign: "left", padding: "10px 14px" }}>Aluno</th>
          <th style={{ fontSize: "12px", fontWeight: 600, color: "#888", textAlign: "left", padding: "10px 14px" }}>Acertos</th>
          <th style={{ fontSize: "12px", fontWeight: 600, color: "#888", textAlign: "left", padding: "10px 14px" }}>Data</th>
        </tr></thead>
        <tbody>
          {leaderboard.slice(0, 20).map((entry, i) => {
            const badgeColors = [{ bg: "#FFF0C8", color: "#7a5000" }, { bg: "#E8E8E8", color: "#444" }, { bg: "#FFE8DC", color: "#7a3010" }];
            const badge = i < 3 ? badgeColors[i] : { bg: "#f0f0f0", color: "#888" };
            return (
              <tr key={i} style={{ borderBottom: i === leaderboard.length - 1 ? "none" : "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "50%", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, background: badge.bg, color: badge.color }}>{i + 1}</span>
                </td>
                <td style={{ fontSize: "14px", color: "#1a1a1a", padding: "10px 14px", fontWeight: i < 3 ? 700 : 400 }}>{entry.name}</td>
                <td style={{ fontSize: "14px", color: "#0f6e56", padding: "10px 14px", fontWeight: 600 }}>{entry.score}/{TOTAL_Q}</td>
                <td style={{ fontSize: "12px", color: "#aaa", padding: "10px 14px" }}>{entry.date || "N/A"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
