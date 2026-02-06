import { useRef } from 'react';
import Button from './Button.tsx';
import NumberInputButton from './NumberInputButton.tsx';
import styles from './ControlsBar.module.css';

interface ControlsBarProps {
  onOpenTitleModal?: () => void;
  onOpenDatePicker?: (buttonReact: DOMRect) => void;
  onOpenConfirmationModal?: () => void;
}

export default function ControlsBar({
  onOpenTitleModal,
  onOpenDatePicker,
  onOpenConfirmationModal,
}: ControlsBarProps) {
  const IMAGES_LENGTH = 10;
  const TOTAL_BUTTONS = 22;
  const NUMBER_INPUT_INDEX = 15;
  const TITLE_BUTTON_TEXT = 'Titulo';
  const DATE_BUTTON_TEXT = 'Fecha';
  const CLEAR_BUTTON_TEXT = 'Limpiar';

  const emojis = [
    ['␡', 'Borrar'],
    ['🗑️', CLEAR_BUTTON_TEXT],
    ['𝐓', TITLE_BUTTON_TEXT],
    ['🗓️', DATE_BUTTON_TEXT],
    ['［ ］', 'Ciclo'],
    ['⏱️➕', 'Sumatoria Tiempo'],
    ['', ''],
    ['⬅️', 'Izquierda'],
    ['➡️', 'Derecha'],
    ['📎', 'Cargar Entrenamiento'],
    ['💾', 'Descargar Imagen'],
  ];

  const fechaButtonRef = useRef<HTMLButtonElement>(null);

  const handleButtonClick = (
    index: number,
    type: string,
    buttonText: string,
  ) => {
    console.log(`${type} button ${index} clicked`);
    if (buttonText === TITLE_BUTTON_TEXT && onOpenTitleModal) {
      onOpenTitleModal();
    } else if (buttonText === CLEAR_BUTTON_TEXT && onOpenConfirmationModal) {
      onOpenConfirmationModal();
    } else if (
      buttonText === DATE_BUTTON_TEXT &&
      onOpenDatePicker &&
      fechaButtonRef.current
    ) {
      const buttonRect = fechaButtonRef.current.getBoundingClientRect();
      onOpenDatePicker(buttonRect);
    }
  };

  const handleNumberInput = (value: number) => {
    console.log(`Number input: ${value}`);
  };

  const buttonConfigs = Array.from({ length: TOTAL_BUTTONS }, (_, index) => {
    if (index < IMAGES_LENGTH) {
      return {
        type: 'image' as const,
        imgSrc: `/images/${index + 1}.png`,
        text: `Entrenamiento ${index + 1}`,
        key: `img-${index}`,
      };
    }

    if (index === NUMBER_INPUT_INDEX) {
      return {
        type: 'numberInput' as const,
        text: 'Repeticiones',
        key: 'number-input',
      };
    }
    const emojiIndex = Math.max(
      0,
      index - IMAGES_LENGTH - (index > NUMBER_INPUT_INDEX ? 1 : 0),
    );
    const currentEmoji = emojis[emojiIndex];

    return {
      type: 'emoji' as const,
      emoji: currentEmoji[0],
      text: currentEmoji[1],
      key: `emoji-${index}`,
    };
  });

  return (
    <div className={styles.buttonGrid}>
      {buttonConfigs.map((el, index) => {
        if (el.type === 'numberInput') {
          return (
            <NumberInputButton
              key={el.key}
              buttonText={el.text}
              placeholder="Enter number"
              onSubmit={handleNumberInput}
            />
          );
        }
        if (el.text === DATE_BUTTON_TEXT) {
          return (
            <Button
              key={el.key}
              ref={fechaButtonRef}
              imgSrc={el.type === 'image' ? el.imgSrc : undefined}
              emoji={el.type === 'emoji' ? el.emoji : undefined}
              altText={el.text}
              buttonText={el.text}
              onClick={() => handleButtonClick(index, el.type, el.text)}
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
            onClick={() => handleButtonClick(index, el.type, el.text)}
          />
        );
      })}
    </div>
  );
}

