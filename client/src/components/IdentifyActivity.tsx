import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { NOTES } from "@shared/musicNotes";
import { ImprovedStaff } from "./ImprovedStaff";

interface IdentifyActivityProps {
  note: string;
  onSubmit: (answer: string) => void;
  isLoading?: boolean;
}

export const IdentifyActivity: React.FC<IdentifyActivityProps> = ({
  note,
  onSubmit,
  isLoading = false,
}) => {
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedNote) {
      onSubmit(selectedNote);
      setSelectedNote(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700 mb-4">
          Que nota é esta?
        </p>
      </div>

      <ImprovedStaff note={note} showNote={true} />

      <div className="flex justify-center gap-3 flex-wrap">
        {NOTES.map((noteName) => (
          <Button
            key={noteName}
            onClick={() => setSelectedNote(noteName)}
            variant={selectedNote === noteName ? "default" : "outline"}
            className={`px-6 py-3 font-semibold transition-all ${
              selectedNote === noteName
                ? "bg-indigo-600 text-white shadow-lg scale-105"
                : "hover:border-indigo-400"
            }`}
            disabled={isLoading}
          >
            {noteName}
          </Button>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!selectedNote || isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg disabled:opacity-50"
        >
          {isLoading ? "Verificando..." : "Confirmar"}
        </Button>
      </div>
    </div>
  );
};
