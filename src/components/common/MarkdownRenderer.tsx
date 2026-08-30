import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Sanitize empty bolding or raw 4-asterisk dividers
  const sanitizedContent = (content || '')
    .replace(/\*{4,}/g, '---') // convert **** to clean hr dividers
    .replace(/\*\*\s*\*\*/g, ''); // remove empty bold tags

  // Multi-line code block & standard line parser
  const renderFormatted = (text: string) => {
    // Process code blocks properly
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const firstLine = lines[0]?.trim() || '';
        const lang = /^[a-zA-Z0-9_-]+$/.test(firstLine) ? firstLine : '';
        const codeLines = lang ? lines.slice(1) : lines;
        const codeText = codeLines.join('\n');

        return (
          <div key={pIdx} className="my-2.5 rounded-xl bg-[var(--surface-base)] border border-[var(--hairline-strong)] overflow-hidden shadow-xs">
            {lang && (
              <div className="px-3 py-1 bg-[var(--surface-2)] border-b border-[var(--hairline)] text-[10px] font-mono text-[var(--ink-3)] uppercase font-bold">
                {lang}
              </div>
            )}
            <pre className="p-3 text-[11.5px] font-mono text-[var(--ink)] overflow-x-auto leading-relaxed m-0">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Standard line-by-line parsing for non-code text
      const lines = part.split('\n');
      return lines.map((line, idx) => {
        if (line.startsWith('### ')) {
          return (
            <h3 key={`${pIdx}-${idx}`} className="text-sm sm:text-base font-bold text-[var(--ink)] mt-3 mb-1 font-display">
              {formatInline(line.replace('### ', ''))}
            </h3>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={`${pIdx}-${idx}`} className="text-base sm:text-lg font-bold text-[var(--ink)] mt-3.5 mb-1.5 border-b border-[var(--hairline)] pb-1 font-display">
              {formatInline(line.replace('## ', ''))}
            </h2>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h1 key={`${pIdx}-${idx}`} className="text-lg sm:text-xl font-extrabold text-[var(--ink)] mt-4 mb-2 font-display">
              {formatInline(line.replace('# ', ''))}
            </h1>
          );
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote key={`${pIdx}-${idx}`} className="border-l-4 border-[var(--advisor)] bg-[var(--surface-2)] px-3.5 py-2 my-2 text-[var(--ink-2)] text-xs rounded-r italic font-sans">
              {formatInline(line.replace('> ', ''))}
            </blockquote>
          );
        }
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <div key={`${pIdx}-${idx}`} className="flex items-start gap-2 my-1 text-[var(--ink-2)] text-xs leading-relaxed">
              <span className="text-[var(--accent)] font-bold mt-0.5 text-xs">•</span>
              <span className="flex-1">{formatInline(line.trim().substring(2))}</span>
            </div>
          );
        }
        const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          return (
            <div key={`${pIdx}-${idx}`} className="flex items-start gap-2 my-1 text-[var(--ink-2)] text-xs leading-relaxed">
              <span className="text-[var(--accent)] font-mono font-semibold text-[11px] mt-0.5">{numMatch[1]}.</span>
              <span className="flex-1">{formatInline(numMatch[2])}</span>
            </div>
          );
        }
        if (line.trim() === '---' || line.trim() === '***') {
          return <hr key={`${pIdx}-${idx}`} className="my-3 border-t border-[var(--hairline)]" />;
        }
        if (!line.trim()) return <div key={`${pIdx}-${idx}`} className="h-1.5" />;
        return <p key={`${pIdx}-${idx}`} className="my-1 text-[var(--ink-2)] text-xs leading-relaxed">{formatInline(line)}</p>;
      });
    });
  };

  // Robust inline formatter supporting links, bold, italic, code ticks
  const formatInline = (text: string): React.ReactNode => {
    const tokenRegex = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, i) => {
      // Markdown link
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--advisor)] underline hover:brightness-110 font-medium"
          >
            {linkMatch[1]}
          </a>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 bg-[var(--surface-3)] text-[var(--accent)] font-mono text-[11px] rounded border border-[var(--hairline)]">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-[var(--ink)]">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-[var(--ink)]">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return <div className={`space-y-0.5 font-sans ${className}`}>{renderFormatted(sanitizedContent)}</div>;
};
