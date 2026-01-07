import React, { useState, useEffect } from 'react';
import { PluginItem, ProcessorResult, INITIAL_MARKDOWN, DEFAULT_REMARK_PLUGIN, DEFAULT_REHYPE_PLUGIN } from './types';
import SortablePluginList from './components/SortablePluginList';
import EditorPanel from './components/EditorPanel';
import AstNode from './components/AstTree';
import { runProcessor } from './services/processor';
import { Activity, FileCode, AlertCircle, Sparkles } from 'lucide-react';

// Default plugins configuration
const DEFAULT_PLUGINS: PluginItem[] = [
  { id: 'remark-parse', name: 'remark-parse', type: 'core', enabled: true, description: 'Parses Markdown to MDAST' },
  { id: 'remark-gfm', name: 'remark-gfm', type: 'core', enabled: true, description: 'Adds GitHub Flavored Markdown support' },
  { id: 'user-remark-plugin', name: '<playground-remark-editor>', type: 'user-remark', enabled: true, description: 'Apply custom transformation on MDAST' },
  { id: 'remark-rehype', name: 'remark-rehype', type: 'adapter', enabled: true, description: 'Transforms MDAST to HAST' },
  { id: 'rehype-raw', name: 'rehype-raw', type: 'core', enabled: true, description: 'Parse raw node again' },
  { id: 'user-rehype-plugin', name: '<playground-rehype-editor>', type: 'user-rehype', enabled: true, description: 'Apply custom transformation on HAST' },
  { id: 'rehype-stringify', name: 'rehype-stringify', type: 'core', enabled: true, description: 'Compiles HAST to HTML' },
];

function App() {
  // --- State ---
  const [sourceText, setSourceText] = useState(INITIAL_MARKDOWN);
  const [plugins, setPlugins] = useState<PluginItem[]>(DEFAULT_PLUGINS);
  
  const [remarkCode, setRemarkCode] = useState(DEFAULT_REMARK_PLUGIN);
  const [rehypeCode, setRehypeCode] = useState(DEFAULT_REHYPE_PLUGIN);
  
  const [output, setOutput] = useState<ProcessorResult>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // --- UI Tabs State ---
  const [activeEditorTab, setActiveEditorTab] = useState<'remark' | 'rehype'>('remark');
  const [activeVisualizerTab, setActiveVisualizerTab] = useState<'remark-ast' | 'rehype-ast' | 'html'>('html');

  // --- Processing Effect ---
  // Debounce the processing to avoid UI jank on every keystroke
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsProcessing(true);
      const res = await runProcessor(sourceText, plugins, remarkCode, rehypeCode);
      setOutput(res);
      setIsProcessing(false);
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [sourceText, plugins, remarkCode, rehypeCode]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-background z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="text-primary" size={20} />
          <h1 className="text-lg font-bold tracking-tight">Remark-Rehype Playground</h1>
        </div>
        <div className="text-xs text-muted-foreground">
            Powered by <a href="https://unifiedjs.com/" target="_blank" className="hover:text-primary underline decoration-muted-foreground underline-offset-2">Unified</a>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 grid grid-cols-12 overflow-hidden bg-background">
        
        {/* LEFT PANEL: Pipeline Config & Source Input */}
        <section className="col-span-3 border-r border-border flex flex-col h-full bg-background/50">
          <div className="p-4 border-b border-border bg-background">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center">
                <FileCode size={14} className="mr-1.5" /> Source Markdown
            </h2>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="w-full h-40 p-3 text-sm font-mono bg-muted/30 border border-input rounded-md focus:ring-1 focus:ring-ring focus:outline-none focus:border-input resize-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <SortablePluginList plugins={plugins} setPlugins={setPlugins} />
          </div>
        </section>

        {/* MIDDLE PANEL: Code Editors */}
        <section className="col-span-5 border-r border-border flex flex-col h-full bg-background">
            {/* Tabs */}
            <div className="px-4 pt-3 pb-0 border-b border-border bg-background">
              <div className="flex p-1 bg-muted rounded-lg w-full">
                <button
                    onClick={() => setActiveEditorTab('remark')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeEditorTab === 'remark' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/50'}`}
                >
                    Remark Plugin
                </button>
                <button
                    onClick={() => setActiveEditorTab('rehype')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeEditorTab === 'rehype' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/50'}`}
                >
                    Rehype Plugin
                </button>
              </div>
            </div>

            {/* Editors */}
            <div className="flex-1 overflow-hidden relative">
                 <EditorPanel 
                    active={activeEditorTab === 'remark'}
                    title="remarkPlaygroundPlugin()"
                    code={remarkCode}
                    onChange={setRemarkCode}
                    onReset={() => setRemarkCode(DEFAULT_REMARK_PLUGIN)}
                 />
                 <EditorPanel 
                    active={activeEditorTab === 'rehype'}
                    title="rehypePlaygroundPlugin()"
                    code={rehypeCode}
                    onChange={setRehypeCode}
                    onReset={() => setRehypeCode(DEFAULT_REHYPE_PLUGIN)}
                 />
            </div>
        </section>

        {/* RIGHT PANEL: Visualizers */}
        <section className="col-span-4 bg-background flex flex-col h-full">
             {/* Visualizer Tabs */}
             <div className="px-4 pt-3 pb-0 border-b border-border bg-background">
                 <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveVisualizerTab('remark-ast')}
                        className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${activeVisualizerTab === 'remark-ast' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Remark AST
                    </button>
                    <button
                        onClick={() => setActiveVisualizerTab('rehype-ast')}
                        className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${activeVisualizerTab === 'rehype-ast' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Rehype AST
                    </button>
                    <button
                        onClick={() => setActiveVisualizerTab('html')}
                        className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${activeVisualizerTab === 'html' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Output
                    </button>
                 </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-background relative">
                {isProcessing && (
                    <div className="absolute top-4 right-4 z-10">
                        <span className="flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                    </div>
                )}

                {output.error ? (
                     <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-start">
                        <AlertCircle className="mr-2 mt-0.5 shrink-0" size={18} />
                        <div>
                            <h3 className="font-bold text-sm mb-1">Processing Error</h3>
                            <pre className="text-xs whitespace-pre-wrap font-mono opacity-90">{output.error}</pre>
                        </div>
                     </div>
                ) : (
                    <>
                        {activeVisualizerTab === 'remark-ast' && (
                            output.remarkAst ? (
                                <div className="font-mono text-sm">
                                    <AstNode node={output.remarkAst} label="root" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm italic">
                                  <Sparkles className="mb-2 opacity-20" size={48} />
                                  No Remark AST available
                                </div>
                            )
                        )}

                        {activeVisualizerTab === 'rehype-ast' && (
                             output.rehypeAst ? (
                                <div className="font-mono text-sm">
                                    <AstNode node={output.rehypeAst} label="root" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm italic">
                                  <Sparkles className="mb-2 opacity-20" size={48} />
                                  No Rehype AST available
                                </div>
                            )
                        )}

                        {activeVisualizerTab === 'html' && (
                            <div className="h-full flex flex-col gap-4">
                                <div>
                                    <h3 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Preview</h3>
                                    <div 
                                        className="prose prose-sm prose-invert max-w-none p-4 bg-muted/30 border border-border rounded-lg"
                                        dangerouslySetInnerHTML={{ __html: output.result || '' }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">HTML Source</h3>
                                    <pre className="p-3 bg-muted/50 text-muted-foreground border border-border rounded-lg text-xs overflow-x-auto font-mono leading-relaxed">
                                        {output.result}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
      </main>
    </div>
  );
}

export default App;