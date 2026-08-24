import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Simple, robust, lightweight markdown parser for formatting responses
  const renderFormatted = (text: string) => {
    // Split into paragraphs / lines
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg font-bold text-slate-100 mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl font-bold text-slate-100 mt-5 mb-2 border-b border-slate-800 pb-1">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-2xl font-extrabold text-slate-100 mt-6 mb-3">
            {line.replace('# ', '')}
          </h1>
        );
      }

      // Blockquotes / Alerts
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="border-l-4 border-sky-500 bg-sky-500/10 px-4 py-2 my-2 text-sky-200 text-sm rounded-r"
          >
            {formatInline(line.replace('> ', ''))}
          </blockquote>
        );
      }

      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletText = line.trim().substring(2);
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-slate-300">
            <span className="text-sky-400 font-bold mt-1 text-xs">•</span>
            <span className="flex-1">{formatInline(bulletText)}</span>
          </div>
        );
      }

      // Numbered lists
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-slate-300">
            <span className="text-sky-400 font-semibold text-xs min-w-5">{numMatch[1]}.</span>
            <span className="flex-1">{formatInline(numMatch[2])}</span>
          </div>
        );
      }

      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Regular paragraph
      return (
        <p key={idx} className="my-1.5 text-slate-300 leading-relaxed">
          {formatInline(line)}
        </p>
      );
    });
  };

  const formatInline = (text: string) => {
    // Bold with **text**
    const parts: (string | React.ReactNode)[] = [];
    let current = text;
    let keyIdx = 0;

    // Replace bold **...**
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;

    while ((match = boldRegex.exec(current)) !== null) {
      if (match.index > lastIndex) {
        parts.push(current.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={`b-${keyIdx++}`} className="font-semibold text-slate-100">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < current.length) {
      parts.push(current.substring(lastIndex));
    }

    return parts.map((part, i) => {
      if (typeof part === 'string') {
        // inline code `code`
        const codeParts = part.split(/(`[^`]+`)/);
        return codeParts.map((sub, j) => {
          if (sub.startsWith('`') && sub.endsWith('`')) {
            return (
              <code
                key={`c-${i}-${j}`}
                className="bg-slate-800 text-sky-300 px-1.5 py-0.5 rounded text-xs font-mono"
              >
                {sub.slice(1, -1)}
              </code>
            );
          }
          return sub;
        });
      }
      return part;
    });
  };

  return <div className={`text-sm md:text-base ${className}`}>{renderFormatted(content)}</div>;
};
