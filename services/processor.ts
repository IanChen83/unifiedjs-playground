import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import { visit } from 'unist-util-visit';
import { PluginItem, ProcessorResult } from '../types';

// Helper to evaluate user code safely-ish
const evaluatePlugin = (code: string) => {
  try {
    // We wrap in a function constructor that returns the user's function.
    // We pass 'visit' as a dependency.
    const factory = new Function('visit', code);
    const plugin = factory(visit);
    
    if (typeof plugin !== 'function') {
      throw new Error('Code must return a plugin function.');
    }
    return plugin;
  } catch (err: any) {
    throw new Error(`Plugin Syntax Error: ${err.message}`);
  }
};

export const runProcessor = async (
  source: string,
  plugins: PluginItem[],
  userRemarkCode: string,
  userRehypeCode: string
): Promise<ProcessorResult> => {
  const result: ProcessorResult = {};

  try {
    const processor = unified();

    // 1. Remark Parse (Mandatory usually, but let's follow the list if possible, 
    // strictly speaking unified needs a parser first)
    // We'll trust the list order but enforce that a parser exists if it's strictly ordered.
    // To keep this robust: We iterate the enabled plugins and apply them.
    // Exception: We intercept ASTs for visualization.

    // To visualize "After Remark User Plugin" and "After Rehype User Plugin", 
    // we need to inject inspector plugins.
    
    // We build a dynamic pipeline.
    for (const p of plugins) {
      if (!p.enabled) continue;

      if (p.id === 'remark-parse') {
        processor.use(remarkParse);
      } else if (p.id === 'remark-gfm') {
        processor.use(remarkGfm);
      } else if (p.id === 'remark-rehype') {
        processor.use(remarkRehype, {allowDangerousHtml: true});
      } else if (p.id === 'rehype-raw') {
        processor.use(rehypeRaw);
      } else if (p.id === 'rehype-stringify') {
        processor.use(rehypeStringify);
      } else if (p.id === 'user-remark-plugin') {
        const userPlugin = evaluatePlugin(userRemarkCode);
        processor.use(userPlugin);
        // Inject inspector immediately after
        processor.use(() => (tree: any) => {
          // Clone deep to avoid mutation issues later in the pipeline affecting the snapshot
          result.remarkAst = JSON.parse(JSON.stringify(tree));
        });
      } else if (p.id === 'user-rehype-plugin') {
        const userPlugin = evaluatePlugin(userRehypeCode);
        processor.use(userPlugin);
        // Inject inspector immediately after
        processor.use(() => (tree: any) => {
           result.rehypeAst = JSON.parse(JSON.stringify(tree));
        });
      }
    }

    const file = await processor.process(source);
    result.result = String(file);

  } catch (error: any) {
    result.error = error.message || 'Unknown error occurred during processing';
    console.error(error);
  }

  return result;
};
