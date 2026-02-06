import { useCallback, useState } from 'react';
import styles from './App.module.css';
import ConfigurationPanel from './components/ConfigurationPanel.tsx';
import PreviewArea from './components/PreviewArea.tsx';
import ControlsBar from './components/ControlsBar.tsx';
import TitleInputModal from './components/TitleInputModal.tsx';
import DatePicker from 'react-datepicker';
import ConfirmationInputModal from './components/ConfirmationModal.tsx';

function App() {
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [title, setTitle] = useState('');

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerPosition, setDatePickerPosition] = useState({
    top: 0,
    left: 0,
  });

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const handleTitleSave = (titleToSave: string) => {
    console.log('Image title saved:', titleToSave);
    setTitle(titleToSave);
    setIsTitleModalOpen(false);
    // You can pass this title to any component that needs it
    // For example, if PreviewArea needs to display it:
    // previewAreaRef.current?.updateTitle(savedTitle);
  };

  const handleTitleModalClose = () => {
    console.log('Title input cancelled');
    setIsTitleModalOpen(false);
  };

  const handleOpenDatePicker = (buttonRect: DOMRect) => {
    const position = {
      top: buttonRect.top + window.scrollY - 300, // 5px below button
      left: buttonRect.left + window.scrollX + buttonRect.width / 2,
    };
    setDatePickerPosition(position);
    setIsDatePickerOpen(true);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setIsDatePickerOpen(false); // Close the calendar on selection
    console.log('Selected date:', date);
    // You can pass the date to a parent component or state manager here
  };

  const handleClickOutsideDatePicker = () => {
    setIsDatePickerOpen(false);
  };

  const handleConfirmClear = useCallback(() => {
    console.log('Clear action confirmed');
    // Add clearing logic here
    setIsConfirmationModalOpen(false);
  }, []);

  const handleCancelClear = useCallback(() => {
    console.log('Clear action cancelled');
    setIsConfirmationModalOpen(false);
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
          onOpenTitleModal={() => setIsTitleModalOpen(true)}
          onOpenDatePicker={handleOpenDatePicker}
          onOpenConfirmationModal={() => setIsConfirmationModalOpen(true)}
        />
      </div>

      <TitleInputModal
        key={`modal-${isTitleModalOpen ? 'open' : 'closed'}`}
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
            position: 'fixed',
            top: `${datePickerPosition.top}px`,
            left: `${datePickerPosition.left}px`,
          }}
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

