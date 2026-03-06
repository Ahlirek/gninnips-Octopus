import { useRef, useState, useCallback } from 'react';
import Button from './Button.tsx';
import NumberInputButton from './NumberInputButton.tsx';
import styles from './ControlsBar.module.css';
import { useKeyboardShorcuts } from '../hooks/useKeyboardShorcuts.ts';

interface ControlsBarProps {
  onImageButtonClick: (index: number) => void;
  onOpenTitleModal: () => void;
  onOpenDatePicker: (buttonReact: DOMRect) => void;
  onOpenConfirmationModal: () => void;
  onDelete: () => void;
  onLoop: () => void;
  onRep: (value: number) => void;
  onSumTime: () => void;
  onLeft: () => void;
  onRight: () => void;
  onLoadTraining: () => void;
  onDownloadTraining: () => void;
  shorcutsDisabled: boolean;
  onEditCurrent: () => void;
  canEdit: boolean;
}

const IMAGES_LENGTH = 10;
const TOTAL_BUTTONS = 22;
const NUMBER_INPUT_INDEX = 15;

const TITLE_BUTTON_TEXT = '[T]itulo';
const DATE_BUTTON_TEXT = '[F]echa';
const CLEAR_BUTTON_TEXT = '[L]impiar';
const DELETE_BUTTON_TEXT = 'Borrar';
const LOOP_BUTTON_TEXT = '[C]iclo';
const REPETITIONS_BUTTON_TEXT = '[R]epeticiones';
const SUM_TIME_BUTON_TEXT = '[S]umatoria Tiempo';
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
  ['［ ］', LOOP_BUTTON_TEXT, 'C'],
  ['X ❓', REPETITIONS_BUTTON_TEXT, 'R'],
  ['⏱️➕', SUM_TIME_BUTON_TEXT, 'S'],
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
  onLoop,
  onRep,
  onSumTime,
  onLeft,
  onRight,
  onLoadTraining,
  onDownloadTraining,
  shorcutsDisabled = false,
  onEditCurrent,
  canEdit,
}: ControlsBarProps) {
  const fechaButtonRef = useRef<HTMLButtonElement>(null);
  const [isNumberInputVisible, setIsNumberInputVisible] = useState(false);

  const handleNumberInputClose = useCallback(() => {
    setIsNumberInputVisible(false);
  }, []);

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
      r: { handler: () => setIsNumberInputVisible(true) },
      backspace: { handler: onDelete, options: { preventDefault: true } },
      c: { handler: onLoop },
      s: { handler: onSumTime },
      arrowleft: { handler: onLeft, options: { preventDefault: true } },
      arrowright: { handler: onRight, options: { preventDefault: true } },
      e: { handler: onEditCurrent },
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
        case LOOP_BUTTON_TEXT:
          onLoop();
          break;
        case SUM_TIME_BUTON_TEXT:
          onSumTime();
          break;
        case LEFT_BUTTON_TEXT:
          onLeft();
          break;
        case RIGHT_BUTTON_TEXT:
          onRight();
          break;
        case EDIT_BUTTON_TEXT:
          onEditCurrent();
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
      };
    }

    const isNumberInput = index === NUMBER_INPUT_INDEX;
    const emojiIndex = Math.max(0, index - IMAGES_LENGTH);
    const currentEmoji = emojisData[emojiIndex];

    return {
      type: isNumberInput ? 'numberInput' : 'emoji',
      emoji: currentEmoji[0],
      text: currentEmoji[1],
      key: isNumberInput ? 'numberInput' : `emoji-${index}`,
      title: `Shorcut: ${currentEmoji[2]}`,
    };
  });

  return (
    <div className={styles.buttonGrid}>
      {buttonConfigs.map((el, index) => {
        if (el.type === 'numberInput') {
          return (
            <NumberInputButton
              key={el.key}
              emoji={el.emoji}
              altText={el.text}
              buttonText={el.text}
              data-index={index.toString()}
              data-button-text={el.text}
              title={el.title}
              placeholder="Enter number"
              onSubmit={onRep}
              isOpen={isNumberInputVisible}
              onOpen={() => setIsNumberInputVisible(true)}
              onClose={handleNumberInputClose}
            />
          );
        }
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
            disabled={el.text === EDIT_BUTTON_TEXT && !canEdit}
            {...(el.text === DATE_BUTTON_TEXT ? { ref: fechaButtonRef } : {})}
          />
        );
      })}
    </div>
  );
}

