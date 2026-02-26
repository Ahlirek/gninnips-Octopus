import styles from './PreviewArea.module.css';
import { BlockText } from './BlockText';
import type { NormalBlock, JumpsBlock, TrainingBlock, Loop } from '../types';
import type { TrainingData } from '../types';
import { Stage, Layer, Image, Rect, Text, Group, Line } from 'react-konva';
import Konva from 'konva';
import { useRef, useState, useEffect } from 'react';
import { FONT_SIZE, FONT_FAMILY, FONT_STYLE } from '../constants/theme';

interface PreviewAreaProps {
  data: TrainingData;
  onDataChange: (data: TrainingData) => void;
  buttonImages: HTMLImageElement[];
}

const IMAGE_WIDTH = 3840;
const IMAGE_HEIGHT = 2160;
const CELL_SIZE = 540;
const POSITION_IMAGE_SIZE = 270;
const COLS = 7;
const POS_IMAGE_OFFSET_Y = (CELL_SIZE - POSITION_IMAGE_SIZE) / 2;
const POS_IMAGE_OFFSET_X = (CELL_SIZE - POSITION_IMAGE_SIZE) * 0.75;

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDistance(n: number | undefined) {
  if (!n) {
    return 0;
  }
  if (n % 1 !== 0) {
    return n.toFixed(2);
  }
  return n;
}

function getTextXCenteredInPositionImage(textWidth: number): number {
  return POS_IMAGE_OFFSET_X + (POSITION_IMAGE_SIZE - textWidth) / 2;
}

function measureText(
  text: string,
  fontSize: number = FONT_SIZE,
  fontFamily: string = FONT_FAMILY,
  fontStyle = FONT_STYLE,
) {
  const temp = new Konva.Text({
    fontSize,
    fontFamily,
    fontStyle,
  });

  return temp.measureSize(text);
}

