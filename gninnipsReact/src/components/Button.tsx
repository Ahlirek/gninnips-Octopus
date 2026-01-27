import "./Button.css";
export default function Button({
  imgSrc,
  emoji,
  altText = "button image",
  buttonText = "",
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
      className="image-button"
      onClick={onClick}
      disabled={disabled}
      aria-label={altText}
    >
      {imgSrc ? (
        <img src={imgSrc} alt={altText} className="button-image" />
      ) : emoji ? (
        <span className="button-emoji">{emoji}</span>
      ) : null}

      {buttonText && <span className="button-text">{buttonText}</span>}
    </button>
  );
}

