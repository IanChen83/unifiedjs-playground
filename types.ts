export interface PluginItem {
  id: string;
  name: string;
  type: 'core' | 'user-remark' | 'user-rehype' | 'adapter';
  enabled: boolean;
  description?: string;
}

export type PipelineStage = 'remark' | 'rehype' | 'result';

export interface ProcessorResult {
  remarkAst?: any;
  rehypeAst?: any;
  result?: string;
  error?: string;
}

export const INITIAL_MARKDOWN = `# Hello Playground

This is a **playground** for [unified](https://unifiedjs.com/).

*   List item 1
*   List item 2

Try modifying the plugins!
`;

export const DEFAULT_REMARK_PLUGIN = `// Available globals: visit
// This plugin runs on the Markdown AST (MDAST)
return function remarkPlaygroundPlugin() {
  return (tree) => {
    visit(tree, 'text', (node) => {
      // Example: Replace "playground" with "WORKBENCH"
      if (node.value.includes('playground')) {
        node.value = node.value.replace(/playground/g, 'WORKBENCH');
      }
    });
  };
};`;

export const DEFAULT_REHYPE_PLUGIN = `// Available globals: visit
// This plugin runs on the HTML AST (HAST)
return function rehypePlaygroundPlugin() {
  return (tree) => {
    // Example: Add target="_blank" to all links
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a') {
        node.properties = node.properties || {};
        node.properties.target = '_blank';
        node.properties.rel = 'noopener noreferrer';
        
        // Add an icon indicator
        node.children.push({
          type: 'text',
          value: ' ↗'
        });
      }
    });
  };
};`;
