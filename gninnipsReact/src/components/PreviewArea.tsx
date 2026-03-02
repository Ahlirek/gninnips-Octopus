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
const CELL_WIDTH = 540; // INFO: 429 ocupados max
const CELL_HEIGHT = 460; //INFO: 420 ocupados
const POSITION_IMAGE_SIZE = 270;
const LOOP_FONT_SIZE = 500;
const COLS = 7;
const ROWS = 4;
const POS_IMAGE_OFFSET_Y = (CELL_HEIGHT - POSITION_IMAGE_SIZE) / 2;
const POS_IMAGE_OFFSET_X = (CELL_WIDTH - POSITION_IMAGE_SIZE) * 0.7;
const IMAGE_MARGIN = (IMAGE_WIDTH - COLS * CELL_WIDTH) / 2;
const IMAGE_BLOCKS_START_Y = IMAGE_HEIGHT - ROWS * CELL_HEIGHT - IMAGE_MARGIN;

function formatTime(seconds: number | undefined): string {
  if (!seconds) {
    return '';
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
function formatTimeDistValue(
  upValue: number | undefined,
  downValue: number | undefined,
  formatType: 'distance' | 'time' | 'rpm',
): string {
  let upValueFormatted = '';
  let downValueFormatted = '';
  if (formatType === 'distance') {
    upValueFormatted = formatDistance(upValue);
    downValueFormatted = formatDistance(downValue);
  } else if (formatType === 'time') {
    upValueFormatted = formatTime(upValue);
    downValueFormatted = formatTime(downValue);
  } else {
    upValueFormatted = upValue ? String(upValue) : '';
    downValueFormatted = downValue ? String(downValue) : '';
  }

  if (upValue && downValue) {
    return `${upValueFormatted}/${downValueFormatted}`;
  }
  return `${upValueFormatted}${downValueFormatted}`;
}

function formatDistance(distance: number | undefined): string {
  if (!distance) {
    return '';
  }
  if (distance % 1 !== 0) {
    return distance.toFixed(2);
  }
  return String(distance);
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

      setStageSize({ width, height });
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const getCellPosition = (index: number) => {
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    return {
      x: IMAGE_MARGIN + col * CELL_WIDTH,
      y: row * CELL_HEIGHT + IMAGE_BLOCKS_START_Y,
    };
    // return { x: col * CELL_SIZE, y: row * CELL_SIZE };
  };

  const handleDragEnd = (
    e: Konva.KonvaEventObject<DragEvent>,
    draggedIndex: number,
  ) => {
    const pos = e.target.position();
    console.log('position');
    console.log(e.target.position());
    const col = Math.round(pos.x / CELL_WIDTH); // TODO: Afecta el offset del return de getCellPosition?
    const row = Math.round(pos.y / CELL_WIDTH);
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
    const isJump = block.kind === 'jump';
    const img = buttonImages[block.type - 1];

    const hrText = block.hr ? `${block.hr}%` : '';
    let numJumpsText = '';
    let rpmText = '';
    let timeDistText = '';
    if (isJump) {
      numJumpsText = `${block.jumps || ''}`;
      rpmText = formatTimeDistValue(block.rpmUp, block.rpmDown, 'rpm');
      if (block.metric === 'distance') {
        timeDistText = formatTimeDistValue(
          block.distanceUp,
          block.distanceDown,
          block.metric,
        );
      } else {
        timeDistText = formatTimeDistValue(
          block.timeUp,
          block.timeDown,
          block.metric,
        );
      }
    } else {
      rpmText = `${block.rpm}`;
      if (block.metric === 'distance') {
        timeDistText = `${formatDistance(block.distance)}`;
      } else {
        timeDistText = formatTime(block.time);
      }
    }

    const hrTextSize = measureText(hrText);
    const hrX = POS_IMAGE_OFFSET_X - hrTextSize.width;
    const hrY = (CELL_HEIGHT - hrTextSize.height) / 2;

    const numJumpsTextSize = measureText(numJumpsText);
    const numJumpsX = getTextXCenteredInPositionImage(numJumpsTextSize.width);
    const numJumpsY = (CELL_HEIGHT - numJumpsTextSize.height) / 2;

    const rpmTextSize = measureText(rpmText);
    const rpmX = getTextXCenteredInPositionImage(rpmTextSize.width);
    const rpmY = POS_IMAGE_OFFSET_Y - rpmTextSize.height;

    const timeDistTextSize = measureText(timeDistText);
    const timeDistX = getTextXCenteredInPositionImage(timeDistTextSize.width);
    const timeDistY = POS_IMAGE_OFFSET_Y + POSITION_IMAGE_SIZE;
    console.log('x', hrTextSize.width);
    console.log('y', rpmTextSize.height, timeDistTextSize.height);

    return (
      <Group
        key={block.id}
        x={x}
        y={y}
        draggable
        onDragEnd={(e) => handleDragEnd(e, index)}
      >
        <Rect
          width={CELL_WIDTH}
          height={CELL_HEIGHT}
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
        width={CELL_WIDTH}
        height={CELL_HEIGHT}
        stroke="red"
        strokeWidth={4}
        dash={[10, 5]}
      />
    );
  };

  const renderLoops = () => {
    return data.loops.map((loop, i) => {
      const startPos = getCellPosition(loop.start);
      const endPos = getCellPosition(loop.end);
      const xStart = startPos.x - 50;
      const xEnd = endPos.x + CELL_WIDTH - 60;
      const startLoopText = '[';
      const endLoopText = `]x${loop.repetitions}`;
      const startLoopTextDim = measureText(
        startLoopText,
        LOOP_FONT_SIZE,
        FONT_FAMILY,
        'normal',
      );
      //TODO: SI SON VARIOS LOOP HAY QUE MOVER EL X PARA QUE SE VEAN AMBOS
      //TODO:un loop ocupa un espacio de cuadrito
      const y = startPos.y - 10;

      return (
        <Group key={`loop-${i}`}>
          <BlockText
            text={startLoopText}
            x={xStart}
            y={y}
            fontSize={LOOP_FONT_SIZE}
            fontStyle="normal"
            fill="red"
          />
          <BlockText
            text={endLoopText}
            x={xEnd}
            y={y}
            fontSize={LOOP_FONT_SIZE}
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
    const infoFontSize = 90;
    const titleFontSize = 255;
    const totalTimeText = `Tt: ${formatTime(totalTime) || '00:00'}`;
    const totalTimeStrSize = measureText(totalTimeText, infoFontSize);
    const totalDistText = `Dt: ${formatDistance(totalDistance) || 0} km`;
    const totalDistSize = measureText(totalDistText, infoFontSize);
    const maxTimeDistSizeText = Math.max(
      totalTimeStrSize.width,
      totalDistSize.width,
    );
    const infoX = IMAGE_WIDTH - Math.ceil(maxTimeDistSizeText) - IMAGE_MARGIN;
    const titleSize = measureText(data.title, titleFontSize);
    console.log('titlesize', titleSize.height);

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
        <Group y={IMAGE_MARGIN}>
          <BlockText text={data.title} x={300} y={0} fontSize={255} />
        </Group>
        <Group x={infoX} y={IMAGE_MARGIN}>
          <BlockText text={totalTimeText} x={0} y={0} fontSize={infoFontSize} />
          <BlockText
            text={totalDistText}
            x={0}
            y={100} // distancia de la de arriba
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

