// Clave de Sol: 2ª linha = Sol
// Linhas de baixo pra cima: 1ª=Mi, 2ª=Sol, 3ª=Si, 4ª=Ré, 5ª=Fá
// Espaços de baixo pra cima: Fá(abaixo 1ª), Lá(entre 1ª e 2ª), Dó(entre 2ª e 3ª), Mi(entre 3ª e 4ª), Si(acima 5ª)

export const CLEFS = {
  SOL: "sol",
  FA: "fa",
} as const;

export const DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;

export type Clef = typeof CLEFS[keyof typeof CLEFS];
export type DifficultyLevel = typeof DIFFICULTY[keyof typeof DIFFICULTY];

// ==================== CLAVE DE SOL ====================
export const NOTES_SOL = [
  { name: "Dó", y: 115, ledger: true },
  { name: "Ré", y: 109, ledger: false },
  { name: "Mi", y: 102, ledger: false },
  { name: "Fá", y: 96, ledger: false },
  { name: "Sol", y: 89, ledger: false },
  { name: "Lá", y: 83, ledger: false },
  { name: "Si", y: 76, ledger: false },
];

// ==================== CLAVE DE FÁ ====================
// Clave de Fá: 4ª linha = Fá
// Linhas de baixo pra cima: 1ª=Lá, 2ª=Fá, 3ª=Ré, 4ª=Si, 5ª=Sol
// Espaços de baixo pra cima: Si(abaixo 1ª), Ré(entre 1ª e 2ª), Fá(entre 2ª e 3ª), Lá(entre 3ª e 4ª), Dó(acima 5ª)

export const NOTES_FA = [
  { name: "Lá", y: 115, ledger: true },
  { name: "Si", y: 109, ledger: false },
  { name: "Dó", y: 102, ledger: false },
  { name: "Ré", y: 96, ledger: false },
  { name: "Mi", y: 89, ledger: false },
  { name: "Fá", y: 83, ledger: false },
  { name: "Sol", y: 76, ledger: false },
];

export const NOTE_NAMES_SOL = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"];
export const NOTE_NAMES_FA = ["Lá", "Si", "Dó", "Ré", "Mi", "Fá", "Sol"];

// Configurações de dificuldade
export const DIFFICULTY_CONFIG = {
  [DIFFICULTY.EASY]: {
    label: "Fácil",
    description: "Apenas notas nas linhas",
    icon: "🌱",
    color: "#10b981",
  },
  [DIFFICULTY.MEDIUM]: {
    label: "Médio",
    description: "Linhas e espaços",
    icon: "📚",
    color: "#f59e0b",
  },
  [DIFFICULTY.HARD]: {
    label: "Difícil",
    description: "Todas as notas",
    icon: "🚀",
    color: "#ef4444",
  },
} as const;

// Configurações de clave
export const CLEF_CONFIG = {
  [CLEFS.SOL]: {
    label: "Clave de Sol",
    description: "Notas na Clave de Sol",
    notes: NOTES_SOL,
    noteNames: NOTE_NAMES_SOL,
    unicode: "𝄞",
  },
  [CLEFS.FA]: {
    label: "Clave de Fá",
    description: "Notas na Clave de Fá",
    notes: NOTES_FA,
    noteNames: NOTE_NAMES_FA,
    unicode: "𝄢",
  },
} as const;

// Função para filtrar notas por dificuldade
export function filterNotesByDifficulty(
  notes: typeof NOTES_SOL,
  difficulty: DifficultyLevel
) {
  if (difficulty === DIFFICULTY.EASY) {
    // Apenas notas nas linhas (ledger = false, y = 102, 89, 76)
    return notes.filter((n) => !n.ledger && [102, 89, 76].includes(n.y));
  } else if (difficulty === DIFFICULTY.MEDIUM) {
    // Linhas e espaços (ledger = false)
    return notes.filter((n) => !n.ledger);
  } else {
    // Todas as notas (incluindo ledger)
    return notes;
  }
}
