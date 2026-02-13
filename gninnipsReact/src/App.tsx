import { useCallback, useState } from "react";
import styles from "./App.module.css";
import PreviewArea from "./components/PreviewArea.tsx";
import ControlsBar from "./components/ControlsBar.tsx";
import TitleInputModal from "./components/TitleInputModal.tsx";
import DatePicker from "react-datepicker";
import ConfirmationInputModal from "./components/ConfirmationModal.tsx";

function App() {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [numberInputValue, setNumberInputValue] = useState<number | null>(
    null,
  );
  const [title, setTitle] = useState("");

  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerPosition, setDatePickerPosition] = useState({
    top: 0,
    left: 0,
  });

  const handleImageButtonClick = useCallback((index: number) => {
    console.log(`Selected image ${index + 1}`);
    setSelectedImageIndex(index);
  }, []);

  const handleOpenTitleModal = useCallback(() => {
    setIsTitleModalOpen(true);
  }, []);
  const handleTitleSave = useCallback((titleToSave: string) => {
    console.log("Image title saved:", titleToSave);
    setTitle(titleToSave);
    setIsTitleModalOpen(false);
    // You can pass this title to any component that needs it
    // For example, if PreviewArea needs to display it:
    // previewAreaRef.current?.updateTitle(savedTitle);
  }, []);
  const handleTitleModalClose = useCallback(() => {
    console.log("Title input cancelled");
    setIsTitleModalOpen(false);
  }, []);

  const handleConfirmClear = useCallback(() => {
    console.log("Clear action confirmed");
    // Add clearing logic here
    setTitle("");
    // setSelectedDate('')// TODO: today
    setIsConfirmationModalOpen(false);
  }, []);
  const handleCancelClear = useCallback(() => {
    console.log("Clear action cancelled");
    setIsConfirmationModalOpen(false);
  }, []);

  const handleOpenDatePicker = useCallback((buttonRect: DOMRect) => {
    const position = {
      top: buttonRect.top + window.scrollY - 300, // 5px below button
      left: buttonRect.left + window.scrollX + buttonRect.width / 2,
    };
    setDatePickerPosition(position);
    setIsDatePickerOpen(true);
  }, []);
  const handleDateChange = useCallback((date: Date | null) => {
    setSelectedDate(date);
    setIsDatePickerOpen(false); // Close the calendar on selection
    console.log("Selected date:", date);
    // You can pass the date to a parent component or state manager here
  },[]);
  const handleClickOutsideDatePicker = useCallback(() => {
    setIsDatePickerOpen(false);
  }, []);

  const handleDelete = useCallback(() => {
    console.log("Delete Clicked");
  }, []);

  const handleLoop = useCallback(() => {
    console.log("Loop Clicked");
  }, []);

  const handleNumberInputValue = useCallback((value: number) => {
      setNumberInputValue(value);
    console.log(`Number input: ${value}`);
  }, []);

  const handleSumTime = useCallback(() => {
    console.log("Sum Time Clicked");
  }, []);

  const handleLeft = useCallback(() => {
    console.log("Left Clicked");
  }, []);

  const handleRight = useCallback(() => {
    console.log("Right Clicked");
  }, []);

  const handleLoadTraining = useCallback(() => {
    console.log("Load Training Clicked");
  }, []);

  const handleDownloadTraining = useCallback(() => {
    console.log("Download Training Clicked");
  }, []);
  return (
    <div className={styles.appContainer}>
      <div className={styles.previewArea}>
        <PreviewArea />
        {/* If you want to display the title in PreviewArea, pass it as a prop:
            <PreviewArea title={title} />
        */}
      </div>

      <div className={styles.controlsBar}>
        <ControlsBar
          onImageButtonClick={handleImageButtonClick}
          onOpenTitleModal={handleOpenTitleModal}
          onOpenDatePicker={handleOpenDatePicker}
          onOpenConfirmationModal={() => setIsConfirmationModalOpen(true)}
          onDelete={handleDelete}
          onRep={handleNumberInputValue}
          onLoop={handleLoop}
          onSumTime={handleSumTime}
          onLeft={handleLeft}
          onRight={handleRight}
          onLoadTraining={handleLoadTraining}
          onDownloadTraining={handleDownloadTraining}
        />
      </div>

      <TitleInputModal
        key={`modal-${isTitleModalOpen ? "open" : "closed"}`}
        isOpen={isTitleModalOpen}
        onClose={handleTitleModalClose}
        onSave={handleTitleSave}
      />

      <ConfirmationInputModal
        isOpen={isConfirmationModalOpen}
        onClose={handleCancelClear}
        onConfirm={handleConfirmClear}
        title="Confirmar Limpieza"
        message="¿Estás seguro de que deseas limpiar?\nEsta acción no se puede deshacer."
        confirmText="Limpiar"
        cancelText="Cancelar"
        icon="🗑️"
      />

      {isDatePickerOpen && (
        <div
          className={styles.datePickerContainer}
          style={{
            position: "fixed",
            top: `${datePickerPosition.top}px`,
            left: `${datePickerPosition.left}px`,
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsDatePickerOpen(false);
            }
          }}
          tabIndex={-1}
          ref={(el) => el?.focus()}
        >
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            inline
            onClickOutside={handleClickOutsideDatePicker}
          />
        </div>
      )}
    </div>
  );
}

export default App;

