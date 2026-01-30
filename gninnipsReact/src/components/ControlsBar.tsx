import Button from './Button.tsx';
import NumberInputButton from './NumberInputButton.tsx';
import styles from './ControlsBar.module.css';

export default function ControlsBar() {
  const IMAGES_LENGTH = 10;
  const TOTAL_BUTTONS = 22;
  const NUMBER_INPUT_INDEX = 15;

  const emojis = [
    ['␡', 'Borrar'],
    ['🗑️', 'Limpiar'],
    ['𝐓', 'Titulo'],
    ['🗓️', 'Fecha'],
    ['［ ］', 'Ciclo'],
    ['⏱️➕', 'Sumatoria Tiempo'],
    ['', ''],
    ['⬅️', 'Izquierda'],
    ['➡️', 'Derecha'],
    ['📎', 'Cargar Entrenamiento'],
    ['💾', 'Descargar Imagen'],
  ];

  const handleButtonClick = (index: number, type: string) => {
    console.log(`${type} button ${index} clicked`);
  };

  const handleNumberInput = (value: number) => {
    console.log(`Number input: ${value}`);
  };

  const buttonConfigs = Array.from({ length: TOTAL_BUTTONS }, (_, index) => {
    // Button indices: 0-21 (22 total)

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
        return (
          <Button
            key={el.key}
            imgSrc={el.type === 'image' ? el.imgSrc : undefined}
            emoji={el.type === 'emoji' ? el.emoji : undefined}
            altText={el.text}
            buttonText={el.text}
            onClick={() => handleButtonClick(index, el.type)}
          />
        );
      })}
    </div>
  );
}

