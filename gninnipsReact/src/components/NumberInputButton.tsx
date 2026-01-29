import { useState, useEffect, useRef } from "react";
import styles from "./NumberInputButton.module.css"
import stylesButton from "./Button.module.css"

export default function NumberInputButton({
  buttonText = "Submit",
  placeholder = "Enter value",
  onSubmit,
}: {
  buttonText?: string;
  placeholder?: string;
  onSubmit: (value: number) => void;
  cancelText?: string;
}) {
  const [value, setValue] = useState<string>("");
  const [isInputVisible, setIsInputVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>("");

  const minValue = 2;
  const maxValue = 100;

  const validateInput = (num: number): boolean => {
    if (isNaN(num)) {
      setError("Please enter a valid number");
      return false;
    }
    if (minValue !== undefined && num < minValue) {
      setError(`Value must be at least ${minValue}`);
      return false;
    }
    if (maxValue !== undefined && num > maxValue) {
      setError(`Value must be at most ${maxValue}`);
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
      setIsInputVisible(false);
      setError("");
    }
  };

  const handleCancel = () => {
    setValue("");
    setIsInputVisible(false);
    setError("");
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
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
        isInputVisible
      ) {
        handleCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isInputVisible]);

  return (
    <div className={styles.numberInputContainer} ref={containerRef}>
      {isInputVisible ? (
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
            onKeyDown={handleKeyPress}
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
        <button
          className={stylesButton.imageButton}
          onClick={() => setIsInputVisible(true)}
          aria-label="Open number input"
        >
          <span className={stylesButton.buttonEmoji}>X</span>
          {buttonText && <span className={stylesButton.buttonText}>{buttonText}</span>}
        </button>
      )}
    </div>
  );
}

