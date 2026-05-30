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
// Linhas suplementares abaixo e acima, abrangendo ~2 oitavas (Sol3 a Dó6)
export const NOTES_SOL = [
  { name: "Sol", y: 134, ledger: false },  // espaço abaixo da 2ª linha suplementar
  { name: "Lá", y: 128, ledger: true },    // 2ª linha suplementar inferior
  { name: "Si", y: 121, ledger: false },   // espaço abaixo da 1ª linha suplementar
  { name: "Dó", y: 115, ledger: true },    // 1ª linha suplementar inferior (Dó central)
  { name: "Ré", y: 109, ledger: false },   // espaço abaixo da pauta
  { name: "Mi", y: 102, ledger: false },   // 1ª linha da pauta
  { name: "Fá", y: 96, ledger: false },    // 1º espaço
  { name: "Sol", y: 89, ledger: false },   // 2ª linha
  { name: "Lá", y: 83, ledger: false },    // 2º espaço
  { name: "Si", y: 76, ledger: false },    // 3ª linha
  { name: "Dó", y: 70, ledger: false },    // 3º espaço
  { name: "Ré", y: 63, ledger: false },    // 4ª linha
  { name: "Mi", y: 57, ledger: false },    // 4º espaço
  { name: "Fá", y: 50, ledger: false },    // 5ª linha
  { name: "Sol", y: 43, ledger: false },   // espaço acima da pauta
  { name: "Lá", y: 37, ledger: true },     // 1ª linha suplementar superior
  { name: "Si", y: 30, ledger: false },    // espaço acima da 1ª linha suplementar
  { name: "Dó", y: 24, ledger: true },     // 2ª linha suplementar superior
];

// ==================== CLAVE DE FÁ ====================
// Clave de Fá: 4ª linha = Fá
// Linhas de baixo pra cima: 1ª=Lá, 2ª=Fá, 3ª=Ré, 4ª=Si, 5ª=Sol
// Espaços de baixo pra cima: Si(abaixo 1ª), Ré(entre 1ª e 2ª), Fá(entre 2ª e 3ª), Lá(entre 3ª e 4ª), Dó(acima 5ª)

export const NOTES_FA = [
  { name: "Mi", y: 134, ledger: false },   // espaço abaixo da 2ª linha suplementar
  { name: "Fá", y: 128, ledger: true },    // 2ª linha suplementar inferior
  { name: "Sol", y: 121, ledger: false },  // espaço abaixo da 1ª linha suplementar
  { name: "Lá", y: 115, ledger: true },    // 1ª linha suplementar inferior
  { name: "Si", y: 109, ledger: false },   // espaço abaixo da pauta
  { name: "Dó", y: 102, ledger: false },   // 1ª linha
  { name: "Ré", y: 96, ledger: false },    // 1º espaço
  { name: "Mi", y: 89, ledger: false },    // 2ª linha
  { name: "Fá", y: 83, ledger: false },    // 2º espaço
  { name: "Sol", y: 76, ledger: false },   // 3ª linha
  { name: "Lá", y: 70, ledger: false },    // 3º espaço
  { name: "Si", y: 63, ledger: false },    // 4ª linha (clave de Fá)
  { name: "Dó", y: 57, ledger: false },    // 4º espaço
  { name: "Ré", y: 50, ledger: false },    // 5ª linha
  { name: "Mi", y: 43, ledger: false },    // espaço acima da pauta
  { name: "Fá", y: 37, ledger: true },     // 1ª linha suplementar superior
  { name: "Sol", y: 30, ledger: false },   // espaço acima da 1ª linha suplementar
  { name: "Lá", y: 24, ledger: true },     // 2ª linha suplementar superior
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
    // Apenas notas nas 5 linhas da pauta (sem linhas suplementares)
    return notes.filter((n) => !n.ledger && [102, 89, 76, 63, 50].includes(n.y));
  } else if (difficulty === DIFFICULTY.MEDIUM) {
    // Todas as notas na pauta + espaços (sem linhas suplementares)
    return notes.filter((n) => !n.ledger);
  } else {
    // Todas as notas (incluindo linhas suplementares)
    return notes;
  }
}
