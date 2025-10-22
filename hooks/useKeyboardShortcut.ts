import { useEffect } from 'react';

/**
 * Hook para atalhos de teclado
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean; // Command no Mac
  } = {}
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrl = false, alt = false, shift = false, meta = false } = modifiers;
      
      const isCtrlMatch = ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const isAltMatch = alt ? event.altKey : !event.altKey;
      const isShiftMatch = shift ? event.shiftKey : !event.shiftKey;
      const isMetaMatch = meta ? event.metaKey : true;
      
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        isCtrlMatch &&
        isAltMatch &&
        isShiftMatch &&
        isMetaMatch
      ) {
        event.preventDefault();
        callback();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, callback, modifiers]);
}

