import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ToggleLeft, ToggleRight, Box, Code, ArrowDown, Settings } from 'lucide-react';
import { PluginItem } from '../types';

interface SortableItemProps {
  plugin: PluginItem;
  onToggle: (id: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ plugin, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: plugin.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getIcon = () => {
      switch(plugin.type) {
          case 'core': return <Box size={16} className="text-sky-400" />;
          case 'adapter': return <Settings size={16} className="text-purple-400" />;
          default: return <Code size={16} className="text-emerald-400" />;
      }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center p-3 mb-2 bg-card border border-border rounded-lg shadow-sm group hover:bg-accent/50 transition-colors ${!plugin.enabled ? 'opacity-60 bg-muted/20' : ''}`}
    >
        <div className="absolute left-1/2 -top-3 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
            <ArrowDown size={12} className="text-muted-foreground" />
        </div>
      <div {...attributes} {...listeners} className="mr-3 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
        <GripVertical size={20} />
      </div>
      
      <div className="mr-3">
        {getIcon()}
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-semibold text-card-foreground">{plugin.name}</h4>
        {plugin.description && <p className="text-xs text-muted-foreground">{plugin.description}</p>}
      </div>

      <button
        onClick={() => onToggle(plugin.id)}
        className={`ml-2 transition-colors ${plugin.enabled ? 'text-primary' : 'text-muted-foreground'}`}
        title={plugin.enabled ? "Disable Plugin" : "Enable Plugin"}
      >
        {plugin.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
      </button>
    </div>
  );
};

interface PluginListProps {
  plugins: PluginItem[];
  setPlugins: React.Dispatch<React.SetStateAction<PluginItem[]>>;
}

const SortablePluginList: React.FC<PluginListProps> = ({ plugins, setPlugins }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPlugins((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const togglePlugin = (id: string) => {
      setPlugins(plugins.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={plugins} strategy={verticalListSortingStrategy}>
        <div className="pb-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Pipeline</div>
            {plugins.map((plugin) => (
            <SortableItem key={plugin.id} plugin={plugin} onToggle={togglePlugin} />
            ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortablePluginList;