import { useEffect, useRef } from 'react';
import katex from 'katex';
// import renderMathInElement from 'katex/dist/contrib/auto-render'; // No longer using auto-render for clickability
import 'katex/dist/katex.min.css'; // CSS ni ham shu yerda import qilamiz

const MathText = ({ text, onMathClick, contextType, contextId }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = ''; // Clear previous content

      // Regex to find both inline ($...$) and display ($$...$$) math
      // It's important to capture the delimiters as well to reconstruct the original string
      const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g;
      // const mathRegex = /\$\$[^\$]*\$\$/g;
      let lastIndex = 0;
      let match;

      while ((match = mathRegex.exec(text)) !== null) {
        const mathString = match[0]; // e.g., "$a^2$" or "$$b^2$$"
        const startIndex = match.index;
        const endIndex = mathRegex.lastIndex;

        // Add preceding plain text
        if (startIndex > lastIndex) {
          const plainText = text.substring(lastIndex, startIndex);
          const textNode = document.createTextNode(plainText);
          containerRef.current.appendChild(textNode);
        }

        // Add clickable math element
        const mathSpan = document.createElement('span');
        if (onMathClick) {
          mathSpan.className = 'math-clickable'; // Add a class for styling
        }
        // mathSpan.style.cursor = 'pointer'; // Indicate clickability
        // mathSpan.style.borderRadius = '5px';
        // // mathSpan.style.cursorpointer'; // Indicate clickability
        // // mathSpan.style.borderBottom = '1px dashed #007bff'; // Visual cue for editability
        // mathSpan.style.background = '#a4a4a4'
        // mathSpan.style.padding = '4px 2px'; // Small padding for better click area

        try {
          const displayMode = mathString.startsWith('$$') && mathString.endsWith('$$');
          // Extract the formula without delimiters
          const formula = mathString.substring(displayMode ? 2 : 1, mathString.length - (displayMode ? 2 : 1));
          katex.render(formula, mathSpan, {
            displayMode: displayMode,
            throwOnError: false,
          });

          mathSpan.onclick = (e) => {
            e.stopPropagation(); // Prevent parent clicks if any
            if (onMathClick) {
              onMathClick(mathString, startIndex, endIndex, contextType, contextId);
            }
          };
          containerRef.current.appendChild(mathSpan);
        } catch (error) {
          console.error("KaTeX render xatosi:", mathString, error);
          const errorSpan = document.createElement('span');
          errorSpan.textContent = mathString; // Show original string on error
          errorSpan.style.color = 'red';
          containerRef.current.appendChild(errorSpan);
        }
        lastIndex = endIndex;
      }

      // Add any remaining plain text
      if (lastIndex < text.length) {
        const plainText = text.substring(lastIndex);
        const textNode = document.createTextNode(plainText);
        containerRef.current.appendChild(textNode);
      }
    }
  }, [text, onMathClick, contextType, contextId]); // Re-run effect if these props change

  return (
    <div 
      ref={containerRef} className='preview_math_text'
      style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
    >
    </div>
  );
};

export default MathText;
