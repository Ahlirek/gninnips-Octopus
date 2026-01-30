import styles from './Button.module.css';

export default function Button({
  imgSrc,
  emoji,
  altText = 'Image Button',
  buttonText = '',
  onClick,
  disabled = false,
}: {
  imgSrc?: string;
  emoji?: string;
  altText?: string;
  buttonText?: string;
  onClick: React.MouseEventHandler;
  disabled?: boolean;
}) {
  return (
    <button
      className={styles.imageButton}
      onClick={onClick}
      disabled={disabled}
      aria-label={altText}
    >
      {imgSrc ? (
        <img src={imgSrc} alt={altText} className={styles.buttonImage} />
      ) : emoji ? (
        <span className={styles.buttonEmoji}>{emoji}</span>
      ) : null}

      {buttonText && <span className={styles.buttonText}>{buttonText}</span>}
    </button>
  );
}

