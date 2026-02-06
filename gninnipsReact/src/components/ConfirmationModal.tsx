import styles from './ConfirmationModal.module.css';
import { useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
}
export default function ConfirmationInputModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon = '⚠️',
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        onConfirm();
        (document.activeElement as HTMLElement)?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  if (!isOpen) return null;

  const messageLines =
    typeof message === 'string'
      ? message.split('\\n').filter((line) => line.trim() !== '')
      : Array.isArray(message)
        ? message
        : [];

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {icon && <div className={styles.modalIcon}>{icon}</div>}
        <h3 className={styles.modalTitle}>{title}</h3>
        <div className={styles.messageContainer}>
          {messageLines.map((line, index) => (
            <p key={index} className={styles.messageLine}>
              {line}
            </p>
          ))}
        </div>

        <div className={styles.buttonContainer}>
          <button
            onClick={onClose}
            className={styles.cancelButton}
            type="button"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={styles.confirmButton}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

