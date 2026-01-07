import React, { useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';

interface EditorPanelProps {
  title: string;
  code: string;
  onChange: (code: string) => void;
  onReset: () => void;
  active: boolean;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ title, code, onChange, onReset, active }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!active) return null;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex justify-between items-center px-4 py-2 border-b border-border bg-background">
        <h3 className="text-sm font-semibold text-foreground font-mono">{title}</h3>
        <button 
          onClick={onReset}
          className="flex items-center text-xs text-muted-foreground hover:text-destructive px-2 py-1 rounded hover:bg-destructive/10 transition-colors"
        >
          <RotateCcw size={14} className="mr-1" />
          Reset
        </button>
      </div>
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-background text-foreground leading-relaxed"
          spellCheck={false}
          style={{ fontFamily: '"Fira Code", "Menlo", "Consolas", monospace' }}
        />
      </div>
    </div>
  );
};

export default EditorPanel;