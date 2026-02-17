import { useCallback, useEffect, useState } from 'react';
import styles from './App.module.css';
import TrainingBlockModal from './components/TrainingBlockModal.tsx';
import type { TrainingData, TrainingBlock, Loop } from './types.ts';
import PreviewArea from './components/PreviewArea.tsx';
import ControlsBar from './components/ControlsBar.tsx';
import TitleInputModal from './components/TitleInputModal.tsx';
import DatePicker from 'react-datepicker';
import ConfirmationInputModal from './components/ConfirmationModal.tsx';
import type { newDate } from 'react-datepicker/dist/dist/date_utils.js';
import { isDate } from 'react-datepicker/dist/dist/date_utils.js';

function App() {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [numberInputValue, setNumberInputValue] = useState<number | null>(null);

  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerPosition, setDatePickerPosition] = useState({
    top: 0,
    left: 0,
  });

  const [trainingData, setTrainingData] = useState<TrainingData>({
    blocks: [],
    loops: [],
    cursor: 0,
    date: new Date(),
    title: '',
  });

  const [trainingModalState, setTrainingModalState] = useState<{
    open: boolean;
    buttonIndex: number;
  }>({
    open: false,
    buttonIndex: -1,
  });

  const [buttonImages, setButtonImages] = useState<HTMLImageElement[]>([]);

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    });

  useEffect(() => {
    let isMounted = true;

    const loadAll = async () => {
      try {
        const images = await Promise.all(
          Array.from({ length: 10 }, (_, i) =>
            loadImage(`/images/${i + 1}.png`),
          ),
        );
        if (isMounted) {
          setButtonImages(images);
        }
      } catch (error) {
        console.error('Image preloading failed:', error);
      }
    };
    loadAll();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleImageButtonClick = useCallback((index: number) => {
    console.log(`Selected image ${index + 1}`);
    setSelectedImageIndex(index);
    setTrainingModalState({ open: true, buttonIndex: index });
  }, []);

  const handleInsertBlock = useCallback((block: TrainingBlock) => {
    setTrainingData((prev) => {
      const newBlocks = [...prev.blocks];
      newBlocks.splice(prev.cursor, 0, block);
      const newLoops = prev.loops.map((loop) => ({
        start: loop.start >= prev.cursor ? loop.start + 1 : loop.start,
        end: loop.end >= prev.cursor ? loop.end + 1 : loop.end,
        repetitions: loop.repetitions,
      }));
      return {
        ...prev,
        blocks: newBlocks,
        loops: newLoops,
        cursor: prev.cursor + 1,
      };
    });
    setTrainingModalState({ open: false, buttonIndex: -1 });
  }, []);

  const handleOpenTitleModal = useCallback(() => {
    setIsTitleModalOpen(true);
  }, []);
  const handleTitleSave = useCallback((title: string) => {
    setTrainingData((prev) => ({ ...prev, title }));
    setIsTitleModalOpen(false);
    console.log('Image title saved:', title);
  }, []);
  const handleTitleModalClose = useCallback(() => {
    setIsTitleModalOpen(false);
    console.log('Title input cancelled');
  }, []);

  const handleConfirmClear = useCallback(() => {
    setTrainingData({
      blocks: [],
      loops: [],
      cursor: 0,
      date: new Date(),
      title: '',
    });
    setIsConfirmationModalOpen(false);
    console.log('Clear action confirmed');
  }, []);
  const handleCancelClear = useCallback(() => {
    setIsConfirmationModalOpen(false);
    console.log('Clear action cancelled');
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
    setTrainingData((prev) => ({ ...prev, date }));
    setIsDatePickerOpen(false);
    console.log('Selected date:', date);
  }, []);
  const handleClickOutsideDatePicker = useCallback(() => {
    setIsDatePickerOpen(false);
  }, []);

  const handleDelete = useCallback(() => {
    setTrainingData((prev) => {
      if (prev.blocks.length === 0) {
        return prev;
      }
      const newBlocks = prev.blocks.filter((_, i) => i !== prev.cursor);
      // Adjust loops and cursor
      const newLoops = prev.loops
        .map((loop) => ({
          start: loop.start > prev.cursor ? loop.start - 1 : loop.start,
          end: loop.end > prev.cursor ? loop.end - 1 : loop.end,
          repetitions: loop.repetitions,
        }))
        .filter((loop) => loop.start < loop.end); // INFO: < vs <=
      const newCursor = Math.min(prev.cursor, newBlocks.length);
      return { ...prev, blocks: newBlocks, loops: newLoops, cursor: newCursor };
    });
    console.log('Delete Clicked');
  }, []);

  const handleLoop = useCallback(() => {
    // In a real app you'd let the user select a range; this is a placeholder.
    console.log('Loop Clicked');
    setTrainingData((prev) => {
      const newLoop: Loop = {
        start: prev.cursor,
        end: prev.cursor,
        repetitions: 1, //TODO: ESTE DEBERÍA ESTAR LIGADO CON NUMBER INPUT VALUE
        // DEBO REDUCIR ESOS DOS BOTONES A 1 Y PROBABLEMENTE UN MODAL PARA SELECCIONAR
        // DE DONDE A DONDE HACER EL LOOP
        // Se puede usar un botón para MODIFICACIONES de ciclos actual
        // y otro para borrar ciclo actual
      };
      return { ...prev, loops: [...prev.loops, newLoop] };
    });
  }, []);

  // WARN: This is wrong should update the more inner loop where the coursor is
  // probably this is substitution/repetition of handleNumberInputValue
  const handleRep = useCallback((reps: number) => {
    setTrainingData((prev) => {
      if (prev.loops.length === 0) {
        return prev;
      }
      const newLoops = [...prev.loops];
      newLoops[newLoops.length - 1] = {
        ...newLoops[newLoops.length - 1],
        repetitions: reps,
      };
      return { ...prev, loops: newLoops };
    });
  }, []);

  const handleNumberInputValue = useCallback((value: number) => {
    setNumberInputValue(value);
    console.log(`Number input: ${value}`);
  }, []);

  const handleSumTime = useCallback(() => {
    console.log('Sum Time Clicked');
  }, []);

  const handleLeft = useCallback(() => {
    console.log('Left Clicked');
    setTrainingData((prev) => ({
      ...prev,
      cursor: Math.max(0, prev.cursor - 1),
    }));
  }, []);

  const handleRight = useCallback(() => {
    console.log('Right Clicked');
    setTrainingData((prev) => ({
      ...prev,
      cursor: Math.min(prev.blocks.length, prev.cursor + 1),
    }));
  }, []);

  const handleLoadTraining = useCallback(() => {
    console.log('Load Training Clicked');
  }, []);

  const handleDownloadTraining = useCallback(() => {
    console.log('Download Training Clicked');
  }, []);

  const handleReorder = useCallback(
    (newBlocks: TrainingBlock[], newLoops: Loop[]) => {
      setTrainingData((prev) => ({
        ...prev,
        blocks: newBlocks,
        loops: newLoops,
      }));
    },
    [],
  );

  const isAnyModalOpen =
    isTitleModalOpen ||
    isConfirmationModalOpen ||
    isDatePickerOpen ||
    trainingModalState.open;

  return (
    <div className={styles.appContainer}>
      <div className={styles.previewArea}>
        <PreviewArea
        // data={trainingData}
        //           onDataChange={setTrainingData}
        //           backgroundSrc="/images/fondo.png"
        //           buttonImages={buttonImages}
        />
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
          shorcutsDisabled={isAnyModalOpen}
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
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsDatePickerOpen(false);
            }
          }}
          tabIndex={-1}
          ref={(el) => el?.focus()}
        >
          <DatePicker
            selected={trainingData.date}
            onChange={handleDateChange}
            inline
            onClickOutside={handleClickOutsideDatePicker}
          />
        </div>
      )}

      {trainingModalState.open && (
        <TrainingBlockModal
          key={trainingModalState.buttonIndex}
          isOpen={trainingModalState.open}
          onClose={() =>
            setTrainingModalState({ open: false, buttonIndex: -1 })
          }
          onInsert={handleInsertBlock}
          buttonNumber={trainingModalState.buttonIndex + 1}
          buttonImage={buttonImages[trainingModalState.buttonIndex]}
          optional={trainingModalState.buttonIndex === 9}
        />
      )}
    </div>
  );
}

export default App;

