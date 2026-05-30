import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NOTES } from "@shared/musicNotes";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  isLoading?: boolean;
}

export const AnswerInput: React.FC<AnswerInputProps> = ({ onSubmit, isLoading = false }) => {
  const [selectedNote, setSelectedNote] = useState<string>("");

  const handleSubmit = () => {
    if (selectedNote) {
      onSubmit(selectedNote);
      setSelectedNote("");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="w-full max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Qual é a nota?
        </label>
        <Select value={selectedNote} onValueChange={setSelectedNote}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a nota..." />
          </SelectTrigger>
          <SelectContent>
            {NOTES.map((note) => (
              <SelectItem key={note} value={note}>
                {note}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedNote || isLoading}
        className="w-full max-w-xs"
        size="lg"
      >
        {isLoading ? "Verificando..." : "Enviar Resposta"}
      </Button>
    </div>
  );
};
