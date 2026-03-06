import styles from './PreviewArea.module.css';
import { BlockText } from './BlockText';
import type { TrainingBlock } from '../types';
import type { TrainingData } from '../types';
import { Stage, Layer, Image, Rect, Group } from 'react-konva';
import Konva from 'konva';
import { useRef, useState, useLayoutEffect, useMemo } from 'react';
import { FONT_SIZE, FONT_FAMILY, FONT_STYLE } from '../constants/theme';
import { IMAGE_WIDTH, IMAGE_HEIGHT } from '../constants/image';

interface PreviewAreaProps {
  data: TrainingData;
  onDataChange: (data: TrainingData) => void;
  buttonImages: HTMLImageElement[];
  imageRef: React.Ref<Konva.Group>;
  isSumTimeVisible: boolean;
  exportMode: boolean;
  onEditBlock?: (index: number, block: TrainingBlock) => void;
}

const CELL_WIDTH = 540; // INFO: 429 ocupados max
const CELL_HEIGHT = 460; //INFO: 420 ocupados
const POSITION_IMAGE_SIZE = 270;
const LOOP_FONT_SIZE = 500;
const COLS = 7;
const ROWS = 4;
const TITLE_FONT_SIZE = 250;
const INFO_FONT_SIZE = 90;
const TITLE_PADDING = 30;
const CUMULATIVE_FONT_SIZE = 55;
const POS_IMAGE_OFFSET_Y = (CELL_HEIGHT - POSITION_IMAGE_SIZE) / 2;
const POS_IMAGE_OFFSET_X = (CELL_WIDTH - POSITION_IMAGE_SIZE) * 0.72;
const IMAGE_MARGIN = (IMAGE_WIDTH - COLS * CELL_WIDTH) / 2;
const IMAGE_BLOCKS_START_Y = IMAGE_HEIGHT - ROWS * CELL_HEIGHT - IMAGE_MARGIN;
const TIME_COLOR = '#2563eb';
const DISTANCE_COLOR = '#16a34a';

