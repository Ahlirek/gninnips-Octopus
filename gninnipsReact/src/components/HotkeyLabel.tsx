import styles from "./HotkeyLabel.module.css"

export default function HotkeyLabel({ text }: {text:string}) {
  const match = text.match(/^(.*?)\[(.*?)\](.*)$/);

  if (!match) {
      return text; 
  }

  const [, before, hotkey, after] = match;

  return (
    <>
    {before}
      <span className={styles.hotkey}>[{hotkey}]</span>
      {after}
    </>
  );
}


