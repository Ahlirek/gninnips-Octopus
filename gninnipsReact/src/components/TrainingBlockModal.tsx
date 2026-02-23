import modalStyles from './modalStyles.module.css';
import styles from './TrainingBlockModal.module.css';
import type { TrainingBlock } from '../types';
import { useModalKeyboardEvents } from '../hooks/useModalKeyboardEvents';
import { useState } from 'react';

interface TrainingBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (block: TrainingBlock) => void;
  buttonNumber: number;
  buttonImage?: HTMLImageElement | null;
  optional?: boolean;
}

const HR_LOWER_LIMIT = 50;
const HR_UPPER_LIMIT = 90;
const RPM_LOWER_LIMIT = 60;
const RPM_UPPER_LIMIT = 120;
const DIST_LOWER_LIMIT = 0;
const DIST_UPPER_LIMIT = 1000;

const HR_LIMIT_ERROR_MESSAGE = `Ingrese un valor entre ${HR_LOWER_LIMIT}%-${HR_UPPER_LIMIT}%`;
const MAKE_RPM_LIMIT_ERROR_MESSAGE = `Ingrese un valor entre ${RPM_LOWER_LIMIT}-${RPM_UPPER_LIMIT} RPM`;
const MAKE_DIST_LIMIT_ERROR_MESSAGE = `Ingrese un valor entre ${DIST_LOWER_LIMIT}-${DIST_UPPER_LIMIT} km`;
const MAKE_INVALID_TIME_ERROR_MESSAGE = `Ingrese un valor en formato mm:ss válido`;

function timeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  if (parts.length !== 2) {
    return NaN;
  }
  const [mins, secs] = parts;
  if (isNaN(mins) || isNaN(secs) || secs < 0 || secs > 59) return NaN;
  return mins * 60 + secs;
}

//INFO: USE IT TO PREFILL DATA WHEN UPDATING VALUES
function secondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function TrainingBlockModal({
  isOpen,
  onClose,
  onInsert,
  buttonNumber,
  buttonImage,
  optional = false,
}: TrainingBlockModalProps) {
  const isJump = [5, 7, 10].includes(buttonNumber);

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
          newErrors.rpmUp = MAKE_RPM_LIMIT_ERROR_MESSAGE;
        }
      }
      if (!optional || rpmDown) {
        const rpmDownNum = parseInt(rpmDown);
        if (
          isNaN(rpmDownNum) ||
          rpmDownNum < RPM_LOWER_LIMIT ||
          rpmDownNum > RPM_UPPER_LIMIT
        ) {
          newErrors.rpmDown = MAKE_RPM_LIMIT_ERROR_MESSAGE;
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
          const distValueNum = parseFloat(timeDistValueUp);
          if (
            isNaN(distValueNum) ||
            distValueNum <= DIST_LOWER_LIMIT ||
            distValueNum > DIST_UPPER_LIMIT
          ) {
            newErrors.timeDistValueUp = MAKE_DIST_LIMIT_ERROR_MESSAGE;
          }
        } else {
          const timeValueNum = timeToSeconds(timeDistValueUp);
          if (isNaN(timeValueNum) || timeValueNum < 0) {
            newErrors.timeDistValueUp = MAKE_INVALID_TIME_ERROR_MESSAGE;
          }
        }
      }
      if (!optional || timeDistValueDown) {
        if (metric === 'distance') {
          const distValueNum = parseFloat(timeDistValueDown);
          if (
            isNaN(distValueNum) ||
            distValueNum <= DIST_LOWER_LIMIT ||
            distValueNum > DIST_UPPER_LIMIT
          ) {
            newErrors.timeDistValueDown = MAKE_DIST_LIMIT_ERROR_MESSAGE;
          }
        } else {
          const timeValueNum = timeToSeconds(timeDistValueDown);
          if (isNaN(timeValueNum) || timeValueNum < 0) {
            newErrors.timeDistValueDown = MAKE_INVALID_TIME_ERROR_MESSAGE;
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
          newErrors.rpm = MAKE_RPM_LIMIT_ERROR_MESSAGE;
        }
      }
      if (!optional || timeDistValue) {
        if (metric === 'distance') {
          const distValueNum = parseFloat(timeDistValue);
          if (
            isNaN(distValueNum) ||
            distValueNum <= DIST_LOWER_LIMIT ||
            distValueNum > DIST_UPPER_LIMIT
          ) {
            newErrors.timeDistValue = MAKE_DIST_LIMIT_ERROR_MESSAGE;
          }
        } else {
          const timeValueNum = timeToSeconds(timeDistValue);
          if (isNaN(timeValueNum) || timeValueNum < 0) {
            newErrors.timeDistValue = MAKE_INVALID_TIME_ERROR_MESSAGE;
          }
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleInsert = () => {
    if (!validate()) return;

    let block: TrainingBlock;
    if (isJump) {
      block = {
        id: Date.now().toString(),
        type: buttonNumber,
        hr: parseInt(hr),
        metric,
        rpmUp: parseInt(rpmUp),
        rpmDown: parseInt(rpmDown),
        jumps: parseInt(jumps),
      };
      if (metric === 'distance') {
        block.distanceUp = parseFloat(timeDistValueUp);
        block.distanceDown = parseFloat(timeDistValueDown);
      } else {
        block.timeUp = timeToSeconds(timeDistValueUp);
        block.timeDown = timeToSeconds(timeDistValueDown);
      }
    } else {
      block = {
        id: Date.now().toString(),
        type: buttonNumber,
        hr: parseInt(hr),
        metric,
        rpm: parseInt(rpm),
      };
      if (metric === 'distance') {
        block.distance = parseFloat(timeDistValue);
      } else {
        block.time = timeToSeconds(timeDistValue);
      }
    }

    onInsert(block);
    onClose();
  };

  useModalKeyboardEvents({
    isOpen,
    onClose,
    onConfirm: handleInsert,
    canConfirm: Object.keys(errors).length === 0,
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
        <h2>Posición {buttonNumber}</h2>

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
                  alt={`Botón ${buttonNumber}`}
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

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancel}>
            Cancelar
          </button>
          <button onClick={handleInsert} className={styles.insert}>
            Insertar
          </button>
        </div>
      </div>
    </div>
  );
}