function formatTime(seconds: number | undefined): string {
  if (!seconds) {
    return '';
  }
  const minsWithHours = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const mins = minsWithHours % 60;
  const hours = Math.floor(minsWithHours / 60);
  const hourStr = hours ? `${hours}:` : '';
  const minStr = hours ? mins.toString().padStart(2, '0') : mins;
  const secsStr = secs.toString().padStart(2, '0');
  return `${hourStr}${minStr}:${secsStr}`;
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

function formatUpDownValues(
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

const getBlockTime = (block: TrainingBlock): number => {
  if (block.metric !== 'time') {
    return 0;
  }
  if (block.kind === 'jump') {
    return ((block.timeUp || 0) + (block.timeDown || 0)) * (block.jumps || 1);
  } else {
    return block.time || 0;
  }
};

const getBlockDistance = (block: TrainingBlock): number => {
  if (block.metric !== 'distance') {
    return 0;
  }
  if (block.kind === 'jump') {
    return (
      ((block.distanceUp || 0) + (block.distanceDown || 0)) * (block.jumps || 1)
    );
  } else {
    return block.distance || 0;
  }
};

export default function PreviewArea({
  data,
  onDataChange,
  buttonImages,
  imageRef,
  isSumTimeVisible,
  exportMode,
  onEditBlock,
}: PreviewAreaProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({
    width: 0,
    height: 0,
  });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const { cumulativeTime, cumulativeDistance } = useMemo(() => {
    const cumTime: number[] = [];
    const cumDist: number[] = [];
    let timeSum = 0;
    let distSum = 0;
    data.blocks.forEach((block, idx) => {
      timeSum += getBlockTime(block);
      distSum += getBlockDistance(block);
      cumTime[idx] = timeSum;
      cumDist[idx] = distSum;
    });
    return {
      cumulativeTime: cumTime,
      cumulativeDistance: cumDist,
    };
  }, [data.blocks]);

  useLayoutEffect(() => {
    if (!divRef.current) {
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

      console.log(width, height);
      setStageSize({ width, height });
    });
    resizeObserver.observe(divRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const getCellPosition = (index: number) => {
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    return {
      x: IMAGE_MARGIN + col * CELL_WIDTH,
      y: IMAGE_BLOCKS_START_Y + row * CELL_HEIGHT,
    };
  };

  const handleDragEnd = (
    e: Konva.KonvaEventObject<DragEvent>,
    draggedIndex: number,
  ) => {
    const pos = e.target.position();
    const col = Math.round((pos.x - IMAGE_MARGIN) / CELL_WIDTH);
    const row = Math.round((pos.y - IMAGE_BLOCKS_START_Y) / CELL_HEIGHT);
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

    // El loop sigue a su bloque
    const newLoops = data.loops.map((loop) => ({
      start:
        loop.start === draggedIndex
          ? targetIndex
          : loop.start === targetIndex
            ? draggedIndex
            : loop.start,
      end:
        loop.end === draggedIndex
          ? targetIndex
          : loop.end === targetIndex
            ? draggedIndex
            : loop.end,
      repetitions: loop.repetitions,
    }));
    onDataChange({ ...data, blocks: newBlocks, loops: newLoops });

    // onDataChange({ ...data, blocks: newBlocks });

    const newPos = getCellPosition(targetIndex);
    e.target.position(newPos);
  };

  const renderBlock = (block: TrainingBlock, index: number) => {
    const { x, y } = getCellPosition(index);
    const isJump = block.kind === 'jump';
    const img = buttonImages[block.type];

    const { x: x2, y: y2 } = getCellPosition(index + 1);
    const xNext = x2 - x;
    const yNext = y2 - y;
    let cumulativeText = '';

    const hrText = block.hr ? `${block.hr}%` : '';
    let numJumpsText = '';
    let rpmText = '';
    let timeDistText = '';
    if (isJump) {
      numJumpsText = `${block.jumps || ''}`;
      rpmText = formatUpDownValues(block.rpmUp, block.rpmDown, 'rpm');
      if (block.metric === 'distance') {
        timeDistText = formatUpDownValues(
          block.distanceUp,
          block.distanceDown,
          block.metric,
        );
        if (block.distanceUp || block.distanceDown) {
          cumulativeText = formatDistance(cumulativeDistance[index]);
          cumulativeText += cumulativeText ? 'k' : '';
        }
      } else {
        timeDistText = formatUpDownValues(
          block.timeUp,
          block.timeDown,
          block.metric,
        );
        if (block.timeUp || block.timeDown) {
          cumulativeText = formatTime(cumulativeTime[index]);
        }
      }
    } else {
      rpmText = `${block.rpm}`;
      if (block.metric === 'distance') {
        timeDistText = `${formatDistance(block.distance)}`;
        if (block.distance) {
          cumulativeText = formatDistance(cumulativeDistance[index]);
          cumulativeText += cumulativeText ? 'k' : '';
        }
      } else {
        timeDistText = formatTime(block.time);
        if (block.time) {
          cumulativeText = formatTime(cumulativeTime[index]);
        }
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
    if (index === data.blocks.length - 1) {
      cumulativeText = '';
    }

    return (
      <Group
        key={block.id}
        x={x}
        y={y}
        draggable
        onDragEnd={(e) => handleDragEnd(e, index)}
        onClick={() => onEditBlock?.(index, block)}
      >
        <Rect width={CELL_WIDTH} height={CELL_HEIGHT} stroke="black" />
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
        {isSumTimeVisible && (
          <BlockText
            text={cumulativeText}
            x={xNext + 7}
            y={yNext + 10}
            fontSize={CUMULATIVE_FONT_SIZE}
            fill={block.metric === 'time' ? TIME_COLOR : DISTANCE_COLOR}
          />
        )}
      </Group>
    );
  };

  const renderCursor = () => {
    if (exportMode) {
      return null;
    }
    const { x, y } = getCellPosition(data.cursor);
    return (
      <Rect
        x={x}
        y={y}
        width={CELL_WIDTH}
        height={CELL_HEIGHT}
        stroke="red"
        strokeWidth={8}
        dash={[15, 10]}
      />
    );
  };

  const renderLoops = () => {
    return data.loops.map((loop, i) => {
      const startPos = getCellPosition(loop.start);
      const endPos = getCellPosition(loop.end);
      const loopOpenBracketX = startPos.x - 50;
      const loopClosingBracketX = endPos.x + CELL_WIDTH - 60;
      const loopY = startPos.y - 50;
      const startLoopText = '[';
      const endLoopText = `]x${loop.repetitions}`;
      //TODO: SI SON VARIOS LOOP HAY QUE MOVER EL X PARA QUE SE VEAN AMBOS
      //TODO:un loop ocupa un espacio de cuadrito

      return (
        <Group key={`loop-${i}`}>
          <BlockText
            text={startLoopText}
            x={loopOpenBracketX}
            y={loopY}
            fontSize={LOOP_FONT_SIZE}
            fontStyle="normal"
            fill="red"
          />
          <BlockText
            text={endLoopText}
            x={loopClosingBracketX}
            y={loopY}
            fontSize={LOOP_FONT_SIZE}
            fontStyle="normal"
            fill="red"
          />
        </Group>
      );
    });
  };

  const renderInfo = () => {
    const totalTime = cumulativeTime[data.blocks.length - 1] || 0;
    const totalDistance = cumulativeDistance[data.blocks.length - 1] || 0;

    const dateStr = data.date
      ? data.date.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        })
      : '--';
    const dateStrSize = measureText(dateStr, INFO_FONT_SIZE);
    const totalTimeText = `Tt: ${formatTime(totalTime) || '00:00'}`;
    const totalTimeStrSize = measureText(totalTimeText, INFO_FONT_SIZE);
    const totalDistText = `Dt: ${formatDistance(totalDistance) || 0} km`;
    const totalDistStrSize = measureText(totalDistText, INFO_FONT_SIZE);
    const biggerTimeDistTextWidth = Math.max(
      totalTimeStrSize.width,
      totalDistStrSize.width,
    );
    const timeDistStartX =
      IMAGE_WIDTH - IMAGE_MARGIN - Math.ceil(biggerTimeDistTextWidth);
    const titleStartX = IMAGE_MARGIN + dateStrSize.width + TITLE_PADDING;
    const titleEndX = timeDistStartX - TITLE_PADDING;
    const titleMaxWidth = titleEndX - titleStartX;

    return (
      <>
        <Group x={IMAGE_MARGIN} y={IMAGE_MARGIN}>
          <BlockText text={dateStr} fontSize={INFO_FONT_SIZE} />
        </Group>
        <Group x={titleStartX}>
          <BlockText
            text={data.title}
            fontSize={TITLE_FONT_SIZE}
            width={titleMaxWidth}
            align={'center'}
            wrap={'none'}
          />
        </Group>
        <Group x={timeDistStartX} y={IMAGE_MARGIN}>
          <BlockText
            text={totalTimeText}
            width={biggerTimeDistTextWidth}
            align={'center'}
            fontSize={INFO_FONT_SIZE}
          />
          <BlockText
            text={totalDistText}
            y={totalTimeStrSize.height}
            width={biggerTimeDistTextWidth}
            align={'center'}
            fontSize={INFO_FONT_SIZE}
          />
        </Group>
      </>
    );
  };

  return (
    <div ref={divRef} className={styles.stageDiv}>
      <Stage width={stageSize.width} height={stageSize.height} ref={stageRef}>
        <Layer>
          <Group
            ref={imageRef}
            x={offset.x}
            y={offset.y}
            scaleX={scale}
            scaleY={scale}
          >
            <Rect
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              fill="white"
              stroke={exportMode ? undefined : 'black'}
              strokeWidth={exportMode ? 0 : 5}
            />
            {renderInfo()}
            {renderCursor()}
            {renderLoops()}
            {data.blocks.map((block, i) => renderBlock(block, i))}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}

