import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import {
  useCallback,
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
} from 'react';
import styles from './App.module.css';
import TrainingBlockModal from './components/TrainingBlockModal.tsx';
import type { TrainingData, TrainingBlock, Loop } from './types.ts';
import PreviewArea from './components/PreviewArea.tsx';
import ControlsBar from './components/ControlsBar.tsx';
import TitleInputModal from './components/TitleInputModal.tsx';
import DatePicker from 'react-datepicker';
import ConfirmationInputModal from './components/ConfirmationModal.tsx';
import Konva from 'konva';

function App() {
  const imageRef = useRef<Konva.Stage>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCumTimeDistVisible, setIsCumTimeDistVisible] = useState(true);
  const [exportMode, setExportMode] = useState(false);

  // @ts-expect-error: suppressing unused variable for now
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  // @ts-expect-error: suppressing unused variable for now
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

  // const [trainingModalState, setTrainingModalState] = useState<{
  //   open: boolean;
  //   buttonIndex: number;
  // }>({
  //   open: false,
  //   buttonIndex: -1,
  // });
  const [trainingModalState, setTrainingModalState] = useState<{
    mode: 'insert' | 'edit';
    blockType: number;
    block?: TrainingBlock;
    index?: number;
  } | null>(null);

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
          Array.from({ length: 10 }, (_, i) => loadImage(`/images/${i}.png`)),
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

  const handleImageButtonClick = useCallback(
    (blockType: number) => {
      console.log(`Selected image ${blockType + 1}`);
      setSelectedImageIndex(blockType);
      setTrainingModalState({
        mode: 'insert',
        blockType,
        index: trainingData.cursor,
      });
    },
    [trainingData.cursor],
  );

  const canEdit = trainingData.cursor < trainingData.blocks.length;
  const handleEditCurrent = useCallback(() => {
    const block = trainingData.blocks[trainingData.cursor];
    if (!block) {
      return;
    }
    setTrainingModalState({
      mode: 'edit',
      blockType: block.type,
      block,
      index: trainingData.cursor,
    });
  }, [trainingData.blocks, trainingData.cursor]);

  const handleEditBlock = useCallback((index: number, block: TrainingBlock) => {
    setTrainingModalState({
      mode: 'edit',
      blockType: block.type,
      block,
      index,
    });
  }, []);

  const handleInsertBlockAtPosition = useCallback(
    (block: TrainingBlock, insertIndex: number) => {
      setTrainingData((prev) => {
        if (insertIndex < 0 || insertIndex > prev.blocks.length) {
          return prev;
        }
        const newBlocks = [...prev.blocks];
        newBlocks.splice(insertIndex, 0, block);
        const newLoops = prev.loops.map((loop) => ({
          start: loop.start >= insertIndex ? loop.start + 1 : loop.start,
          end: loop.end >= insertIndex ? loop.end + 1 : loop.end,
          repetitions: loop.repetitions,
        }));
        return {
          ...prev,
          blocks: newBlocks,
          loops: newLoops,
          cursor: insertIndex + 1,
        };
      });
    },
    [],
  );

  const handleUpdateBlock = useCallback(
    (oldIndex: number, newBlock: TrainingBlock, newIndex: number) => {
      setTrainingData((prev) => {
        // Remove old block
        const blocksAfterRemove = prev.blocks.filter((_, i) => i !== oldIndex);
        const loopsAfterRemove = prev.loops
          .map((loop) => ({
            start: loop.start > oldIndex ? loop.start - 1 : loop.start,
            end: loop.end > oldIndex ? loop.end - 1 : loop.end,
            repetitions: loop.repetitions,
          }))
          .filter((loop) => loop.start < loop.end); // WARN: REVISAR ESTE FILTER

        const insertIndex = newIndex > oldIndex ? newIndex - 1 : newIndex;

        const newBlocks = [...blocksAfterRemove];
        newBlocks.splice(insertIndex, 0, newBlock);

        const newLoops = loopsAfterRemove.map((loop) => ({
          start: loop.start >= insertIndex ? loop.start + 1 : loop.start,
          end: loop.end >= insertIndex ? loop.end + 1 : loop.end,
          repetitions: loop.repetitions,
        }));

        return {
          ...prev,
          blocks: newBlocks,
          loops: newLoops,
        };
      });
    },
    [],
  );

  // why trainingModalState.index should not be undefined?
  const handleSaveBlock = useCallback(
    (block: TrainingBlock, blockIndex: number) => {
      if (
        trainingModalState?.mode === 'edit' &&
        trainingModalState.index !== undefined
      ) {
        handleUpdateBlock(trainingModalState.index, block, blockIndex);
      } else if (trainingModalState?.mode === 'insert') {
        handleInsertBlockAtPosition(block, blockIndex);
      }
      setTrainingModalState(null);
    },
    [trainingModalState, handleUpdateBlock, handleInsertBlockAtPosition],
  );

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
  // @ts-expect-error: suppressing unused variable for now
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

  const handleCumTimeDist = useCallback(() => {
    setIsCumTimeDistVisible((prev) => !prev);
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
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const loadedData = JSON.parse(content) as TrainingData;

        if (loadedData.date) {
          loadedData.date = new Date(loadedData.date);
        }

        setTrainingData(loadedData);
        console.log('Training loaded successfully');
      } catch (error) {
        console.error('Failed to load training file:', error);
        alert('Invalid training file');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTraining = useCallback(() => {
    if (exportMode) {
      return;
    }
    setExportMode(true);
  }, [exportMode]);

  useLayoutEffect(() => {
    if (!exportMode) {
      return;
    }

    const image = imageRef.current;
    if (!image) {
      setExportMode(false);
      return;
    }

    const oldPos = image.position();
    const oldScale = image.scale();

    image.position({ x: 0, y: 0 });
    image.scale({ x: 1, y: 1 });

    const uri = image.toDataURL({
      pixelRatio: 1,
    });

    image.position(oldPos);
    image.scale(oldScale);

    const dateStr = trainingData.date
      ? trainingData.date.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        })
      : '--';
    const link = document.createElement('a');
    link.download = `${dateStr}.png`;
    link.href = uri;
    link.click();

    const jsonBlob = new Blob([JSON.stringify(trainingData, null, 2)], {
      type: 'application/json',
    });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.download = `${dateStr}.json`;
    jsonLink.href = jsonUrl;
    jsonLink.click();
    URL.revokeObjectURL(jsonUrl);

    setExportMode(false);
  }, [exportMode, trainingData]);

  // @ts-expect-error: suppressing unused variable for now
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
    !!trainingModalState;

  return (
    <>
      <div className={styles.appContainer}>
        <div className={styles.previewArea}>
          <PreviewArea
            data={trainingData}
            onDataChange={setTrainingData}
            buttonImages={buttonImages}
            imageRef={imageRef}
            isCumTimeDistVisible={isCumTimeDistVisible}
            exportMode={exportMode}
            onEditBlock={handleEditBlock}
          />
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
            onCumTimeDist={handleCumTimeDist}
            onLeft={handleLeft}
            onRight={handleRight}
            onLoadTraining={handleLoadTraining}
            onDownloadTraining={handleDownloadTraining}
            shorcutsDisabled={isAnyModalOpen}
            onEditCurrent={handleEditCurrent}
            canEdit={canEdit}
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

        {trainingModalState && (
          <TrainingBlockModal
            key={
              trainingModalState.mode === 'edit'
                ? trainingModalState.block!.id
                : `insert-${trainingModalState.index}`
            }
            isOpen={!!trainingModalState}
            onClose={() => setTrainingModalState(null)}
            onSave={handleSaveBlock}
            mode={trainingModalState.mode}
            buttonImage={buttonImages[trainingModalState.blockType]}
            optional={trainingModalState.blockType === 0}
            blockType={trainingModalState.blockType}
            totalBlocks={trainingData.blocks.length}
            initialBlock={trainingModalState.block}
            initialIndex={trainingModalState.index}
          />
        )}
        <input
          type="file"
          accept=".json,application/json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;

