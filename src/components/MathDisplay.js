// components/MathDisplay.js
'use client';

import { InlineMath, BlockMath } from 'react-katex';

export function renderQuestionText(text) {
  if (!text) return null;
  
  // Split text by $$ for block math and $ for inline math
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$)/);
  
  return (
    <span className="inline">
      {parts.map((part, index) => {
        // Skip empty parts
        if (!part || !part.trim()) return null;
        
        if (part.startsWith('$$') && part.endsWith('$$')) {
          // Block math - render inline-block to reduce spacing
          const math = part.slice(2, -2).trim();
          return (
            <span key={index} className="block my-1">
              <BlockMath math={math} />
            </span>
          );
        } else if (part.startsWith('$') && part.endsWith('$')) {
          // Inline math
          const math = part.slice(1, -1).trim();
          return <InlineMath key={index} math={math} />;
        } else {
          // Regular text - handle line breaks
          const lines = part.split('\n').filter(line => line.trim());
          if (lines.length === 0) return null;
          
          return (
            <span key={index}>
              {lines.map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line.trim()}
                </span>
              ))}
            </span>
          );
        }
      })}
    </span>
  );
}