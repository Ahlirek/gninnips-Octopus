import { useEffect } from 'react';

export interface ShortcutConfig {
  [key: string]: {
    handler: () => void;
    options?: ShortcutConfigOptions;
  };
}

interface ShortcutConfigOptions {
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShorcuts(
  shortcuts: ShortcutConfig,
  disabled = false,
) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTyping =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.hasAttribute('contenteditable');
      if (isTyping) return;

      const key = e.key.toLowerCase();
      const shortcut = shortcuts[key];
      if (shortcut) {
        const opts = shortcut.options || ({} as ShortcutConfigOptions);

        const matchCtrl = opts.ctrl ?? false;
        const matchAlt = opts.alt ?? false;
        const matchShift = opts.shift ?? false;
        const matchMeta = opts.meta ?? false;

        if (e.ctrlKey !== matchCtrl) return;
        if (e.altKey !== matchAlt) return;
        if (e.shiftKey !== matchShift) return;
        if (e.metaKey !== matchMeta) return;

        if (opts.preventDefault !== false) {
          e.preventDefault();
        }
        shortcut.handler();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, disabled]);
}

