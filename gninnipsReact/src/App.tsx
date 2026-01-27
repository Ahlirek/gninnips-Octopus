import "./App.css";
import ConfigurationPanel from "./components/ConfigurationPanel.tsx";
import PreviewArea from "./components/PreviewArea.tsx";
import ControlsBar from "./components/ControlsBar.tsx";

function App() {
  return (
    <div className="app-container">
      <div className="upper-section">
        <div className="config-panel">
          <ConfigurationPanel />
        </div>
        <div className="preview-area">
          <PreviewArea />
        </div>
      </div>

      <div className="controls-bar">
        <ControlsBar />
      </div>
    </div>
  );
}

export default App;

