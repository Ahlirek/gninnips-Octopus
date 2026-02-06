import styles from './TitleInputModal.module.css';
import { useState, useRef, useEffect } from 'react';

interface TitleInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  initialTitle?: string;
}
export default function TitleInputModal({
  isOpen,
  onClose,
  onSave,
  initialTitle = '',
}: TitleInputModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add(styles.modalOpen);
    } else {
      document.body.classList.remove(styles.modalOpen);
    }

    return () => {
      document.body.classList.remove(styles.modalOpen);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && title.trim()) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSubmit = () => {
    if (title.trim()) {
      onSave(title.trim());
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      data-testid="modal-overlay"
    >
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <h3 className={styles.modalTitle}>Enter Image Title</h3>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Inserte el titulo del entrenamiento..."
          className={styles.input}
        />
        <div className={styles.buttonContainer}>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className={styles.saveButton}
            type="button"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className={styles.cancelButton}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

