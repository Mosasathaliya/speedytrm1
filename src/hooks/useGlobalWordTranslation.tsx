'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface WordClickData {
  word: string;
  position: { x: number; y: number };
}

export const useGlobalWordTranslation = () => {
  const [activeWord, setActiveWord] = useState<WordClickData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const closePopup = useCallback(() => {
    setActiveWord(null);
  }, []);

  const handleWordClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    
    // Check if the clicked element or its parent has the clickable-word class
    const clickableElement = target.closest('.clickable-word') as HTMLElement;
    if (!clickableElement) return;

    event.preventDefault();
    event.stopPropagation();

    const word = clickableElement.textContent?.trim();
    if (!word) return;

    // Clean the word (remove punctuation, convert to lowercase for processing)
    const cleanWord = word.replace(/[^\w\s]/g, '').toLowerCase().trim();
    if (!cleanWord || cleanWord.length < 2) return;

    // Get click position for popup placement
    const rect = clickableElement.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.bottom
    };

    setActiveWord({
      word: cleanWord,
      position
    });
  }, []);

  const makeWordsClickable = useCallback((element: HTMLElement) => {
    // Skip if already processed
    if (element.hasAttribute('data-words-clickable')) return;
    
    // Mark as processed
    element.setAttribute('data-words-clickable', 'true');

    // Process all text nodes in the element
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip if parent already has clickable-word class
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          // Skip certain elements
          const skipTags = ['SCRIPT', 'STYLE', 'CODE', 'PRE', 'INPUT', 'TEXTAREA', 'BUTTON'];
          if (skipTags.includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
          
          // Skip if already processed
          if (parent.classList.contains('clickable-word')) return NodeFilter.FILTER_REJECT;
          if (parent.closest('.word-translation-popup')) return NodeFilter.FILTER_REJECT;
          
          // Only process if has meaningful text
          const text = node.textContent?.trim();
          if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes: Text[] = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    // Process each text node
    textNodes.forEach((textNode) => {
      const text = textNode.textContent;
      if (!text) return;

      // Regular expression to match English words (including contractions)
      const wordRegex = /\b[a-zA-Z][a-zA-Z']*[a-zA-Z]\b|\b[a-zA-Z]\b/g;
      
      const parts: (string | HTMLElement)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = wordRegex.exec(text)) !== null) {
        // Add text before the word
        if (match.index > lastIndex) {
          parts.push(text.slice(lastIndex, match.index));
        }

        // Create clickable span for the word
        const span = document.createElement('span');
        span.className = 'clickable-word';
        span.textContent = match[0];
        span.style.cursor = 'pointer';
        span.style.borderRadius = '2px';
        span.style.padding = '1px 2px';
        span.style.transition = 'all 0.2s ease';
        
        // Add hover effects
        span.addEventListener('mouseenter', () => {
          span.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
          span.style.textDecoration = 'underline';
        });
        
        span.addEventListener('mouseleave', () => {
          span.style.backgroundColor = 'transparent';
          span.style.textDecoration = 'none';
        });

        parts.push(span);
        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
      }

      // Replace the text node with the new elements
      if (parts.length > 1) {
        const fragment = document.createDocumentFragment();
        parts.forEach(part => {
          if (typeof part === 'string') {
            fragment.appendChild(document.createTextNode(part));
          } else {
            fragment.appendChild(part);
          }
        });

        textNode.parentNode?.replaceChild(fragment, textNode);
      }
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial processing
    makeWordsClickable(container);

    // Set up mutation observer for dynamic content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            makeWordsClickable(element);
            
            // Process child elements
            element.querySelectorAll('*').forEach((child) => {
              makeWordsClickable(child as HTMLElement);
            });
          }
        });
      });
    });

    observer.observe(container, {
      childList: true,
      subtree: true
    });

    // Add click event listener
    container.addEventListener('click', handleWordClick);

    return () => {
      observer.disconnect();
      container.removeEventListener('click', handleWordClick);
    };
  }, [handleWordClick, makeWordsClickable]);

  // Re-process when content changes
  const refreshClickableWords = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Remove existing processing markers
    container.querySelectorAll('[data-words-clickable]').forEach(el => {
      el.removeAttribute('data-words-clickable');
    });

    // Re-process
    makeWordsClickable(container);
  }, [makeWordsClickable]);

  return {
    containerRef,
    activeWord,
    closePopup,
    refreshClickableWords
  };
};
