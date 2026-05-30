export const NOTES = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"];

export const NOTE_POSITIONS: Record<string, number> = {
  "Dó": 115,
  "Ré": 109,
  "Mi": 102,
  "Fá": 96,
  "Sol": 89,
  "Lá": 83,
  "Si": 76,
};

export type ActivityType = "identify" | "position";

export interface Activity {
  id: number;
  type: ActivityType;
  note: string;
  questionNumber: number;
}

export function getRandomNote(): string {
  return NOTES[Math.floor(Math.random() * NOTES.length)];
}

export function getNotePosition(note: string): number {
  return NOTE_POSITIONS[note] ?? 90;
}

export function generateActivities(totalActivities: number = 20): Activity[] {
  const activities: Activity[] = [];

  const identifyCount = Math.floor(totalActivities / 2);
  const positionCount = totalActivities - identifyCount;

  let id = 1;

  for (let i = 0; i < identifyCount; i++) {
    activities.push({
      id,
      type: "identify",
      note: getRandomNote(),
      questionNumber: i + 1,
    });
    id++;
  }

  for (let i = 0; i < positionCount; i++) {
    activities.push({
      id,
      type: "position",
      note: getRandomNote(),
      questionNumber: identifyCount + i + 1,
    });
    id++;
  }

  return activities.sort(() => Math.random() - 0.5);
}
