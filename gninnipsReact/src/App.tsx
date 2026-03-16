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
import LoopModal from './components/LoopModal.tsx';
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
    mode: 'insert' | 'edit';
    blockType: number;
    block?: TrainingBlock;
    index?: number;
  } | null>(null);
  const [loopModalState, setLoopModalState] = useState<{
    mode: 'create' | 'edit';
    loop?: Loop;
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
      setTrainingModalState({
        mode: 'insert',
        blockType,
        index: trainingData.cursor,
      });
    },
    [trainingData.cursor],
  );

  const cannotEditBlockAndCreateLoop =
    trainingData.cursor >= trainingData.blocks.length;

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

  const handleEditBlock = useCallback(
    (index: number, block: TrainingBlock) => {
      setTrainingModalState({
        mode: 'edit',
        blockType: block.type,
        block,
        index,
      });
      setTrainingData({
        ...trainingData,
        cursor: index,
      });
    },
    [trainingData],
  );

  const recomputeLoopParents = useCallback((loops: Loop[]): Loop[] => {
    const sorted = [...loops].sort((a, b) => {
      const rangeA = a.end - a.start;
      const rangeB = b.end - b.start;
      if (rangeA !== rangeB) {
        return rangeA - rangeB;
      }
      if (a.start !== b.start) {
        return a.start - b.start;
      }
      return Number(a.id) - Number(b.id);
    });

    return sorted.map((loop) => {
      const parent = sorted.find((parentLoop) => {
        if (parentLoop.start === loop.start && parentLoop.end === loop.end) {
          return parentLoop.id > loop.id;
        }
        return (
          parentLoop.id !== loop.id &&
          parentLoop.start <= loop.start &&
          parentLoop.end >= loop.end
        );
      });
      return { ...loop, parentId: parent?.id || null };
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
          ...loop,
          start: loop.start >= insertIndex ? loop.start + 1 : loop.start,
          end: loop.end >= insertIndex ? loop.end + 1 : loop.end,
          repetitions: loop.repetitions,
        }));
        const loopsWithParents = recomputeLoopParents(newLoops);

        return {
          ...prev,
          blocks: newBlocks,
          loops: loopsWithParents,
          cursor: insertIndex + 1,
        };
      });
    },
    [recomputeLoopParents],
  );

  const handleUpdateBlock = useCallback(
    (oldIndex: number, newBlock: TrainingBlock, newIndex: number) => {
      setTrainingData((prev) => {
        const blocksAfterRemove = prev.blocks.filter((_, i) => i !== oldIndex);
        const newBlocks = [...blocksAfterRemove];
        newBlocks.splice(newIndex, 0, newBlock);

        return {
          ...prev,
          blocks: newBlocks,
        };
      });
    },
    [],
  );

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
  }, []);
  const handleTitleModalClose = useCallback(() => {
    setIsTitleModalOpen(false);
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
  }, []);
  const handleClickOutsideDatePicker = useCallback(() => {
    setIsDatePickerOpen(false);
  }, []);

  const handleDeleteBlock = useCallback(
    (index?: number) => {
      setTrainingData((prev) => {
        if (prev.blocks.length === 0) {
          return prev;
        }
        const cursorOrLastElement =
          prev.cursor === prev.blocks.length ? prev.cursor - 1 : prev.cursor;
        const blockIndexToDelete = index ?? cursorOrLastElement;
        const newBlocks = prev.blocks.filter(
          (_, i) => i !== blockIndexToDelete,
        );
        const newLoops = prev.loops
          .map((loop) => ({
            ...loop,
            start:
              loop.start > blockIndexToDelete ? loop.start - 1 : loop.start,
            end: loop.end > blockIndexToDelete ? loop.end - 1 : loop.end,
            repetitions: loop.repetitions,
          }))
          .filter((loop) => loop.start <= loop.end);
        const loopsWithParents = recomputeLoopParents(newLoops);
        const newCursor = Math.min(prev.cursor, newBlocks.length);
        return {
          ...prev,
          blocks: newBlocks,
          loops: loopsWithParents,
          cursor: newCursor,
        };
      });
    },
    [recomputeLoopParents],
  );

  const handleCumTimeDist = useCallback(() => {
    setIsCumTimeDistVisible((prev) => !prev);
  }, []);

  const handleLeft = useCallback(() => {
    setTrainingData((prev) => ({
      ...prev,
      cursor: Math.max(0, prev.cursor - 1),
    }));
  }, []);

  const handleRight = useCallback(() => {
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

  const findLoopUnderCursor = useCallback(
    (cursor: number, loops: Loop[]): Loop | undefined => {
      const containing = loops.filter(
        (l) => l.start <= cursor && l.end >= cursor,
      );
      if (containing.length === 0) {
        return undefined;
      }
      containing.sort((a, b) => {
        const rangeA = a.end - a.start;
        const rangeB = b.end - b.start;
        if (rangeA !== rangeB) {
          return rangeA - rangeB;
        }
        return b.start - a.start;
      });
      return containing[0];
    },
    [],
  );
  const canEditLoop = findLoopUnderCursor(
    trainingData.cursor,
    trainingData.loops,
  );
  console.log(canEditLoop, 'EDIT!');

  const handleEditLoopModal = useCallback(() => {
    const loopUnderCursor = findLoopUnderCursor(
      trainingData.cursor,
      trainingData.loops,
    );
    if (loopUnderCursor) {
      setLoopModalState({ mode: 'edit', loop: loopUnderCursor });
    }
  }, [trainingData.cursor, trainingData.loops, findLoopUnderCursor]);

  const handleCreateLoopModal = useCallback(() => {
    setLoopModalState({ mode: 'create' });
  }, []);

  const handleSaveLoop = useCallback(
    (loopData: Omit<Loop, 'id'> & { id?: string }) => {
      setTrainingData((prev) => {
        let newLoops: Loop[];
        if (loopData.id) {
          newLoops = prev.loops.map((l) =>
            l.id === loopData.id ? ({ ...loopData } as Loop) : l,
          );
        } else {
          const newLoop: Loop = {
            ...loopData,
            id: Date.now().toString(),
          };
          newLoops = [...prev.loops, newLoop];
        }
        const loopsWithParents = recomputeLoopParents(newLoops);
        console.log(loopsWithParents);
        return { ...prev, loops: loopsWithParents };
      });
    },
    [recomputeLoopParents],
  );

  const handleDeleteLoop = useCallback((id: string) => {
    setTrainingData((prev) => {
      const loopToDelete = prev.loops.find((l) => l.id === id);
      if (!loopToDelete) {
        return prev;
      }
      const newLoops = prev.loops
        .filter((l) => l.id !== id)
        .map((l) => {
          if (l.parentId === id) {
            return { ...l, parentId: loopToDelete.parentId };
          }
          return l;
        });

      return { ...prev, loops: newLoops };
    });
  }, []);

  const isAnyModalOpen =
    isTitleModalOpen ||
    isConfirmationModalOpen ||
    isDatePickerOpen ||
    !!trainingModalState ||
    !!loopModalState;

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
            onDelete={handleDeleteBlock}
            onEditLoop={handleEditLoopModal}
            onCreateLoop={handleCreateLoopModal}
            onCumTimeDist={handleCumTimeDist}
            onLeft={handleLeft}
            onRight={handleRight}
            onLoadTraining={handleLoadTraining}
            onDownloadTraining={handleDownloadTraining}
            shorcutsDisabled={isAnyModalOpen}
            onEditCurrent={handleEditCurrent}
            cannotEditBlockAndCreateLoop={cannotEditBlockAndCreateLoop}
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

        {!!trainingModalState && (
          <TrainingBlockModal
            key={
              trainingModalState.mode === 'edit'
                ? trainingModalState.block!.id
                : `insert-${trainingModalState.index}`
            }
            onClose={() => setTrainingModalState(null)}
            onSave={handleSaveBlock}
            onDelete={handleDeleteBlock}
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
        {!!loopModalState && (
          <LoopModal
            onClose={() => setLoopModalState(null)}
            onSave={handleSaveLoop}
            onDelete={
              loopModalState.mode === 'edit' ? handleDeleteLoop : undefined
            }
            mode={loopModalState.mode}
            initialLoop={loopModalState.loop}
            cursor={trainingData.cursor}
            totalBlocks={trainingData.blocks.length}
            existingLoops={trainingData.loops}
          />
        )}
      </div>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;

