import styles from './PreviewArea.module.css';
import { BlockText } from './BlockText';
import type { TrainingData, TrainingBlock, Loop } from '../types';
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
  isCumTimeDistVisible: boolean;
  exportMode: boolean;
  onEditBlock?: (index: number, block: TrainingBlock) => void;
}

const COLS = 7;
const ROWS = 4;
const CELL_WIDTH = 540; // INFO: 429 ocupados max
const CELL_HEIGHT = 460; //INFO: 420 ocupados
const POSITION_IMAGE_SIZE = 270;
const LOOP_FONT_SIZE = 500;
const TITLE_FONT_SIZE = 250;
const INFO_FONT_SIZE = 90;
const TITLE_PADDING = 30;
const CUMULATIVE_FONT_SIZE = 55;
const POS_IMAGE_OFFSET_Y = (CELL_HEIGHT - POSITION_IMAGE_SIZE) / 2;
const POS_IMAGE_OFFSET_X = (CELL_WIDTH - POSITION_IMAGE_SIZE) * 0.72;
const IMAGE_MARGIN = (IMAGE_WIDTH - COLS * CELL_WIDTH) / 2;
const IMAGE_BLOCKS_START_Y = IMAGE_HEIGHT - ROWS * CELL_HEIGHT - IMAGE_MARGIN;
const LAST_CUM_TIME_COLOR = '#1a4bb8';
const FIRST_CUM_TIME_COLOR = '#9bb7ff';
const LAST_CUM_DISTANCE_COLOR = '#0f7a37';
const FIRST_CUM_DISTANCE_COLOR = '#6fda94';
const LOOP_COLORS = ['#ff0000', '#0000ff', '#008000', '#800080', '#ffa500'];

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
  fontStyle = FONT_STYLE,
  fontFamily: string = FONT_FAMILY,
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

const expandSequence = (blocks: TrainingBlock[], loops: Loop[]): number[] => {
  const sortedLoops = [...loops].sort(
    (a, b) => a.start - b.start || b.end - a.end,
  );
  function expandRange(start: number, end: number): number[] {
    const result: number[] = [];
    let i = start;
    while (i <= end) {
      const loop = sortedLoops.find((l) => l.start === i && l.end <= end);
      if (loop) {
        const repBlocks = expandRange(i + 1, loop.end);
        for (let rep = 0; rep < loop.repetitions; rep++) {
          result.push(i);
          result.push(...repBlocks);
        }
        i = loop.end;
      } else {
        result.push(i);
      }
      i++;
    }
    return result;
  }

  if (blocks.length === 0) {
    return [];
  }
  return expandRange(0, blocks.length - 1);
};

