import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Circle, Type, FileText } from 'lucide-react';

interface AstNodeProps {
  node: any;
  label?: string;
  depth?: number;
}

const isPrimitive = (val: any) => val !== Object(val);

const AstNode: React.FC<AstNodeProps> = ({ node, label, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(depth < 2); // Auto-expand top levels

  if (!node) return null;

  // Primitive value leaf
  if (isPrimitive(node)) {
    return (
      <div className="pl-4 py-1 text-sm font-mono text-muted-foreground flex items-start hover:bg-muted/50 rounded">
        <span className="text-sky-400 mr-2 select-none">{label}:</span>
        <span className="text-emerald-400 break-all">
          {typeof node === 'string' ? `"${node}"` : String(node)}
        </span>
      </div>
    );
  }

  // Array handling
  if (Array.isArray(node)) {
    if (node.length === 0) {
        return (
             <div className="pl-4 py-1 text-sm font-mono text-muted-foreground flex items-center">
                 <span className="text-sky-400 mr-2">{label}:</span> []
             </div>
        )
    }
    return (
      <div className="pl-2">
        <div 
            className="flex items-center cursor-pointer hover:bg-muted/50 py-1 rounded px-2 select-none"
            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        >
          {isOpen ? <ChevronDown size={14} className="text-muted-foreground mr-1" /> : <ChevronRight size={14} className="text-muted-foreground mr-1" />}
          <span className="text-sky-400 text-sm font-mono font-bold">{label}</span>
          <span className="text-xs text-muted-foreground ml-2">[{node.length}]</span>
        </div>
        {isOpen && (
          <div className="pl-4 border-l border-border ml-2">
            {node.map((item, idx) => (
              <AstNode key={idx} node={item} label={String(idx)} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Object/Node handling
  const nodeType = node.type || 'Object';
  const hasChildren = Object.keys(node).length > 0;
  
  // Custom Icon based on type
  const getIcon = (type: string) => {
      if (type === 'root') return <FileText size={14} className="text-amber-500" />;
      if (type === 'text') return <Type size={14} className="text-muted-foreground" />;
      return <Circle size={10} className="text-blue-400" />;
  }

  return (
    <div className="pl-2">
      <div 
        className="flex items-center cursor-pointer hover:bg-muted/50 py-1 rounded px-2 select-none group"
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
      >
        <span className="mr-1 mt-0.5">
            {hasChildren && (isOpen ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />)}
        </span>
        <span className="mr-2 opacity-75">{getIcon(nodeType)}</span>
        <span className="text-rose-400 font-mono text-sm font-semibold">{nodeType}</span>
        {node.tagName && <span className="ml-2 text-xs bg-muted text-muted-foreground px-1 rounded font-mono">{'<' + node.tagName + '>'}</span>}
        {label && label !== String(depth) && <span className="ml-2 text-xs text-muted-foreground">({label})</span>}
      </div>

      {isOpen && hasChildren && (
        <div className="pl-4 border-l border-border ml-2.5">
          {Object.entries(node).map(([key, value]) => {
             if (key === 'type') return null; // Already shown in header
             // Render 'children' array last for better readability usually, but map order is insertion order mostly.
             // We can sort keys if we want, but let's keep it raw.
             return <AstNode key={key} node={value} label={key} depth={depth + 1} />;
          })}
        </div>
      )}
    </div>
  );
};

export default AstNode;