import modalStyles from './modalStyles.module.css';
import styles from './TrainingBlockModal.module.css';
import type { TrainingBlock, JumpsBlock, NormalBlock } from '../types';
import { useModalKeyboardEvents } from '../hooks/useModalKeyboardEvents';
import { useState, useEffect } from 'react';

interface TrainingBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: TrainingBlock, position: number) => void;
  mode: 'insert' | 'edit';
  blockType: number;
  buttonImage?: HTMLImageElement | null;
  optional?: boolean;
  initialBlock?: TrainingBlock; // para que sirve?
  initialPosition?: number; // para que sirve?
  totalBlocks?: number;
}

const HR_LOWER_LIMIT = 50;
const HR_UPPER_LIMIT = 90;
const RPM_LOWER_LIMIT = 60;
const RPM_UPPER_LIMIT = 120;
const DIST_LOWER_LIMIT = 0;
const DIST_UPPER_LIMIT = 1000;

const HR_LIMIT_ERROR_MESSAGE = `Ingrese un valor entre ${HR_LOWER_LIMIT}%-${HR_UPPER_LIMIT}%`;
const RPM_LIMIT_ERROR_MESSAGE = `Ingrese un valor entre ${RPM_LOWER_LIMIT}-${RPM_UPPER_LIMIT} RPM`;
const DIST_LIMIT_ERROR_MESSAGE = `Ingrese un valor entre ${DIST_LOWER_LIMIT}-${DIST_UPPER_LIMIT} km`;
const INVALID_TIME_FORMAT_ERROR_MESSAGE = `Ingrese un valor en formato mm:ss válido`;
const INVALID_TIME_ERROR_MESSAGE = `Ingrese un tiempo mayor a cero`;

function timeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  if (parts.length !== 2) {
    return NaN;
  }
  const [mins, secs] = parts;
  if (isNaN(mins) || isNaN(secs) || secs < 0 || secs > 59) {
    return NaN;
  }
  return mins * 60 + secs;
}

function isDistanceValid(distanceStr: string): boolean {
  if (distanceStr.includes(':')) {
    return false;
  }
  const distance = parseFloat(distanceStr);
  if (
    isNaN(distance) ||
    distance <= DIST_LOWER_LIMIT ||
    distance >= DIST_UPPER_LIMIT
  ) {
    return false;
  }
  return true;
}

function secondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function TrainingBlockModal({
  isOpen,
  onClose,
  onSave,
  mode,
  blockType,
  buttonImage,
  optional = false,
  initialBlock,
  initialPosition,
  totalBlocks = 0,
}: TrainingBlockModalProps) {
  const isJump = [5, 7, 0].includes(blockType);

  const [position, setPosition] = useState<number>(initialPosition || 1);
  const [hr, setHr] = useState('');
  const [metric, setMetric] = useState<'distance' | 'time'>('time');
  const [rpm, setRpm] = useState('');
  const [timeDistValue, setTimeDistValue] = useState('');
  const [rpmUp, setRpmUp] = useState('');
  const [rpmDown, setRpmDown] = useState('');
  const [jumps, setJumps] = useState('');
  const [timeDistValueUp, setTimeDistValueUp] = useState('');
  const [timeDistValueDown, setTimeDistValueDown] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && initialBlock) {
      setHr(initialBlock.hr?.toString() || '');
      setMetric(initialBlock.metric);
      if (isJump) {
        const jumpBlock = initialBlock as JumpsBlock;
        setRpmUp(jumpBlock.rpmUp?.toString() || '');
        setRpmDown(jumpBlock.rpmDown?.toString() || '');
        setJumps(jumpBlock.jumps?.toString() || '');
        if (jumpBlock.metric === 'distance') {
          setTimeDistValueUp(jumpBlock.distanceUp?.toString() || '');
          setTimeDistValueDown(jumpBlock.distanceDown?.toString() || '');
        } else {
          setTimeDistValueUp(
            jumpBlock.timeUp ? secondsToTime(jumpBlock.timeUp) : '',
          );
          setTimeDistValueDown(
            jumpBlock.timeDown ? secondsToTime(jumpBlock.timeDown) : '',
          );
        }
      } else {
        const normalBlock = initialBlock as NormalBlock;
        setRpm(normalBlock.rpm?.toString() || '');
        if (normalBlock.metric === 'distance') {
          setTimeDistValue(normalBlock.distance?.toString() || '');
        } else {
          setTimeDistValue(
            normalBlock.time ? secondsToTime(normalBlock.time) : '',
          );
        }
      }
    }
  }, [mode, initialBlock, isJump]);

  useEffect(() => {
    if (initialPosition !== undefined) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  const maxPos = mode === 'insert' ? totalBlocks + 1 : totalBlocks;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!optional || hr) {
      const hrNum = parseInt(hr);
      if (isNaN(hrNum) || hrNum < HR_LOWER_LIMIT || hrNum > HR_UPPER_LIMIT) {
        newErrors.hr = HR_LIMIT_ERROR_MESSAGE;
      }
    }
    if (isJump) {
      if (!optional || rpmUp) {
        const rpmUpNum = parseInt(rpmUp);
        if (
          isNaN(rpmUpNum) ||
          rpmUpNum < RPM_LOWER_LIMIT ||
          rpmUpNum > RPM_UPPER_LIMIT
        ) {
          newErrors.rpmUp = RPM_LIMIT_ERROR_MESSAGE;
        }
      }
      if (!optional || rpmDown) {
        const rpmDownNum = parseInt(rpmDown);
        if (
          isNaN(rpmDownNum) ||
          rpmDownNum < RPM_LOWER_LIMIT ||
          rpmDownNum > RPM_UPPER_LIMIT
        ) {
          newErrors.rpmDown = RPM_LIMIT_ERROR_MESSAGE;
        }
      }
      if (!optional || jumps) {
        const jumpsNum = parseInt(jumps);
        if (isNaN(jumpsNum) || jumpsNum < 1) {
          newErrors.jumps = 'Ingrese un valor mayor a 1';
        }
      }
      if (!optional || timeDistValueUp) {
        if (metric === 'distance') {
          if (!isDistanceValid(timeDistValueUp)) {
            newErrors.timeDistValueUp = DIST_LIMIT_ERROR_MESSAGE;
          }
        } else {
          const timeValueNum = timeToSeconds(timeDistValueUp);
          if (isNaN(timeValueNum)) {
            newErrors.timeDistValueUp = INVALID_TIME_FORMAT_ERROR_MESSAGE;
          } else if (timeValueNum <= 0) {
            newErrors.timeDistValueUp = INVALID_TIME_ERROR_MESSAGE;
          }
        }
      }
      if (!optional || timeDistValueDown) {
        if (metric === 'distance') {
          if (!isDistanceValid(timeDistValueDown)) {
            newErrors.timeDistValueDown = DIST_LIMIT_ERROR_MESSAGE;
          }
        } else {
          const timeValueNum = timeToSeconds(timeDistValueDown);
          if (isNaN(timeValueNum)) {
            newErrors.timeDistValueDown = INVALID_TIME_FORMAT_ERROR_MESSAGE;
          } else if (timeValueNum <= 0) {
            newErrors.timeDistValueDown = INVALID_TIME_ERROR_MESSAGE;
          }
        }
      }
    } else {
      if (!optional || rpm) {
        const rpmNum = parseInt(rpm);
        if (
          isNaN(rpmNum) ||
          rpmNum < RPM_LOWER_LIMIT ||
          rpmNum > RPM_UPPER_LIMIT
        ) {
          newErrors.rpm = RPM_LIMIT_ERROR_MESSAGE;
        }
      }
      if (!optional || timeDistValue) {
        if (metric === 'distance') {
          if (!isDistanceValid(timeDistValue)) {
            newErrors.timeDistValue = DIST_LIMIT_ERROR_MESSAGE;
          }
        } else {
          const timeValueNum = timeToSeconds(timeDistValue);
          if (isNaN(timeValueNum)) {
            newErrors.timeDistValue = INVALID_TIME_FORMAT_ERROR_MESSAGE;
          } else if (timeValueNum <= 0) {
            newErrors.timeDistValue = INVALID_TIME_ERROR_MESSAGE;
          }
        }
      }
      if (position < 1 || position > maxPos) {
        newErrors.position = `El # de bloque debe estar entre 1 y ${maxPos}`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }
    const blockId =
      mode === 'edit' && initialBlock ? initialBlock.id : Date.now().toString();

    let block: TrainingBlock;
    if (isJump) {
      const base: Omit<JumpsBlock, 'id'> = {
        kind: 'jump',
        type: blockType,
        hr: parseInt(hr),
        metric,
        rpmUp: parseInt(rpmUp),
        rpmDown: parseInt(rpmDown),
        jumps: parseInt(jumps),
      };
      if (metric === 'distance') {
        base.distanceUp = parseFloat(timeDistValueUp);
        base.distanceDown = parseFloat(timeDistValueDown);
      } else {
        base.timeUp = timeToSeconds(timeDistValueUp);
        base.timeDown = timeToSeconds(timeDistValueDown);
      }
      block = { ...base, id: blockId };
    } else {
      const base: Omit<NormalBlock, 'id'> = {
        kind: 'normal',
        type: blockType,
        hr: parseInt(hr),
        metric,
        rpm: parseInt(rpm),
      };
      if (metric === 'distance') {
        base.distance = parseFloat(timeDistValue);
      } else {
        base.time = timeToSeconds(timeDistValue);
      }
      block = { ...base, id: blockId };
    }

    onSave(block, position);
    onClose();
  };

  useModalKeyboardEvents({
    isOpen,
    onClose,
    onConfirm: handleSave,
  });

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={modalStyles.overlay} onClick={handleOverlayClick}>
      <div className={`${modalStyles.modalContainer} ${styles.modalContainer}`}>
        <h2>Posición {blockType}</h2>

        <div className={styles.rpmRow}>
          {isJump ? (
            <>
              <div className={styles.fieldGroup}>
                <label>RPM de pie</label>
                <input
                  autoFocus
                  type="number"
                  value={rpmUp}
                  onChange={(e) => setRpmUp(e.target.value)}
                  min={RPM_LOWER_LIMIT}
                  max={RPM_UPPER_LIMIT}
                  placeholder={`${RPM_LOWER_LIMIT}-${RPM_UPPER_LIMIT}`}
                />
                <span className={styles.error}>{errors.rpmUp || ''}</span>
              </div>
              <div className={styles.fieldGroup}>
                <label>RPM sentado</label>
                <input
                  type="number"
                  value={rpmDown}
                  onChange={(e) => setRpmDown(e.target.value)}
                  min={RPM_LOWER_LIMIT}
                  max={RPM_UPPER_LIMIT}
                  placeholder={`${RPM_LOWER_LIMIT}-${RPM_UPPER_LIMIT}`}
                />
                <span className={styles.error}>{errors.rpmDown || ''}</span>
              </div>
            </>
          ) : (
            <div className={styles.fieldGroup}>
              <label>RPM</label>
              <input
                autoFocus
                type="number"
                value={rpm}
                onChange={(e) => setRpm(e.target.value)}
                min={RPM_LOWER_LIMIT}
                max={RPM_UPPER_LIMIT}
                placeholder={`${RPM_LOWER_LIMIT}-${RPM_UPPER_LIMIT}`}
              />
              <span className={styles.error}>{errors.rpm || ''}</span>
            </div>
          )}
        </div>

        <div className={styles.middleRow}>
          <div className={styles.leftColumn}>
            <div className={styles.fieldGroup}>
              <label>HR%</label>
              <input
                type="number"
                value={hr}
                onChange={(e) => setHr(e.target.value)}
                placeholder={`${HR_LOWER_LIMIT}-${HR_UPPER_LIMIT}`}
              />
              <span className={styles.error}>{errors.hr || ''}</span>
            </div>
          </div>

          <div className={styles.centerColumn}>
            {buttonImage && (
              <div className={styles.imageWrapper}>
                <img
                  src={buttonImage.src}
                  alt={`Botón ${blockType}`}
                  className={styles.buttonImage}
                />
              </div>
            )}
          </div>

          <div className={styles.rightColumn}>
            {isJump && (
              <div className={styles.fieldGroup}>
                <label>Nº de saltos</label>
                <input
                  type="number"
                  value={jumps}
                  onChange={(e) => setJumps(e.target.value)}
                  placeholder="#"
                />
                <span className={styles.error}>{errors.jumps || ''}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.toggleWrapper}>
          <span className={styles.toggleLabel}>Unidad:</span>
          <div className={styles.toggleSwitch}>
            <span
              role="button"
              tabIndex={0}
              className={`${styles.toggleOption} ${metric === 'distance' ? styles.active : ''}`}
              onClick={() => setMetric('distance')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setMetric('distance');
                }
              }}
              aria-pressed={metric === 'distance'}
            >
              Distancia (km)
            </span>
            <span
              role="button"
              tabIndex={0}
              className={`${styles.toggleOption} ${metric === 'time' ? styles.active : ''}`}
              onClick={() => setMetric('time')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setMetric('time');
                }
              }}
              aria-pressed={metric === 'time'}
            >
              Tiempo (mm:ss)
            </span>
            <div
              className={styles.toggleIndicator}
              style={{ left: metric === 'distance' ? '0%' : '50%' }}
            />
          </div>
        </div>

        <div className={styles.bottomRow}>
          {isJump ? (
            <>
              <div className={styles.fieldGroup}>
                <label>
                  {metric === 'distance' ? 'Distancia de pie' : 'Tiempo de pie'}
                </label>
                <input
                  value={timeDistValueUp}
                  onChange={(e) => setTimeDistValueUp(e.target.value)}
                  placeholder={metric === 'distance' ? 'km' : 'mm:ss'}
                />
                <span className={styles.error}>
                  {errors.timeDistValueUp || ''}
                </span>
              </div>
              <div className={styles.fieldGroup}>
                <label>
                  {metric === 'distance'
                    ? 'Distancia sentado'
                    : 'Tiempo sentado'}
                </label>
                <input
                  value={timeDistValueDown}
                  onChange={(e) => setTimeDistValueDown(e.target.value)}
                  placeholder={metric === 'distance' ? 'km' : 'mm:ss'}
                />
                <span className={styles.error}>
                  {errors.timeDistValueDown || ''}
                </span>
              </div>
            </>
          ) : (
            <div className={styles.fieldGroup}>
              <label>{metric === 'distance' ? 'Distancia' : 'Tiempo'}</label>
              <input
                value={timeDistValue}
                onChange={(e) => setTimeDistValue(e.target.value)}
                placeholder={metric === 'distance' ? 'km' : 'mm:ss'}
              />
              <span className={styles.error}>{errors.timeDistValue || ''}</span>
            </div>
          )}
        </div>

        <div className={styles.blockOrderRow}>
          <div className={styles.fieldGroup}>
            <label># Bloque:</label>
            <input
              type="number"
              value={position}
              onChange={(e) => setPosition(parseInt(e.target.value) || 1)}
              min={1}
              max={maxPos}
            />
            <span className={styles.error}>{errors.position || ''}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancel}>
            Cancelar
          </button>
          <button onClick={handleSave} className={styles.insert}>
            Insertar
          </button>
        </div>
      </div>
    </div>
  );
}

