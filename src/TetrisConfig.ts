export type Config = {
  BLOCK_SHAPES: Record<TetrisShape, Coordinate[]>;
  SPAWN_POINT: Coordinate;
  SHAPE_COLORS: Record<TetrisShape, Color>;
  WALL_COLOR: Color;
  BOARD_WIDTH: number;
  BOARD_HEIGHT: number;
  CLOCK_TICK_RATE: number;
  STARTING_G_TICK_INTERVAL: number;
  MIN_G_TICK_INTERVAL: number;
  SPEED_SCALING: number;
  GRAVITY_LEVELS: Record<number, number>;
  LEVEL_LINES: number;
  LINES_CLEARED_SCORE: number[];
  POLL_RATES: Record<InputCategory | 'base', number>;
  SHIFT_DEBOUNCE: number;
  WALLS: boolean;
  ROW_CLEAR_DELAY: number; //how much time the game ~pauses before clearing any full rows after a settle
  ROW_COLLAPSE_DELAY: number; //how much time the game ~pauses before collapsing empty rows after a clear
  BASE_SETTLE_TIME: number; //how long an unmoved block takes to settle
  MIN_SETTLE_TIME: number; //the shortest the settle time can get as levels progress
  BASE_MAX_GROUND_TIME: number; //how long a block can sit on the ground before it settles even if moved/rotated
  MIN_MAX_GROUND_TIME: number; //the shortest the max ground time can get as levels progress
};
export type Color = [number, number, number];

export type Coordinate = [number, number];
export type InputCategory = 'rotate' | 'shift' | 'drop' | 'hold';
export const SHAPE_NAMES = ['I', 'T', 'O', 'S', 'Z', 'L', 'J'] as const;
export type TetrisShape = (typeof SHAPE_NAMES)[number];
export const CONFIG: Config = {
  BLOCK_SHAPES: {
    I: [
      [0, -2],
      [0, -1],
      [0, 0],
      [0, 1],
    ],
    T: [
      [0, 0],
      [0, 1],
      [0, -1],
      [-1, 0],
    ],
    O: [
      [0, 0],
      [-1, 0],
      [0, -1],
      [-1, -1],
    ],
    S: [
      [0, 0],
      [-1, 0],
      [0, -1],
      [-1, 1],
    ],
    Z: [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 1],
    ],
    L: [
      [0, 0],
      [0, -1],
      [0, 1],
      [-1, 1],
    ],
    J: [
      [0, 0],
      [0, 1],
      [0, -1],
      [-1, -1],
    ],
  },
  SPAWN_POINT: [0, 5] as Coordinate,
  SHAPE_COLORS: {
    I: [0, 255, 255],
    T: [128, 0, 128],
    O: [255, 255, 0],
    S: [255, 0, 0],
    Z: [0, 255, 0],
    L: [255, 127, 0],
    J: [0, 0, 255],
  },
  WALL_COLOR: [113, 113, 113],
  BOARD_WIDTH: 10,
  BOARD_HEIGHT: 20,
  CLOCK_TICK_RATE: 10,
  STARTING_G_TICK_INTERVAL: 900,
  MIN_G_TICK_INTERVAL: 10, //minimum tick interval
  GRAVITY_LEVELS: {
    0: 1000,
    1: 800,
    2: 700,
    3: 600,
    4: 525,
    5: 455,
    6: 400,
    7: 370,
    8: 345,
    9: 320,
    10: 295,
    11: 270,
    12: 250,
    13: 230,
    14: 210,
    15: 195,
    16: 180,
    17: 171,
    18: 155,
    19: 140,
    20: 128,
    21: 110,
    22: 95,
    23: 85,
    24: 75,
    25: 65,
    26: 55,
    27: 45,
    28: 35,
    29: 25,
    30: 15,
    31: 5,
  },
  SPEED_SCALING: 50, //how many milliseconds to take off the tick time for each level

  LEVEL_LINES: 10, //how many lines between speed scaling
  LINES_CLEARED_SCORE: [0, 100, 300, 500, 800],
  POLL_RATES: {
    base: 10,
    drop: 250,
    rotate: 150,
    shift: 70,
    hold: 1000000, //hold allowance is handled by the hold/spawn block functions
  },
  SHIFT_DEBOUNCE: 120,
  WALLS: false,
  ROW_CLEAR_DELAY: 250,
  ROW_COLLAPSE_DELAY: 190,
  BASE_SETTLE_TIME: 600,
  MIN_SETTLE_TIME: 350,
  BASE_MAX_GROUND_TIME: 1500,
  MIN_MAX_GROUND_TIME: 700,
};
