import React from "react";
import { getNotePosition } from "@shared/musicNotes";

interface ImprovedStaffProps {
  note: string;
  showNote?: boolean;
}

export const ImprovedStaff: React.FC<ImprovedStaffProps> = ({
  note,
  showNote = true,
}) => {
  const noteY = getNotePosition(note);
  const LY = [102, 89, 76, 63, 50];
  const NOTE_X = 270;

  return (
    <div className="flex justify-center items-center py-8">
      <svg
        viewBox="0 0 420 160"
        width="100%"
        style={{ maxWidth: "420px", display: "block" }}
        className="drop-shadow-lg"
      >
        {LY.map((y, i) => (
          <line
            key={`line-${i}`}
            x1="40" y1={y} x2="390" y2={y}
            stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round"
          />
        ))}

        <line x1="40" y1={LY[4]} x2="40" y2={LY[0]} stroke="#1a1a1a" strokeWidth="2.5" />
        <line x1="390" y1={LY[4]} x2="390" y2={LY[0]} stroke="#1a1a1a" strokeWidth="2.5" />

        <text
          x="46" y="113" fontSize="72" fill="#1a1a1a"
          fontFamily='Georgia, "Times New Roman", serif'
        >
          𝄞
        </text>

        {showNote && (
          <g>
            {noteY >= 110 && (
              <line
                x1={NOTE_X - 16} y1={noteY}
                x2={NOTE_X + 16} y2={noteY}
                stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round"
              />
            )}

            <ellipse
              cx={NOTE_X}
              cy={noteY}
              rx="12" ry="8"
              fill="#e74c3c"
              transform={`rotate(-20 ${NOTE_X} ${noteY})`}
            />

            {noteY >= 76 ? (
              <line
                x1={NOTE_X + 11} y1={noteY - 5}
                x2={NOTE_X + 11} y2={noteY - 42}
                stroke="#1a1a1a" strokeWidth="2"
              />
            ) : (
              <line
                x1={NOTE_X - 11} y1={noteY + 5}
                x2={NOTE_X - 11} y2={noteY + 42}
                stroke="#1a1a1a" strokeWidth="2"
              />
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
