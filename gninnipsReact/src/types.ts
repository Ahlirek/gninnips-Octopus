export interface NormalBlock {
  id: string;
  type: number;
  hr: number;
  rpm: number;
  metric: 'distance' | 'time';
  kind: 'normal';
  distance?: number;
  time?: number;
}

export interface JumpsBlock {
  id: string;
  type: number;
  hr: number;
  rpmUp: number;
  rpmDown: number;
  metric: 'distance' | 'time';
  kind: 'jump';
  distanceUp?: number;
  distanceDown?: number;
  timeUp?: number;
  timeDown?: number;
  jumps: number;
}

export type TrainingBlock = NormalBlock | JumpsBlock;

export interface Loop {
  start: number;
  end: number;
  repetitions: number;
}

export interface TrainingData {
  blocks: TrainingBlock[];
  loops: Loop[];
  cursor: number;
  date: Date | null;
  title: string;
}

