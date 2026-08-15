export type Species = {
  id: string;
  name: string;
  code: string;
  color: string;
};

export type Stick = {
  speciesId: string;
  width: number;
};

export type StripOp = {
  flip: boolean;
  offset: number;
};

export type BoardSize = {
  length: number;
  width: number;
  thickness: number;
};

export type ShopPath = "strip" | "block";

export type Project = {
  version: 1;
  name: string;
  shopPath: ShopPath;
  board: BoardSize;
  kerf: number;
  surfacing: number;
  extraLength: number;
  squareUp: number;
  species: Species[];
  sticks: Stick[];
  strips: StripOp[];
  blockSize: number;
  courses: string[][];
};

export type Unit = "mm" | "in";

export type CheckLevel = "refuse" | "warn";

export type Check = {
  level: CheckLevel;
  code: string;
  message: string;
};

export type TakeoffRow = {
  speciesId: string;
  speciesName: string;
  width: number;
  length: number;
  blocks: number;
};

export type Gen1Blank = {
  length: number;
  width: number;
  thickness: number;
};

export type FaceCell = {
  speciesId: string;
  width: number;
};

export type Derived = {
  motifWidth: number;
  stripCount: number;
  crosscutWidth: number;
  remainder: number;
  remainderX: number;
  remainderY: number;
  blockCols: number;
  blockRows: number;
  blank: Gen1Blank;
  stickSum: number;
  takeoff: TakeoffRow[];
  wasteRatio: number | null;
  finishedVolume: number;
  gen1Volume: number;
};
