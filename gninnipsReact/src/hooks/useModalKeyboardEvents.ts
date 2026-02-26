import { useEffect, useRef } from 'react';

interface ModalKeyboardEvents {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  blurOnConfirm?: boolean;
  canConfirm?: boolean;
}

export function useModalKeyboardEvents({
  isOpen,
  onClose,
  onConfirm,
  blurOnConfirm = true,
  canConfirm = true,
}: ModalKeyboardEvents) {
  const callbacksRef = useRef({ onClose, onConfirm });

  useEffect(() => {
    callbacksRef.current = { onClose, onConfirm };
  }, [onClose, onConfirm]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      const { onClose, onConfirm } = callbacksRef.current;
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'Enter':
          if (!canConfirm) {
            return;
          }
          onConfirm();
          if (blurOnConfirm) {
            (document.activeElement as HTMLElement)?.blur();
          }
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, blurOnConfirm, canConfirm]);
}

