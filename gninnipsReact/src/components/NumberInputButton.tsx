import Button from "./Button";
import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./NumberInputButton.module.css";

interface NumberButtonProps {
  imgSrc?: string;
  emoji?: string;
  altText?: string;
  buttonText?: string;
  onSubmit: (value: number) => void;
  disabled?: boolean;
  "data-index"?: string;
  "data-button-text"?: string;
  placeholder: string;
  title: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export default function NumberInputButton({
  emoji,
  altText,
  buttonText = "Submit",
  disabled = false,
  "data-index": dataIndex,
  "data-button-text": dataButtonText,
  title,
  placeholder = "Enter value",
  onSubmit,
  isOpen,
  onOpen,
  onClose,
}: NumberButtonProps) {
  const [value, setValue] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>("");

  const minValue = 2;
  const maxValue = 100;

  const validateInput = (num: number): boolean => {
    if (isNaN(num)) {
      setError("Por favor ingresa un número valido");
      return false;
    }
    if (minValue !== undefined && num < minValue) {
      setError(`Ingresa un valor mayor a ${minValue}`);
      return false;
    }
    if (maxValue !== undefined && num > maxValue) {
      setError(`Ingresa un valor menor a ${maxValue}`);
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = () => {
    const numValue = parseInt(value);
    if (validateInput(numValue)) {
      onSubmit(numValue);
      setValue("");
      onClose();
      setError("");
    }
  };

  const handleCancel =  useCallback(() => {
    setValue("");
    onClose();
    setError("");
  }, [onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
    isOpen
      ) {
        handleCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleCancel]);

  return (
    <div className={styles.numberInputContainer} ref={containerRef}>
      {isOpen ? (
        <div className={styles.inputWrapper}>
          <input
            type="number"
            min={minValue}
            max={maxValue}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`${styles.numberInput} ${error ? styles.error : ""}`}
            autoFocus
          />
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.actionButtonsContainer}>
            <button
              className={`${styles.actionButton} ${styles.submitButton}`}
              onClick={handleSubmit}
              disabled={!value.trim()}
            >
              ✔
            </button>
            <button
              className={`${styles.actionButton} ${styles.cancelButton}`}
              onClick={handleCancel}
              type="button"
            >
              ❌
            </button>
          </div>
        </div>
      ) : (
        <Button
          emoji={emoji}
          altText={altText}
          buttonText={buttonText}
          data-index={dataIndex}
          data-button-text={dataButtonText}
          title={title}
          disabled={disabled}
          onClick={onOpen}
          aria-label="Open number input"
        >
        </Button>
      )}
    </div>
  );
}

