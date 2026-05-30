import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { NOTE_POSITIONS } from "@shared/musicNotes";

interface PositionActivityProps {
  note: string;
  onSubmit: (answer: string) => void;
  isLoading?: boolean;
}

export const PositionActivity: React.FC<PositionActivityProps> = ({
  note,
  onSubmit,
  isLoading = false,
}) => {
  const [draggedNote, setDraggedNote] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const LY = [102, 89, 76, 63, 50];
  const correctY = NOTE_POSITIONS[note] ?? 90;
  const NOTE_X = 200;

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const scaleY = 160 / rect.height;
      const x = (e.clientX - rect.left) * scaleY;
      const y = (e.clientY - rect.top) * scaleY;
      setDraggedNote({ x, y });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const scaleY = 160 / rect.height;
      const x = (e.clientX - rect.left) * scaleY;
      const y = (e.clientY - rect.top) * scaleY;
      setDraggedNote({ x, y });
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const isCorrectPosition = draggedNote && Math.abs(draggedNote.y - correctY) < 8;

  const handleSubmit = () => {
    if (draggedNote) {
      onSubmit(note);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700 mb-2">
          Posicione a nota no pentagrama
        </p>
        <p className="text-2xl font-bold text-indigo-600">{note}</p>
      </div>

      <div className="flex justify-center items-center py-8">
        <svg
          ref={svgRef}
          viewBox="0 0 420 160"
          width="100%"
          style={{ maxWidth: "420px", display: "block", border: "2px dashed #ccc", borderRadius: "12px" }}
          className="drop-shadow-lg bg-white"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
        >
          {LY.map((y, i) => (
            <line
              key={`line-${i}`}
              x1="40" y1={y} x2="390" y2={y}
              stroke="#333" strokeWidth="1.8" strokeLinecap="round"
            />
          ))}

          <line x1="40" y1={LY[4]} x2="40" y2={LY[0]} stroke="#333" strokeWidth="2.5" />
          <line x1="390" y1={LY[4]} x2="390" y2={LY[0]} stroke="#333" strokeWidth="2.5" />

          <text
            x="46" y="113" fontSize="72" fill="#333"
            fontFamily='Georgia, "Times New Roman", serif'
          >
            𝄞
          </text>

          {draggedNote && (
            <g>
              <ellipse
                cx={draggedNote.x}
                cy={draggedNote.y}
                rx="12" ry="8"
                fill="#e74c3c"
                stroke="#c0392b"
                strokeWidth="1"
                transform={`rotate(-20 ${draggedNote.x} ${draggedNote.y})`}
              />
              <line
                x1={draggedNote.x + 11} y1={draggedNote.y - 5}
                x2={draggedNote.x + 11} y2={draggedNote.y - 42}
                stroke="#333" strokeWidth="2"
              />
            </g>
          )}

          <line
            x1={NOTE_X - 30} y1={correctY}
            x2={NOTE_X - 10} y2={correctY}
            stroke="#999" strokeWidth="1" strokeDasharray="5,5" opacity="0.3"
          />
        </svg>
      </div>

      {isCorrectPosition && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-sm text-green-700 font-medium">Posição correta!</p>
        </div>
      )}

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!draggedNote || isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg disabled:opacity-50"
        >
          {isLoading ? "Verificando..." : "Confirmar"}
        </Button>
      </div>

      <div className="flex justify-center mt-8">
        <div
          draggable
          onDragStart={handleDragStart}
          className="cursor-move p-4 bg-indigo-100 border-2 border-indigo-300 rounded-lg hover:bg-indigo-200 transition-colors"
        >
          <svg width="40" height="50" viewBox="0 0 40 50">
            <ellipse cx="20" cy="25" rx="6" ry="7" fill="#e74c3c" stroke="#c0392b" strokeWidth="1" />
            <line x1="26" y1="25" x2="26" y2="-10" stroke="#333" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
};
