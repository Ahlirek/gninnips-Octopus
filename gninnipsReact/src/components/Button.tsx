import styles from './Button.module.css';
import HotkeyLabel from './HotkeyLabel';

interface ButtonProps {
  imgSrc?: string;
  emoji?: string;
  altText?: string;
  buttonText?: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  'data-index'?: string;
  'data-button-text'?: string;
  title?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

export default function Button({
  imgSrc,
  emoji,
  altText = 'Image Button',
  buttonText = '',
  onClick,
  disabled = false,
  'data-index': dataIndex,
  'data-button-text': dataButtonText,
  title,
  ref,
}: ButtonProps) {
  return (
    <button
      ref={ref}
      className={styles.imageButton}
      onClick={onClick}
      disabled={disabled}
      aria-label={altText}
      data-index={dataIndex}
      data-button-text={dataButtonText}
      title={title}
    >
      {imgSrc ? (
        <img src={imgSrc} alt={altText} className={styles.buttonImage} />
      ) : emoji ? (
        <span className={styles.buttonEmoji}>{emoji}</span>
      ) : null}

      {buttonText && (
        <span className={styles.buttonText}>
          <HotkeyLabel text={buttonText} />
        </span>
      )}
    </button>
  );
}