export default function PreviewArea({
  data,
  onDataChange,
  buttonImages,
  imageRef,
  isCumTimeDistVisible,
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

  const { cumulativeTime, cumulativeDistance, expandedBlocks } = useMemo(() => {
    const expandedBlocks = expandSequence(data.blocks, data.loops);

    const cumTime: number[] = [];
    const cumDist: number[] = [];
    let timeSum = 0;
    let distSum = 0;
    const blocks = data.blocks;
    expandedBlocks.forEach((expBlock, idx) => {
      timeSum += getBlockTime(blocks[expBlock]);
      distSum += getBlockDistance(blocks[expBlock]);
      cumTime[idx] = timeSum;
      cumDist[idx] = distSum;
    });
    return {
      cumulativeTime: cumTime,
      cumulativeDistance: cumDist,
      expandedBlocks,
    };
  }, [data.blocks, data.loops]);

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

  const getCellPositionForBlock = (blockIndex: number) => {
    const numLoopEndsBeforeIndex = data.loops.filter(
      (loop) => loop.end < blockIndex,
    ).length;
    return getCellPosition(blockIndex + numLoopEndsBeforeIndex);
  };

  const cellToBlock = useMemo(() => {
    const mapSize = Math.max(
      COLS * ROWS,
      data.blocks.length + data.loops.length,
    );
    const map: (number | undefined)[] = new Array(mapSize).fill(undefined);
    data.blocks.forEach((_, idx) => {
      const cellIdx = idx + data.loops.filter((loop) => loop.end < idx).length;
      map[cellIdx] = idx;
    });
    return map;
  }, [data.blocks, data.loops]);

  const handleDragEnd = (
    e: Konva.KonvaEventObject<DragEvent>,
    draggedIndex: number,
  ) => {
    const pos = e.target.position();
    const col = Math.round((pos.x - IMAGE_MARGIN) / CELL_WIDTH);
    const row = Math.round((pos.y - IMAGE_BLOCKS_START_Y) / CELL_HEIGHT);
    const targetBlockIndex = row * COLS + col;

    const targetBlockIndexWithLoops = cellToBlock[targetBlockIndex];

    if (
      targetBlockIndexWithLoops === undefined ||
      targetBlockIndexWithLoops < 0 ||
      targetBlockIndexWithLoops >= data.blocks.length ||
      targetBlockIndexWithLoops === draggedIndex
    ) {
      const { x, y } = getCellPositionForBlock(draggedIndex);
      e.target.position({ x, y });
      return;
    }

    const newBlocks = [...data.blocks];
    [newBlocks[draggedIndex], newBlocks[targetBlockIndexWithLoops]] = [
      newBlocks[targetBlockIndexWithLoops],
      newBlocks[draggedIndex],
    ];

    onDataChange({ ...data, blocks: newBlocks });

    const newPos = getCellPositionForBlock(targetBlockIndexWithLoops);
    e.target.position(newPos);
  };

  const renderBlock = (block: TrainingBlock, index: number) => {
    const { x, y } = getCellPositionForBlock(index);
    const isJump = block.kind === 'jump';
    const img = buttonImages[block.type];

    const beforeLastOccCumIndex = expandedBlocks.lastIndexOf(index) - 1;
    const beforeFirstOccCumIndex = expandedBlocks.indexOf(index) - 1;
    const foundExpBlock = beforeLastOccCumIndex !== -1 ? true : false;

    const beforeLastOccBlock =
      data.blocks[expandedBlocks[Math.max(beforeLastOccCumIndex, 0)]];
    const beforeLastOccBlockIsJump = beforeLastOccBlock.kind === 'jump';
    const beforeFirstOccBlock =
      data.blocks[expandedBlocks[Math.max(beforeFirstOccCumIndex, 0)]];
    const beforeFirstOccBlockIsJump = beforeFirstOccBlock.kind === 'jump';

    let beforeLastOccCumulativeText = '';
    let beforeFirstOccCumulativeText = '';

    if (foundExpBlock) {
      if (beforeLastOccBlockIsJump) {
        if (
          (beforeLastOccBlock.metric === 'distance' &&
            beforeLastOccBlock.distanceUp) ||
          beforeLastOccBlock.distanceDown
        ) {
          beforeLastOccCumulativeText = formatDistance(
            cumulativeDistance[beforeLastOccCumIndex],
          );
          beforeLastOccCumulativeText += beforeLastOccCumulativeText ? 'k' : '';
        } else if (beforeLastOccBlock.timeUp || beforeLastOccBlock.timeDown) {
          beforeLastOccCumulativeText = formatTime(
            cumulativeTime[beforeLastOccCumIndex],
          );
        }
      } else {
        if (
          beforeLastOccBlock.metric === 'distance' &&
          beforeLastOccBlock.distance
        ) {
          beforeLastOccCumulativeText = formatDistance(
            cumulativeDistance[beforeLastOccCumIndex],
          );
          beforeLastOccCumulativeText += beforeLastOccCumulativeText ? 'k' : '';
        } else if (beforeLastOccBlock.time) {
          beforeLastOccCumulativeText = formatTime(
            cumulativeTime[beforeLastOccCumIndex],
          );
        }
      }

      if (beforeFirstOccBlockIsJump) {
        if (
          (beforeFirstOccBlock.metric === 'distance' &&
            beforeFirstOccBlock.distanceUp) ||
          beforeFirstOccBlock.distanceDown
        ) {
          beforeFirstOccCumulativeText = formatDistance(
            cumulativeDistance[beforeFirstOccCumIndex],
          );
          beforeFirstOccCumulativeText += beforeFirstOccCumulativeText
            ? 'k'
            : '';
        } else if (beforeFirstOccBlock.timeUp || beforeFirstOccBlock.timeDown) {
          beforeFirstOccCumulativeText = formatTime(
            cumulativeTime[beforeFirstOccCumIndex],
          );
        }
      } else {
        if (
          beforeFirstOccBlock.metric === 'distance' &&
          beforeFirstOccBlock.distance
        ) {
          beforeFirstOccCumulativeText = formatDistance(
            cumulativeDistance[beforeFirstOccCumIndex],
          );
          beforeFirstOccCumulativeText += beforeFirstOccCumulativeText
            ? 'k'
            : '';
        } else if (beforeFirstOccBlock.time) {
          beforeFirstOccCumulativeText = formatTime(
            cumulativeTime[beforeFirstOccCumIndex],
          );
        }
      }
    }

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
      } else {
        timeDistText = formatUpDownValues(
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
    const numberOfStartLoops = data.loops.filter(
      (l) => l.start === index,
    ).length;
    const lastCumulativeTextSize = measureText(
      beforeLastOccCumulativeText,
      CUMULATIVE_FONT_SIZE,
    );
    if (index === 0 || index === expandedBlocks.length - 1) {
      beforeLastOccCumulativeText = '';
      beforeFirstOccCumulativeText = '';
    }
    const displayBothCumulativeTexts =
      beforeLastOccCumulativeText !== beforeFirstOccCumulativeText;
    const beforeFirstOccY =
      displayBothCumulativeTexts && !!beforeLastOccCumulativeText
        ? lastCumulativeTextSize.height
        : 0;

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
        {isCumTimeDistVisible && (
          <BlockText
            text={beforeLastOccCumulativeText}
            x={13 * numberOfStartLoops}
            y={13 * numberOfStartLoops}
            fontSize={CUMULATIVE_FONT_SIZE}
            fill={
              beforeLastOccBlock.metric === 'time'
                ? LAST_CUM_TIME_COLOR
                : LAST_CUM_DISTANCE_COLOR
            }
          />
        )}
        {isCumTimeDistVisible && displayBothCumulativeTexts && (
          <BlockText
            text={beforeFirstOccCumulativeText}
            x={13 * numberOfStartLoops}
            y={13 * numberOfStartLoops + beforeFirstOccY}
            fontSize={CUMULATIVE_FONT_SIZE}
            fill={
              beforeFirstOccBlock.metric === 'time'
                ? FIRST_CUM_TIME_COLOR
                : FIRST_CUM_DISTANCE_COLOR
            }
          />
        )}
      </Group>
    );
  };

  const renderCursor = () => {
    if (exportMode) {
      return null;
    }
    const numLoopEndsBeforeCursor = data.loops.filter(
      (loop) => loop.end < data.cursor,
    ).length;
    const { x, y } = getCellPosition(data.cursor + numLoopEndsBeforeCursor);
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
      const sameStartArrayReversed = data.loops
        .filter((l) => l.start === loop.start)
        .reverse();
      const sameStartDepth = sameStartArrayReversed.findIndex(
        (l) => l.id === loop.id,
      );
      const sameEndArray = data.loops.filter((l) => l.end === loop.end);
      const sameEndBreadth = sameEndArray.findIndex((l) => l.id === loop.id);

      const numLoopEndsBeforeLoopStart = data.loops.filter(
        (l) => l.end < loop.start,
      ).length;
      const numLoopEndsBeforeLoopEnd = data.loops.filter(
        (l) => l.end < loop.end,
      ).length;

      const startBlockIndex = loop.start + numLoopEndsBeforeLoopStart;
      const endBlockIndex =
        loop.end + numLoopEndsBeforeLoopEnd + sameEndBreadth;
      const startPos = getCellPosition(startBlockIndex);
      const endPos = getCellPosition(endBlockIndex);

      const closingBracketSize = measureText(']', LOOP_FONT_SIZE, 'normal');
      const offsetX = sameStartDepth * 15;
      const offsetY = sameStartDepth * 15;
      const color = LOOP_COLORS[i % LOOP_COLORS.length];
      const centerLoopToCellY = 50;
      const centerLoopEndToCellX = 60;
      const isLineBreak = (endBlockIndex + 1) % 7 === 0;
      const loopClosingBracketBaseX =
        -centerLoopEndToCellX + closingBracketSize.width;
      const loopClosingBracketBaseY = endPos.y - centerLoopToCellY + offsetY;
      const loopClosingBracketLineBreakOffset = isLineBreak
        ? {
            x: IMAGE_MARGIN,
            y: CELL_HEIGHT,
          }
        : {
            x: endPos.x + CELL_WIDTH,
            y: 0,
          };

      return (
        <Group key={`loop-${i}`}>
          <BlockText
            text={'['}
            x={startPos.x - 50 + offsetX}
            y={startPos.y - centerLoopToCellY + offsetY}
            fontSize={LOOP_FONT_SIZE}
            fontStyle="normal"
            fill={color}
          />
          <BlockText
            text={']'}
            x={endPos.x + CELL_WIDTH - centerLoopEndToCellX}
            y={endPos.y - centerLoopToCellY + offsetY}
            fontSize={LOOP_FONT_SIZE}
            fontStyle="normal"
            fill={color}
          />
          <BlockText
            text={`x${loop.repetitions}`}
            x={loopClosingBracketBaseX + loopClosingBracketLineBreakOffset.x}
            y={loopClosingBracketBaseY + loopClosingBracketLineBreakOffset.y}
            fontSize={LOOP_FONT_SIZE}
            fontStyle="normal"
            fill={color}
          />
        </Group>
      );
    });
  };

  const renderInfo = () => {
    const totalTime = cumulativeTime[expandedBlocks.length - 1] || 0;
    const totalDistance = cumulativeDistance[expandedBlocks.length - 1] || 0;

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

