import React, { forwardRef } from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  imgSrc?: string;
  emoji?: string;
  altText?: string;
  buttonText?: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      imgSrc,
      emoji,
      altText = 'Image Button',
      buttonText = '',
      onClick,
      disabled = false,
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
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
  },
);

Button.displayName = 'Button';

export default Button;

