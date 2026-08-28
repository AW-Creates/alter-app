import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Simple, robust, lightweight markdown parser for formatting responses
  const renderFormatted = (text: string) => {
    // Split into paragraphs / lines safely
    const lines = (text || '').split('\n');

    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-[var(--ink)] mt-3 mb-1.5 font-display">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-lg font-bold text-[var(--ink)] mt-4 mb-2 border-b border-[var(--hairline)] pb-1 font-display">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-xl font-extrabold text-[var(--ink)] mt-5 mb-2 font-display">
            {line.replace('# ', '')}
          </h1>
        );
      }

      // Blockquotes / Alerts
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="border-l-4 border-[var(--advisor)] bg-[var(--surface-2)] px-3.5 py-2 my-2 text-[var(--ink-2)] text-xs rounded-r font-sans italic"
          >
            {formatInline(line.replace('> ', ''))}
          </blockquote>
        );
      }

      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletText = line.trim().substring(2);
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-[var(--ink-2)] text-xs leading-relaxed">
            <span className="text-[var(--accent)] font-bold mt-0.5 text-xs">•</span>
            <span className="flex-1">{formatInline(bulletText)}</span>
          </div>
        );
      }

      // Numbered lists
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-[var(--ink-2)] text-xs leading-relaxed">
            <span className="text-[var(--accent)] font-mono font-semibold text-[11px] mt-0.5">
              {numMatch[1]}.
            </span>
            <span className="flex-1">{formatInline(numMatch[2])}</span>
          </div>
        );
      }

      // Code blocks (single line)
      if (line.startsWith('```')) {
        return null;
      }

      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Standard paragraphs
      return (
        <p key={idx} className="my-1.5 text-[var(--ink-2)] text-xs leading-relaxed">
          {formatInline(line)}
        </p>
      );
    });
  };

  // Format inline bold, italic, and code snippets
  const formatInline = (text: string): React.ReactNode => {
    // Code ticks
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 bg-[var(--surface-3)] text-[var(--accent)] font-mono text-[11px] rounded border border-[var(--hairline)]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-[var(--ink)]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-[var(--ink)]">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return <div className={`space-y-0.5 font-sans ${className}`}>{renderFormatted(content)}</div>;
};