export default function PreviewArea({
  data,
  onDataChange,
  buttonImages,
}: PreviewAreaProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({
    width: 0,
    height: 0,
  });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: IMAGE_WIDTH, y: IMAGE_HEIGHT });

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const scaleX = width / IMAGE_WIDTH;
      const scaleY = height / IMAGE_HEIGHT;
      const newScale = Math.min(scaleX, scaleY);
      setScale(newScale);

      const scaledWidth = IMAGE_WIDTH * newScale;
      const scaledHeight = IMAGE_HEIGHT * newScale;
      const offsetX = (width - scaledWidth) / 2;
      const offsetY = (height - scaledHeight) / 2;
      setOffset({ x: offsetX, y: offsetY });

      console.log('Resize observer:', width, height);
      console.log('Resize ner:', scaledWidth, scaledHeight);
      setStageSize({ width, height });
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const getCellPosition = (index: number) => {
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    const offsetX = (IMAGE_WIDTH - COLS * CELL_SIZE) / 2;
    return { x: offsetX + col * CELL_SIZE, y: row * CELL_SIZE };
    // return { x: col * CELL_SIZE, y: row * CELL_SIZE };
  };

  const handleDragEnd = (
    e: Konva.KonvaEventObject<DragEvent>,
    draggedIndex: number,
  ) => {
    const pos = e.target.position();
    console.log('position');
    console.log(e.target.position());
    const col = Math.round(pos.x / CELL_SIZE); // TODO: Afecta el offset del return de getCellPosition?
    const row = Math.round(pos.y / CELL_SIZE);
    const targetIndex = row * COLS + col;

    if (
      targetIndex < 0 ||
      targetIndex >= data.blocks.length ||
      targetIndex === draggedIndex
    ) {
      const { x, y } = getCellPosition(draggedIndex);
      e.target.position({ x, y });
      return;
    }

    const newBlocks = [...data.blocks];
    [newBlocks[draggedIndex], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[draggedIndex],
    ];

    // El loop sigue a su bloque, no creo quererlo
    // const newLoops = data.loops.map((loop) => ({
    //   start:
    //     loop.start === draggedIndex
    //       ? targetIndex
    //       : loop.start === targetIndex
    //         ? draggedIndex
    //         : loop.start,
    //   end:
    //     loop.end === draggedIndex
    //       ? targetIndex
    //       : loop.end === targetIndex
    //         ? draggedIndex
    //         : loop.end,
    //   repetitions: loop.repetitions,
    // }));
    // onDataChange({ ...data, blocks: newBlocks, loops: newLoops });

    onDataChange({ ...data, blocks: newBlocks });

    // Snap to grid
    const newPos = getCellPosition(targetIndex);
    e.target.position(newPos);
  };

  const renderBlock = (block: TrainingBlock, index: number) => {
    const { x, y } = getCellPosition(index);
    console.log(x, y);
    const isJump = block.kind === 'jump';
    const img = buttonImages[block.type - 1];

    const hrText = `${block.hr}%`;
    let numJumpsText = '';
    let rpmText = '';
    let timeDistText = '';
    if (isJump) {
      numJumpsText = `${block.jumps}`;
      rpmText = `${block.rpmUp}/${block.rpmDown}`;
      if (block.metric === 'distance') {
        timeDistText = `${formatDistance(block.distanceUp)}/${formatDistance(block.distanceDown)}`;
      } else {
        timeDistText = `${formatTime(block.timeUp || 0)}/${formatTime(block.timeDown || 0)}`;
      }
    } else {
      rpmText = `${block.rpm}`;
      if (block.metric === 'distance') {
        timeDistText = `${formatDistance(block.distance)}`;
      } else {
        timeDistText = formatTime(block.time || 0);
      }
    }

    const hrTextDim = measureText(hrText);
    const hrX = POS_IMAGE_OFFSET_X - hrTextDim.width;
    const hrY = (CELL_SIZE - hrTextDim.height) / 2;

    const numJumpsTextDim = measureText(numJumpsText);
    const numJumpsX = getTextXCenteredInPositionImage(numJumpsTextDim.width);
    const numJumpsY = (CELL_SIZE - numJumpsTextDim.height) / 2;

    const rpmTextDim = measureText(rpmText);
    const rpmX = getTextXCenteredInPositionImage(rpmTextDim.width);
    const rpmY = POS_IMAGE_OFFSET_Y - rpmTextDim.height;

    const timeDistTextDim = measureText(timeDistText);
    const timeDistX = getTextXCenteredInPositionImage(timeDistTextDim.width);
    const timeDistY = POS_IMAGE_OFFSET_Y + POSITION_IMAGE_SIZE;

    return (
      <Group
        key={block.id}
        x={x}
        y={y}
        draggable
        onDragEnd={(e) => handleDragEnd(e, index)}
      >
        <Rect
          width={CELL_SIZE}
          height={CELL_SIZE}
          fill="white"
          stroke="black"
          strokeWidth={2}
        />
        {img && (
          <Image
            image={img}
            width={POSITION_IMAGE_SIZE}
            height={POSITION_IMAGE_SIZE}
            x={POS_IMAGE_OFFSET_X}
            y={POS_IMAGE_OFFSET_Y}
          />
        )}
        <BlockText text={hrText} x={hrX} y={hrY} />
        <BlockText text={rpmText} x={rpmX} y={rpmY} />
        <BlockText text={numJumpsText} x={numJumpsX} y={numJumpsY} />
        <BlockText text={timeDistText} x={timeDistX} y={timeDistY} />
      </Group>
    );
  };

  const renderCursor = () => {
    const { x, y } = getCellPosition(data.cursor);
    return (
      <Rect
        x={x}
        y={y}
        width={CELL_SIZE}
        height={CELL_SIZE}
        stroke="red"
        strokeWidth={4}
        dash={[10, 5]}
      />
    );
  };

  const renderLoops = () => {
    const loopFontSize = 500;
    return data.loops.map((loop, i) => {
      const startPos = getCellPosition(loop.start);
      const endPos = getCellPosition(loop.end);
      const xStart = startPos.x - 50;
      const xEnd = endPos.x + CELL_SIZE - 60;
      const startLoopText = '[';
      const endLoopText = `]x${loop.repetitions}`;
      const startLoopTextDim = measureText(
        startLoopText,
        loopFontSize,
        FONT_FAMILY,
        'normal',
      );
      //TODO: SI SON VARIOS LOOP HAY QUE MOVER EL X PARA QUE SE VEAN AMBOS
      //TODO:un loop ocupa un espacio de cuadrito
      const y = startPos.y - 10;
      console.log('y', y, startLoopTextDim.height);

      return (
        <Group key={`loop-${i}`}>
          <BlockText
            text={startLoopText}
            x={xStart}
            y={y}
            fontSize={loopFontSize}
            fontStyle="normal"
            fill="red"
          />
          <BlockText
            text={endLoopText}
            x={xEnd}
            y={y}
            fontSize={loopFontSize}
            fontStyle="normal"
            fill="red"
          />
        </Group>
      );
    });
  };

  const renderInfo = () => {
    const totalTime = data.blocks.reduce((acc, b) => {
      if (b.metric === 'time') {
        if (b.kind === 'jump') {
          return acc + ((b.timeUp || 0) + (b.timeDown || 0)) * b.jumps;
        } else {
          return acc + (b.time || 0);
        }
      }
      return acc;
    }, 0);

    const totalDistance = data.blocks.reduce((acc, b) => {
      if (b.metric === 'distance') {
        if (b.kind === 'jump') {
          return acc + ((b.distanceUp || 0) + (b.distanceDown || 0)) * b.jumps;
        } else {
          return acc + (b.distance || 0);
        }
      }
      return acc;
    }, 0);

    const dateStr = data.date
      ? data.date.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        })
      : '--';
    //TODO: CENTRAR TEXTOS
    const IMAGE_MARGIN = 30; // INFO: ESTO SE CALCULA!
    const infoFontSize = 90;
    const totalTimeText = `Tt: ${formatTime(totalTime)}`;
    const totalTimeStrSize = measureText(totalTimeText, infoFontSize);
    const totalDistText = `Dt: ${formatDistance(totalDistance)} km`;
    const totalDistSize = measureText(totalDistText, infoFontSize);
    const maxTimeDistSizeText = Math.max(
      totalTimeStrSize.width,
      totalDistSize.width,
    );
    const infoX = IMAGE_WIDTH - Math.ceil(maxTimeDistSizeText) - IMAGE_MARGIN;
    console.log(
      totalDistSize.width,
      totalTimeStrSize.width,
      maxTimeDistSizeText,
      'heh',
    );
    console.log('infoX', infoX);

    return (
      //TODO: verificar posicion AQUÏ me quede ver si posiciones en group o en block text
      <>
        <Group>
          <BlockText
            text={dateStr}
            x={IMAGE_MARGIN}
            y={IMAGE_MARGIN}
            fontSize={infoFontSize}
          />
        </Group>
        <Group y={50}>
          <BlockText text={data.title} x={300} y={0} fontSize={255} />
        </Group>
        <Group x={infoX} y={IMAGE_MARGIN}>
          <BlockText
            text={totalTimeText}
            x={0}
            y={100}
            fontSize={infoFontSize}
          />
          <BlockText
            text={totalDistText}
            x={0}
            y={200}
            fontSize={infoFontSize}
          />
        </Group>
      </>
    );
  };

  return (
    <div ref={containerRef} className={styles.stageDiv}>
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        ref={stageRef}
        style={{ border: '1px solid #ccc' }}
      >
        <Layer>
          <Rect width={stageSize.width} height={stageSize.height} fill="gray" />
          <Group x={offset.x} y={offset.y} scaleX={scale} scaleY={scale}>
            {data.blocks.map((block, i) => renderBlock(block, i))}
            {/* Cursor */}
            {renderCursor()}
            {/* Loops */}
            {renderLoops()}
            {renderInfo()}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}

