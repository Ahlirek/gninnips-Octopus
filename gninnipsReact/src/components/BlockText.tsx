import { FONT_SIZE, FONT_FAMILY, FONT_STYLE } from '../constants/theme';
import { Text } from 'react-konva';

interface BlockTextProps {
  text: string;
  x?: number;
  y?: number;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  fill?: string;
  width?: number;
  height?: number;
  align?: string;
  verticalAlign?: string;
  ellipsis?: boolean;
  wrap?: string;
}

export function BlockText({
  text,
  x,
  y,
  fontSize = FONT_SIZE,
  fontFamily = FONT_FAMILY,
  fontStyle = FONT_STYLE,
  fill,
  width,
  height,
  align,
  verticalAlign,
  ellipsis,
  wrap,
}: BlockTextProps) {
  return (
    <Text
      text={text}
      x={x}
      y={y}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fontStyle={fontStyle}
      fill={fill}
      width={width}
      height={height}
      align={align}
      verticalAlign={verticalAlign}
      ellipsis={ellipsis}
      wrap={wrap}
    />
  );
}

