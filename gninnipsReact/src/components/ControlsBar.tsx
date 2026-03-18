import { useRef } from 'react';
import Button from './Button.tsx';
import styles from './ControlsBar.module.css';
import { useKeyboardShorcuts } from '../hooks/useKeyboardShorcuts.ts';

interface ControlsBarProps {
  onImageButtonClick: (index: number) => void;
  onOpenTitleModal: () => void;
  onOpenDatePicker: (buttonReact: DOMRect) => void;
  onOpenConfirmationModal: () => void;
  onDelete: (index?: number) => void;
  onCreateLoop: () => void;
  onEditLoop: () => void;
  onCumTimeDist: () => void;
  onLeft: () => void;
  onRight: () => void;
  onLoadTraining: () => void;
  onDownloadTraining: () => void;
  shorcutsDisabled: boolean;
  onEditCurrent: () => void;
  disableEditBlockAndCreateLoop: boolean;
  disableEditLoop: boolean;
}

const IMAGES_LENGTH = 10;
const TOTAL_BUTTONS = 22;

const TITLE_BUTTON_TEXT = '[T]itulo';
const DATE_BUTTON_TEXT = '[F]echa';
const CLEAR_BUTTON_TEXT = '[L]impiar';
const DELETE_BUTTON_TEXT = 'Borrar';
const CREATE_LOOP_BUTTON_TEXT = '[C]iclo';
const EDIT_LOOP_BUTTON_TEXT = 'Edita[R] Ciclo';
const CUM_TIME_DIST_BUTTON_TEXT = '[A]ccumulado';
const EDIT_BUTTON_TEXT = '[E]dit';
const LEFT_BUTTON_TEXT = 'Izquierda';
const RIGHT_BUTTON_TEXT = 'Derecha';
const LOAD_TRAINING_BUTTON_TEXT = 'Cargar Entrenamiento';
const DOWNLOAD_TRAINING_BUTTON_TEXT = '[D]escargar Entrenamiento';

const emojisData = [
  ['␡', DELETE_BUTTON_TEXT, 'Retroceso'],
  ['🗑️', CLEAR_BUTTON_TEXT, 'L'],
  ['𝐓', TITLE_BUTTON_TEXT, 'T'],
  ['🗓️', DATE_BUTTON_TEXT, 'F'],
  ['⏱️➕', CUM_TIME_DIST_BUTTON_TEXT, 'A'],
  ['［ ］', CREATE_LOOP_BUTTON_TEXT, 'C'],
  ['［🔄］', EDIT_LOOP_BUTTON_TEXT, 'R'],
  ['✏️', EDIT_BUTTON_TEXT, 'E'],
  ['⬅️', LEFT_BUTTON_TEXT, 'Flecha Izquierda'],
  ['➡️', RIGHT_BUTTON_TEXT, 'Flecha Derecha'],
  ['📎', LOAD_TRAINING_BUTTON_TEXT, 'U'],
  ['💾', DOWNLOAD_TRAINING_BUTTON_TEXT, 'D'],
];

