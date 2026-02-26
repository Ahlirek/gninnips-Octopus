import { FONT_SIZE, FONT_FAMILY, FONT_STYLE } from '../constants/theme';
import { Text } from 'react-konva';

interface BlockTextProps {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  fill?: string;
}

export function BlockText({
  text,
  x,
  y,
  fontSize = FONT_SIZE,
  fontFamily = FONT_FAMILY,
  fontStyle = FONT_STYLE,
  fill = 'black',
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
    />
  );
}

