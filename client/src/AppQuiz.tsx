import React, { useState, useEffect } from "react";
import { Music, BookOpen } from "lucide-react";
import PianoActivity from "@/pages/PianoActivity";
import { saveResult } from "@/lib/sheetsApi";
import {
  CLEFS, DIFFICULTY, CLEF_CONFIG, DIFFICULTY_CONFIG,
  filterNotesByDifficulty, type Clef, type DifficultyLevel,
} from "@shared/clefs";

const TOTAL_Q = 20;
const NOTE_X = 270;
const LY = [102, 89, 76, 63, 50];
const STORAGE_KEY = "teoria_musical_leaderboard";

function shuffle(arr: any[]) {
  let a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(notes: any[], difficulty: DifficultyLevel) {
  const filteredNotes = filterNotesByDifficulty(notes, difficulty);
  let result: any[] = [];
  while (result.length < TOTAL_Q) {
    result = result.concat(shuffle([...filteredNotes]));
  }
  return result.slice(0, TOTAL_Q);
}

function loadLeaderboard(): any[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

export default function AppQuiz() {
  const [screen, setScreen] = useState<"home" | "choose" | "config" | "quiz" | "result" | "piano">("home");
  const [activity, setActivity] = useState<"staff" | "piano" | null>(null);
  const [studentName, setStudentName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [selectedClef, setSelectedClef] = useState<Clef>(CLEFS.SOL);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(DIFFICULTY.EASY);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackClass, setFeedbackClass] = useState("");
  const [chosenNote, setChosenNote] = useState<string | null>(null);

  const [state, setState] = useState({
    studentName: "",
    clef: CLEFS.SOL as Clef,
    difficulty: DIFFICULTY.EASY as DifficultyLevel,
    current: 0, correct: 0, wrong: 0,
    answered: false,
    questions: [] as any[],
    startTime: 0, timerInt: null as any, elapsed: 0,
    mistakes: [] as Array<{question: string; answer: string; correct: string}>,
  });

  const [timerDisplay, setTimerDisplay] = useState("⏱ 0s");

  useEffect(() => {
    setLeaderboard(loadLeaderboard());
  }, []);

  useEffect(() => {
    if (screen === "quiz" && state.timerInt === null && state.startTime > 0) {
      const timerInt = setInterval(() => {
        const s = Math.floor((Date.now() - state.startTime) / 1000);
        setTimerDisplay(`⏱ ${s}s`);
      }, 500);
      setState((prev) => ({ ...prev, timerInt }));
    }
    return () => {
      if (state.timerInt) clearInterval(state.timerInt);
    };
  }, [screen, state.startTime]);

  const startExercise = () => {
    if (!studentName.trim()) { setNameError(true); return; }
    setNameError(false);
    setErrorMsg(null);
    setChosenNote(null);
    setFeedbackText("");
    setFeedbackClass("");
    setActivity(null);
    setScreen("choose");
  };

  const selectStaff = () => {
    setActivity("staff");
    setSelectedClef(CLEFS.SOL);
    setSelectedDifficulty(DIFFICULTY.EASY);
    setScreen("config");
  };

  const selectPiano = () => {
    setActivity("piano");
    setScreen("piano");
  };

  const confirmExercise = () => {
    const clefConfig = CLEF_CONFIG[selectedClef];
    const questions = generateQuestions(clefConfig.notes, selectedDifficulty);
    setChosenNote(null);
    setFeedbackText("");
    setFeedbackClass("");
    setState({
      studentName: studentName.trim(), clef: selectedClef, difficulty: selectedDifficulty,
      current: 0, correct: 0, wrong: 0, answered: false, questions,
      startTime: Date.now(), timerInt: null, elapsed: 0, mistakes: [],
    });
    setScreen("quiz");
  };

  const checkAnswer = (chosen: string, correct: string) => {
    if (state.answered) return;
    setChosenNote(chosen);
    const isCorrect = chosen === correct;
    if (isCorrect) {
      setState((prev) => ({ ...prev, correct: prev.correct + 1 }));
      setFeedbackText("✓ Correto!");
      setFeedbackClass("ok");
    } else {
      setState((prev) => ({ ...prev, wrong: prev.wrong + 1, mistakes: [...prev.mistakes, { question: correct, answer: chosen, correct }] }));
      setFeedbackText(`✗ A nota correta era ${correct}`);
      setFeedbackClass("err");
    }
    setState((prev) => ({ ...prev, answered: true }));
  };

  const nextQuestion = () => {
    if (state.current + 1 >= TOTAL_Q) {
      finishExercise(state);
      return;
    }
    setFeedbackText("");
    setFeedbackClass("");
    setChosenNote(null);
    setState((prev) => ({ ...prev, current: prev.current + 1, answered: false, timerInt: null }));
  };

  const finishExercise = async (currentState: typeof state) => {
    if (state.timerInt) clearInterval(state.timerInt);
    const elapsed = Math.floor((Date.now() - currentState.startTime) / 1000);
    setState((prev) => ({ ...prev, elapsed, timerInt: null }));
    const entry = {
      name: currentState.studentName, score: currentState.correct, wrong: currentState.wrong,
      pct: Math.round(currentState.correct / TOTAL_Q * 100), time: elapsed,
      date: new Date().toLocaleDateString("pt-BR"),
      activity: "staff" as const,
      clef: currentState.clef, difficulty: currentState.difficulty,
      mistakes: currentState.mistakes,
    };
    await saveResult(entry);
    setLeaderboard(loadLeaderboard());
    setScreen("result");
  };

  const retryExercise = () => {
    const clefConfig = CLEF_CONFIG[state.clef];
    const questions = generateQuestions(clefConfig.notes, state.difficulty);
    setChosenNote(null);
    setFeedbackText("");
    setFeedbackClass("");
    setState({
      ...state, current: 0, correct: 0, wrong: 0, answered: false, questions,
      startTime: Date.now(), timerInt: null, elapsed: 0, mistakes: [],
    });
    setScreen("quiz");
  };

  const renderQuestion = () => {
    const q = state.questions[state.current];
    const clefConfig = CLEF_CONFIG[state.clef];
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "14px", color: "#555", fontWeight: 500 }}>
            Questão {state.current + 1} de {TOTAL_Q}
          </div>
          <div style={{ fontSize: "13px", color: "#888" }}>{timerDisplay}</div>
        </div>
        <div style={{ height: "7px", background: "#e8e8e8", borderRadius: "99px", marginBottom: "20px", overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(to right, #6366f1, #a855f7)", borderRadius: "99px", transition: "width 0.35s ease", width: `${(state.current / TOTAL_Q) * 100}%` }}></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#1a1a1a" }}>{state.correct}</div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>Acertos</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#1a1a1a" }}>{state.wrong}</div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>Erros</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#1a1a1a" }}>
              {state.correct + state.wrong > 0 ? Math.round((state.correct / (state.current + 1)) * 100) + "%" : "0%"}
            </div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>Aproveitamento</div>
          </div>
        </div>
          <div style={{ background: "#fff", border: "1.5px solid #d0d0d0", borderRadius: "12px", padding: "16px 8px 12px", marginBottom: "16px", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <StaffSVG note={q} clef={state.clef} />
            <div className={`feedback-msg ${feedbackClass}`} style={{ textAlign: "center", fontSize: "15px", fontWeight: 600, minHeight: "22px", marginTop: "8px" }}>{feedbackText}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "7px", marginBottom: "12px" }}>
            {clefConfig.noteNames.map((name) => {
              let btnStyle: any = { padding: "11px 4px", fontSize: "15px", fontWeight: 600, border: "1.5px solid #ccc", borderRadius: "8px", background: "#fff", color: "#1a1a1a", cursor: "pointer", transition: "background 0.12s" };
              if (state.answered) {
                if (name === q.name) { btnStyle.background = "#e8f8ef"; btnStyle.borderColor = "#1D9E75"; btnStyle.color = "#0f6e56"; }
                else if (name === chosenNote) { btnStyle.background = "#fdecea"; btnStyle.borderColor = "#c0392b"; btnStyle.color = "#c0392b"; }
              }
              return <button key={name} disabled={state.answered}
                onClick={() => checkAnswer(name, q.name)}
                style={btnStyle}
              >{name}</button>;
            })}
          </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to br, #f3f0ff via-white to #faf5ff)", padding: "12px", maxWidth: "100vw", overflowX: "hidden" }}>
      {screen === "home" && (
        <div style={{ maxWidth: "800px", margin: "0 auto", paddingTop: "40px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "12px" }}>
              <Music style={{ width: "40px", height: "40px", color: "#6366f1" }} />
              <h1 style={{ fontSize: "48px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Teoria Musical</h1>
              <Music style={{ width: "40px", height: "40px", color: "#a855f7" }} />
            </div>
            <p style={{ fontSize: "18px", color: "#666", margin: 0 }}>Exercícios interativos de leitura de notas no pentagrama</p>
          </div>
          <div style={{ background: "#fff", border: "none", borderRadius: "16px", padding: "32px", marginBottom: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
            <div style={{ background: "linear-gradient(to right, #6366f1, #a855f7)", color: "#fff", borderRadius: "12px 12px 0 0", padding: "20px", marginBottom: "24px", marginLeft: "-32px", marginRight: "-32px", marginTop: "-32px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Bem-vindo!</h2>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "#555", display: "block", marginBottom: "8px" }}>Digite seu nome para começar:</label>
              <input type="text" placeholder="Seu nome completo" value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && startExercise()}
                style={{ width: "100%", padding: "12px 14px", fontSize: "15px", border: "2px solid #e0e0e0", borderRadius: "8px", outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
              />
              {nameError && <p style={{ fontSize: "12px", color: "#c0392b", marginTop: "6px" }}>Por favor, insira seu nome para continuar.</p>}
            </div>
            <button onClick={startExercise} disabled={!studentName.trim()}
              style={{ width: "100%", background: "linear-gradient(to right, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: "8px", padding: "14px", fontSize: "16px", fontWeight: 600, cursor: studentName.trim() ? "pointer" : "default", opacity: studentName.trim() ? 1 : 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              onMouseEnter={(e) => { if (studentName.trim()) e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <BookOpen size={20} /> Iniciar Exercício
            </button>
            <div style={{ textAlign: "center", margin: "20px 0", color: "#999", fontSize: "14px" }}>ou</div>
            <button onClick={() => setScreen("result")}
              style={{ width: "100%", background: "#fff", color: "#6366f1", border: "2px solid #6366f1", borderRadius: "8px", padding: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f0ff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >Ver Painel de Ranking</button>
            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <button onClick={() => window.location.href = "/teacher-login"}
                style={{ background: "none", border: "none", color: "#888", fontSize: "13px", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#6366f1")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
              >Acesso do Professor →</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
            <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: "8px" }}>Como Funciona</h3>
              <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>Escolha o nível de dificuldade e a clave musical. Responda 20 questões e veja seu desempenho em tempo real.</p>
            </div>
            <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: "8px" }}>Painel do Professor</h3>
              <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>Acesse o ranking para visualizar o desempenho de todos os alunos e acompanhar o progresso.</p>
            </div>
          </div>
        </div>
      )}

      {screen === "choose" && (
        <div style={{ maxWidth: "700px", margin: "0 auto", paddingTop: "60px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
            <div style={{ background: "linear-gradient(to right, #6366f1, #a855f7)", color: "#fff", borderRadius: "12px 12px 0 0", padding: "20px", marginBottom: "24px", marginLeft: "-32px", marginRight: "-32px", marginTop: "-32px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Olá, {studentName.trim()}!</h2>
            </div>
            <p style={{ textAlign: "center", fontSize: "16px", color: "#555", marginBottom: "28px" }}>Escolha uma atividade:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
              <button onClick={selectStaff}
                style={{ padding: "28px", border: "2px solid #e0e0e0", borderRadius: "16px", background: "#fff", cursor: "pointer", textAlign: "center", transition: "border-color 0.2s, background 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "#f3f0ff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "#fff"; }}
              >
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎼</div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a", marginBottom: "6px" }}>NOTAS MUSICAIS</div>
                <div style={{ fontSize: "14px", color: "#666" }}>Identifique as notas no pentagrama musical • 20 questões • 3 níveis</div>
              </button>
              <button onClick={selectPiano}
                style={{ padding: "28px", border: "2px solid #e0e0e0", borderRadius: "16px", background: "#fff", cursor: "pointer", textAlign: "center", transition: "border-color 0.2s, background 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#a855f7"; e.currentTarget.style.background = "#faf5ff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "#fff"; }}
              >
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎹</div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a", marginBottom: "6px" }}>TECLADO</div>
                <div style={{ fontSize: "14px", color: "#666" }}>Identifique as notas no teclado do piano • 10 questões</div>
              </button>
            </div>
            <button onClick={() => setScreen("home")}
              style={{ width: "100%", background: "#fff", color: "#1a1a1a", border: "1.5px solid #ccc", borderRadius: "8px", padding: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >← Voltar</button>
          </div>
        </div>
      )}

      {screen === "piano" && (
        <PianoActivity studentName={studentName} onFinish={() => setScreen("home")} />
      )}

      {screen === "config" && (
        <div style={{ maxWidth: "800px", margin: "0 auto", paddingTop: "40px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
            <div style={{ background: "linear-gradient(to right, #6366f1, #a855f7)", color: "#fff", borderRadius: "12px 12px 0 0", padding: "20px", marginBottom: "24px", marginLeft: "-32px", marginRight: "-32px", marginTop: "-32px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Configurar Exercício</h2>
            </div>
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: "16px" }}>Selecione a Clave:</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                {Object.entries(CLEF_CONFIG).map(([key, config]) => (
                  <button key={key} onClick={() => setSelectedClef(key as Clef)}
                    style={{ padding: "16px", border: selectedClef === key ? "2px solid #6366f1" : "1.5px solid #e0e0e0", borderRadius: "12px", background: selectedClef === key ? "#f3f0ff" : "#fff", cursor: "pointer", textAlign: "left" }}
                  >
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>{config.unicode}</div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>{config.label}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>{config.description}</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: "16px" }}>Selecione o Nível:</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                  <button key={key} onClick={() => setSelectedDifficulty(key as DifficultyLevel)}
                    style={{ padding: "16px", border: selectedDifficulty === key ? "2px solid #6366f1" : "1.5px solid #e0e0e0", borderRadius: "12px", background: selectedDifficulty === key ? "#f3f0ff" : "#fff", cursor: "pointer", textAlign: "center" }}
                  >
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{config.icon}</div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>{config.label}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>{config.description}</div>
                  </button>
                ))}
              </div>
            </div>
            {errorMsg && (
              <div style={{ background: "#fdecea", color: "#c0392b", padding: "12px 16px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px", border: "1px solid #f5c6cb" }}>
                {errorMsg}
              </div>
            )}
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => { setScreen("home"); setErrorMsg(null); }}
                style={{ flex: 1, background: "#fff", color: "#1a1a1a", border: "1.5px solid #ccc", borderRadius: "8px", padding: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >Voltar</button>
              <button onClick={confirmExercise}
                style={{ flex: 1, background: "linear-gradient(to right, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: "8px", padding: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >Começar Exercício</button>
            </div>
          </div>
        </div>
      )}

      {screen === "quiz" && (
        <div style={{ maxWidth: "700px", margin: "0 auto", paddingTop: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: "13px", color: "#777", marginBottom: "8px" }}>
              Aluno: <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{state.studentName}</span>
              {" • "}
              <span style={{ fontSize: "12px", color: "#999" }}>{CLEF_CONFIG[state.clef].label} • {DIFFICULTY_CONFIG[state.difficulty].label}</span>
            </div>
            {renderQuestion()}
            <button id="next-btn" onClick={nextQuestion} disabled={!state.answered}
              style={{ width: "100%", padding: "14px", fontSize: "16px", fontWeight: 600, background: "linear-gradient(to right, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: "8px", cursor: state.answered ? "pointer" : "default", opacity: state.answered ? 1 : 0.5, marginTop: "16px" }}
            >
              {state.current === TOTAL_Q - 1 ? "Ver resultado →" : "Próxima →"}
            </button>
          </div>
        </div>
      )}

      {screen === "result" && (
        <div style={{ maxWidth: "700px", margin: "0 auto", paddingTop: "20px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#1a1a1a", textAlign: "center", marginBottom: "24px" }}>Resultado final 🎉</h1>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", textAlign: "center", marginBottom: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
            <p style={{ fontSize: "14px", color: "#555", marginBottom: "12px" }}>Parabéns, <strong>{state.studentName}</strong>!</p>
            <div style={{ fontSize: "72px", fontWeight: 800, background: "linear-gradient(to right, #6366f1, #a855f7)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, margin: "12px 0" }}>{state.correct}</div>
            <p style={{ fontSize: "15px", color: "#888", margin: "8px 0" }}>de 20 acertos</p>
            <p style={{ fontSize: "13px", color: "#aaa", marginTop: "12px" }}>Tempo total: {state.elapsed}s</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "26px", fontWeight: 700, color: "#1a1a1a" }}>{state.correct}</div>
              <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>Acertos</div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "26px", fontWeight: 700, color: "#1a1a1a" }}>{state.wrong}</div>
              <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>Erros</div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "26px", fontWeight: 700, color: "#1a1a1a" }}>{Math.round((state.correct / TOTAL_Q) * 100)}%</div>
              <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>Aproveitamento</div>
            </div>
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: "12px" }}>🏆 Placar geral</h3>
          <Leaderboard leaderboard={leaderboard} />
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "20px" }}>
            <button onClick={() => setScreen("home")}
              style={{ background: "#fff", color: "#1a1a1a", border: "1.5px solid #ccc", borderRadius: "8px", padding: "12px 28px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >Novo aluno</button>
            <button onClick={retryExercise}
              style={{ background: "linear-gradient(to right, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 28px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >Tentar novamente</button>
          </div>
        </div>
      )}

      <style>{`
        .feedback-msg { text-align: center; font-size: 15px; font-weight: 600; min-height: 22px; margin-top: 8px; }
        .feedback-msg.ok { color: #1D9E75; }
        .feedback-msg.err { color: #c0392b; }
        .note-btn:hover:not(:disabled) { background: #f0faf6; border-color: #6366f1; }
        .note-btn.correct { background: #e8f8ef !important; border-color: #1D9E75 !important; color: #0f6e56 !important; }
        .note-btn.wrong { background: #fdecea !important; border-color: #c0392b !important; color: #c0392b !important; }
        .note-btn:disabled { cursor: default; }
      `}</style>
      <div style={{ maxWidth: "800px", margin: "40px auto 0", padding: "32px", borderTop: "1px solid #e0e0e0" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: "8px" }}>Sobre esta Plataforma</h3>
        <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
          Esta plataforma foi desenvolvida por Thômas Edson para acompanhar aprendizado de alunos no GEM - Grupo de Ensino Musical.
        </p>
      </div>
    </div>
  );
}

function StaffSVG({ note, clef }: { note: any; clef: Clef }) {
  if (!note) return null;
  const BLACK = "#1a1a1a";
  const SW = "1.8";
  const clefConfig = CLEF_CONFIG[clef];

  const ledgerLines: number[] = [];
  if (note.y > 102) {
    for (let ly = 115; ly <= note.y; ly += 13)
      ledgerLines.push(ly);
  } else if (note.y < 50) {
    for (let ly = 37; ly >= note.y; ly -= 13)
      ledgerLines.push(ly);
  }

  return (
    <svg viewBox="0 0 420 160" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", maxWidth: "420px" }}>
      {LY.map((y, i) => (
        <line key={`line-${i}`} x1="40" y1={y} x2="390" y2={y} stroke={BLACK} strokeWidth={SW} strokeLinecap="round" />
      ))}
      <line x1="40" y1={LY[4]} x2="40" y2={LY[0]} stroke={BLACK} strokeWidth="2.5" />
      <line x1="390" y1={LY[4]} x2="390" y2={LY[0]} stroke={BLACK} strokeWidth="2.5" />
      <text x="46" y="113" fontSize="72" fill={BLACK} fontFamily='Georgia, "Times New Roman", serif'>{clefConfig.unicode}</text>
      {ledgerLines.map((ly) => (
        <line key={ly} x1={NOTE_X - 16} y1={ly} x2={NOTE_X + 16} y2={ly} stroke={BLACK} strokeWidth={SW} strokeLinecap="round" />
      ))}
      <ellipse cx={NOTE_X} cy={note.y} rx="12" ry="8" fill={BLACK} transform={`rotate(-20 ${NOTE_X} ${note.y})`} />
      {note.y >= 76 ? (
        <line x1={NOTE_X + 11} y1={note.y - 5} x2={NOTE_X + 11} y2={note.y - 42} stroke={BLACK} strokeWidth="2" />
      ) : (
        <line x1={NOTE_X - 11} y1={note.y + 5} x2={NOTE_X - 11} y2={note.y + 42} stroke={BLACK} strokeWidth="2" />
      )}
    </svg>
  );
}

function Leaderboard({ leaderboard }: { leaderboard: any[] }) {
  if (!leaderboard.length) {
    return (
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody><tr><td colSpan={5} style={{ textAlign: "center", color: "#aaa", padding: "32px", fontSize: "14px" }}>Nenhum resultado ainda.</td></tr></tbody>
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
            const scoreColor = entry.percentage >= 80 ? "#0f6e56" : entry.percentage >= 50 ? "#8a6000" : "#c0392b";
            return (
              <tr key={i} style={{ borderBottom: i === leaderboard.length - 1 ? "none" : "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "50%", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, background: badge.bg, color: badge.color }}>{i + 1}</span>
                </td>
                <td style={{ fontSize: "14px", color: "#1a1a1a", padding: "10px 14px", fontWeight: i < 3 ? 700 : 400 }}>{entry.name}</td>
                <td style={{ fontSize: "14px", color: scoreColor, padding: "10px 14px", fontWeight: 600 }}>{entry.score}/20</td>
                <td style={{ fontSize: "12px", color: "#aaa", padding: "10px 14px" }}>{entry.date || "N/A"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
