import { useState, useEffect, useRef } from "react";

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

    const handleSubmit = () => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      onSubmit(numValue);
      setValue("");
      setIsInputVisible(false);
    }
  };

  const handleCancel = () => {
      setValue("");
      setIsInputVisible(false);
  }
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
      <div className="number-input-container" ref={containerRef}>

  { isInputVisible ? (
      <div className="input-wrapper">
        <input
        type="number"
        min="2"
        max="100"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
        className="number-input"
        autoFocus
        />
        <div className="action-buttons">
        <button
        className="act-butt submit-button"
        onClick={handleSubmit}
        disabled={!value.trim()}
        >
        ✔
        </button>
        <button
        className="act-butt cancel-button"
        onClick={handleCancel}
        type="button"
        >
        ❌
        </button>
      </div>
      </div>
  ):(
<button
className="image-button"
onClick={() => setIsInputVisible(true)}
aria-label="Open number input"
>
<span className="button-emoji">X</span>
{buttonText && <span className="button-text">{buttonText}</span>}
</button>
  )}
  </div>
  );
}