export default function ControlsBar({
  onImageButtonClick,
  onOpenTitleModal,
  onOpenDatePicker,
  onOpenConfirmationModal,
  onDelete,
  onCreateLoop,
  onEditLoop,
  onCumTimeDist,
  onLeft,
  onRight,
  onLoadTraining,
  onDownloadTraining,
  shorcutsDisabled = false,
  onEditCurrent,
  disableEditBlockAndCreateLoop,
  disableEditLoop,
}: ControlsBarProps) {
  const fechaButtonRef = useRef<HTMLButtonElement>(null);

  useKeyboardShorcuts(
    {
      '1': { handler: () => onImageButtonClick(1) },
      '2': { handler: () => onImageButtonClick(2) },
      '3': { handler: () => onImageButtonClick(3) },
      '4': { handler: () => onImageButtonClick(4) },
      '5': { handler: () => onImageButtonClick(5) },
      '6': { handler: () => onImageButtonClick(6) },
      '7': { handler: () => onImageButtonClick(7) },
      '8': { handler: () => onImageButtonClick(8) },
      '9': { handler: () => onImageButtonClick(9) },
      '0': { handler: () => onImageButtonClick(0) },
      t: { handler: onOpenTitleModal },
      f: {
        handler: () => {
          if (fechaButtonRef.current) {
            const fechaButtonRect =
              fechaButtonRef.current.getBoundingClientRect();
            onOpenDatePicker(fechaButtonRect);
          }
        },
      },
      l: { handler: onOpenConfirmationModal },
      r: { handler: onEditLoop, disabled: disableEditLoop },
      backspace: { handler: onDelete, options: { preventDefault: true } },
      c: { handler: onCreateLoop, disabled: disableEditBlockAndCreateLoop },
      a: { handler: onCumTimeDist },
      e: { handler: onEditCurrent, disabled: disableEditBlockAndCreateLoop },
      arrowleft: { handler: onLeft, options: { preventDefault: true } },
      arrowright: { handler: onRight, options: { preventDefault: true } },
      u: { handler: onLoadTraining },
      d: { handler: onDownloadTraining },
    },
    shorcutsDisabled,
  );

  const handleButtonClick = (
    index: number,
    type: string,
    buttonText: string,
  ) => {
    console.log(`${type} button ${index} clicked`);
    if (type === 'image') {
      onImageButtonClick(index);
    } else if (type === 'emoji') {
      switch (buttonText) {
        case TITLE_BUTTON_TEXT:
          onOpenTitleModal();
          break;
        case CLEAR_BUTTON_TEXT:
          onOpenConfirmationModal();
          break;
        case DATE_BUTTON_TEXT:
          if (fechaButtonRef.current) {
            const fechaButtonRect =
              fechaButtonRef.current.getBoundingClientRect();
            onOpenDatePicker(fechaButtonRect);
          }
          break;
        case DELETE_BUTTON_TEXT:
          onDelete();
          break;
        case CREATE_LOOP_BUTTON_TEXT:
          onCreateLoop();
          break;
        case EDIT_LOOP_BUTTON_TEXT:
          onEditLoop();
          break;
        case CUM_TIME_DIST_BUTTON_TEXT:
          onCumTimeDist();
          break;
        case EDIT_BUTTON_TEXT:
          onEditCurrent();
          break;
        case LEFT_BUTTON_TEXT:
          onLeft();
          break;
        case RIGHT_BUTTON_TEXT:
          onRight();
          break;
        case LOAD_TRAINING_BUTTON_TEXT:
          onLoadTraining();
          break;
        case DOWNLOAD_TRAINING_BUTTON_TEXT:
          onDownloadTraining();
          break;

        default:
          console.log(`Unhandled button: ${buttonText}`);
          break;
      }
    }
  };

  const buttonConfigs = Array.from({ length: TOTAL_BUTTONS }, (_, index) => {
    if (index < IMAGES_LENGTH) {
      const displayIndex = index % IMAGES_LENGTH;
      return {
        type: 'image' as const,
        imgSrc: `/images/${index}.png`,
        text: `Posición [${displayIndex}]`,
        key: `img-${index}`,
        title: `Shorcut: ${displayIndex}`,
        disabled: false,
      };
    }

    const emojiIndex = Math.max(0, index - IMAGES_LENGTH);
    const currentEmoji = emojisData[emojiIndex];
    let buttonDisabled = false;
    switch (currentEmoji[1]) {
      case EDIT_LOOP_BUTTON_TEXT:
        buttonDisabled = disableEditLoop;
        break;
      case EDIT_BUTTON_TEXT:
      case CREATE_LOOP_BUTTON_TEXT:
        buttonDisabled = disableEditBlockAndCreateLoop;
        break;
    }

    return {
      type: 'emoji',
      emoji: currentEmoji[0],
      text: currentEmoji[1],
      key: `emoji-${index}`,
      title: `Shorcut: ${currentEmoji[2]}`,
      disabled: buttonDisabled,
    };
  });

  return (
    <div className={styles.buttonGrid}>
      {buttonConfigs.map((el, index) => {
        return (
          <Button
            key={el.key}
            imgSrc={el.type === 'image' ? el.imgSrc : undefined}
            emoji={el.type === 'emoji' ? el.emoji : undefined}
            altText={el.text}
            buttonText={el.text}
            data-index={index.toString()}
            data-button-text={el.text}
            onClick={() => handleButtonClick(index, el.type, el.text)}
            title={el.title}
            disabled={el.disabled}
            {...(el.text === DATE_BUTTON_TEXT ? { ref: fechaButtonRef } : {})}
          />
        );
      })}
    </div>
  );
}

