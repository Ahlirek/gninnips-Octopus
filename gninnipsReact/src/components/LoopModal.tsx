import modalStyles from './modalStyles.module.css';
import styles from './LoopModal.module.css';
import { useState } from 'react';
import { useModalKeyboardEvents } from '../hooks/useModalKeyboardEvents';
import type { Loop } from '../types';

interface LoopModalProps {
  onClose: () => void;
  onSave: (loop: Omit<Loop, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  mode: 'create' | 'edit';
  initialLoop?: Loop;
  cursor: number;
  totalBlocks: number;
  existingLoops: Loop[];
}

export default function LoopModal({
  onClose,
  onSave,
  onDelete,
  mode,
  initialLoop,
  cursor,
  totalBlocks,
  existingLoops,
}: LoopModalProps) {
  const [startPosition, setStartPosition] = useState(() => {
    if (mode === 'edit' && initialLoop) {
      return initialLoop.start + 1;
    }
    return cursor + 1;
  });
  const [endPosition, setEndPosition] = useState(() => {
    if (mode === 'edit' && initialLoop) {
      return initialLoop.end + 1;
    }
    return cursor + 1;
  });
  const [repetitions, setRepetitions] = useState(() => {
    if (mode === 'edit' && initialLoop) {
      return initialLoop.repetitions;
    }
    return 2;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const startIndex = startPosition - 1;
  const endIndex = endPosition - 1;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (startPosition > endPosition) {
      newErrors.range = 'El fin del ciclo debe ser mayor al inicio.';
    }
    if (!startPosition || startPosition < 1 || startPosition > totalBlocks) {
      newErrors.start = `El inicio del ciclo debe estar entre 1 and ${totalBlocks}`;
    }
    if (!endPosition || endPosition < 1 || endPosition > totalBlocks) {
      newErrors.end = `El fin del ciclo debe estar entre 1 and ${totalBlocks}`;
    }
    if (!repetitions || repetitions < 2 || repetitions > 9) {
      newErrors.repetitions = 'Ingerse un número entre 2 y 9';
    }
    for (const loop of existingLoops) {
      if (mode === 'edit' && loop.id === initialLoop?.id) {
        continue;
      }

      const existingStart = loop.start;
      const existingEnd = loop.end;

      if (startIndex === existingStart && endIndex === existingEnd) {
        newErrors.overlap = 'Ya existe un ciclo con el mismo rango.';
        break;
      }

      if (startIndex <= existingEnd && endIndex >= existingStart) {
        const isNested =
          (startIndex <= existingStart && endIndex >= existingEnd) ||
          (existingStart <= startIndex && existingEnd >= endIndex);

        if (!isNested) {
          newErrors.overlap =
            'El ciclo no puede superponerse parcialmente con otro ciclo.';
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }
    console.log(startIndex, endIndex);
    onSave({
      id: initialLoop?.id,
      start: startIndex,
      end: endIndex,
      repetitions,
      parentId: initialLoop?.parentId ?? null,
    });
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && initialLoop) {
      onDelete(initialLoop.id);
      onClose();
    }
  };

  useModalKeyboardEvents({ isOpen: true, onClose, onConfirm: handleSave });

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={modalStyles.overlay} onClick={handleOverlayClick}>
      <div className={`${modalStyles.modalContainer} ${styles.modalContainer}`}>
        <h2>{mode === 'create' ? 'Crear Ciclo' : 'Editar Ciclo'}</h2>

        <div className={styles.fieldGroup}>
          <label>Inicio Ciclo</label>
          <input
            type="number"
            value={startPosition}
            onChange={(e) => setStartPosition(parseInt(e.target.value))}
            min={1}
            max={endPosition}
          />
          {errors.start && <span className={styles.error}>{errors.start}</span>}
        </div>

        <div className={styles.preview}>
          <p>
            {endPosition - startPosition + 1} bloque
            {endPosition - startPosition > 0 ? 's' : ''}
          </p>
          {errors.range && <span className={styles.error}>{errors.range}</span>}
        </div>
        <div className={styles.fieldGroup}>
          <label>Fin Ciclo</label>
          <input
            type="number"
            value={endPosition}
            onChange={(e) => setEndPosition(parseInt(e.target.value))}
            min={startPosition}
            max={totalBlocks}
          />
          {errors.end && <span className={styles.error}>{errors.end}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label>Repeticiones</label>
          <input
            type="number"
            min={2}
            max={9}
            value={repetitions}
            onChange={(e) => setRepetitions(parseInt(e.target.value))}
          />
          {errors.repetitions && (
            <span className={styles.error}>{errors.repetitions}</span>
          )}
        </div>

        {errors.overlap && (
          <span className={styles.error}>{errors.overlap}</span>
        )}
        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancel}>
            Cancel
          </button>
          {mode === 'edit' && (
            <button onClick={handleDelete} className={styles.delete}>
              Borrar Ciclo
            </button>
          )}
          <button onClick={handleSave} className={styles.save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

