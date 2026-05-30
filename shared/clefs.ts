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
// 3 linhas suplementares acima e abaixo da pauta (23 notas, de Mi3 a Fá6)
export const NOTES_SOL = [
  { name: "Mi", y: 148, ledger: false },   // espaço abaixo da 3ª linha suplementar
  { name: "Fá", y: 141, ledger: true },    // 3ª linha suplementar inferior
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
  { name: "Ré", y: 17, ledger: false },    // espaço acima da 2ª linha suplementar
  { name: "Mi", y: 11, ledger: true },     // 3ª linha suplementar superior
  { name: "Fá", y: 5, ledger: false },     // espaço acima da 3ª linha suplementar
];

// ==================== CLAVE DE FÁ ====================
// Clave de Fá: 4ª linha = Fá
// Linhas de baixo pra cima: 1ª=Sol, 2ª=Si, 3ª=Ré, 4ª=Fá, 5ª=Lá
// Espaços de baixo pra cima: Fá(abaixo 1ª), Lá(entre 1ª e 2ª), Dó(entre 2ª e 3ª), Mi(entre 3ª e 4ª), Sol(entre 4ª e 5ª)
// 2 linhas suplementares acima e abaixo da pauta (18 notas, de Si1 a Mi4)

export const NOTES_FA = [
  { name: "Si", y: 134, ledger: false },   // espaço abaixo da 2ª linha suplementar
  { name: "Dó", y: 128, ledger: true },    // 2ª linha suplementar inferior
  { name: "Ré", y: 121, ledger: false },   // espaço abaixo da 1ª linha suplementar
  { name: "Mi", y: 115, ledger: true },    // 1ª linha suplementar inferior
  { name: "Fá", y: 109, ledger: false },   // espaço abaixo da pauta
  { name: "Sol", y: 102, ledger: false },  // 1ª linha
  { name: "Lá", y: 96, ledger: false },    // 1º espaço
  { name: "Si", y: 89, ledger: false },    // 2ª linha
  { name: "Dó", y: 83, ledger: false },    // 2º espaço
  { name: "Ré", y: 76, ledger: false },    // 3ª linha
  { name: "Mi", y: 70, ledger: false },    // 3º espaço
  { name: "Fá", y: 63, ledger: false },    // 4ª linha (clave de Fá)
  { name: "Sol", y: 57, ledger: false },   // 4º espaço
  { name: "Lá", y: 50, ledger: false },    // 5ª linha
  { name: "Si", y: 43, ledger: false },    // espaço acima da pauta
  { name: "Dó", y: 37, ledger: true },     // 1ª linha suplementar superior
  { name: "Ré", y: 30, ledger: false },    // espaço acima da 1ª linha suplementar
  { name: "Mi", y: 24, ledger: true },     // 2ª linha suplementar superior
];

export const NOTE_NAMES_SOL = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"];
export const NOTE_NAMES_FA = ["Lá", "Si", "Dó", "Ré", "Mi", "Fá", "Sol"];

// Configurações de dificuldade
export const DIFFICULTY_CONFIG = {
  [DIFFICULTY.EASY]: {
    label: "Fácil",
    description: "Apenas notas nas 5 linhas da pauta",
    icon: "🌱",
    color: "#10b981",
  },
  [DIFFICULTY.MEDIUM]: {
    label: "Médio",
    description: "Linhas e espaços (sem suplementares)",
    icon: "📚",
    color: "#f59e0b",
  },
  [DIFFICULTY.HARD]: {
    label: "Difícil",
    description: "Todas as notas (incluindo suplementares)",
    icon: "🚀",
    color: "#ef4444",
  },
} as const;

// Configurações de clave
export const CLEF_CONFIG = {
  [CLEFS.SOL]: {
    label: "Clave de Sol",
    description: "Notas na Clave de Sol (3 linhas suplementares)",
    notes: NOTES_SOL,
    noteNames: NOTE_NAMES_SOL,
    unicode: "𝄞",
  },
  [CLEFS.FA]: {
    label: "Clave de Fá",
    description: "Notas na Clave de Fá (2 linhas suplementares)",
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
