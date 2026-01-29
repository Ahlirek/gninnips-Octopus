import styles from "./App.module.css";
import ConfigurationPanel from "./components/ConfigurationPanel.tsx";
import PreviewArea from "./components/PreviewArea.tsx";
import ControlsBar from "./components/ControlsBar.tsx";

function App() {
  return (
    <div className={styles.appContainer}>
      <div className={styles.upperSection}>
        <div className={styles.configPanel}>
          <ConfigurationPanel />
        </div>
        <div className={styles.previewArea}>
          <PreviewArea />
        </div>
      </div>

      <div className={styles.controlsBar}>
        <ControlsBar />
      </div>
    </div>
  );
}

export default App;

