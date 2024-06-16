/**
 * Types
 */

export type Game = {
  board: Board;
  fallingBlock: Block | null;
  inputForbidden: boolean;
  blocksSpawned: number;
};
export type Cell = string | null;
export type Board = Cell[][];
type Block = {
  origin: Coordinate;
  body: Coordinate[];
  shape: TetrisShape;
};
export type Direction = "L" | "R" | "D";
export type RotDirection = "CW" | "CCW";
type Coordinate = [number, number];

type TetrisShape = "I" | "T" | "O" | "S" | "Z" | "L" | "J";
export type Config = {
  BLOCK_SHAPES: Record<TetrisShape, Coordinate[]>;
  SPAWN_POINT: Coordinate;
  SHAPE_COLORS: Record<TetrisShape, string>;
  BOARD_WIDTH: number;
  BOARD_HEIGHT: number;
};
/**
 * Data
 */

export const CONFIG: Config = {
  BLOCK_SHAPES: {
    I: [
      [0, -1],
      [0, 1],
      [0, 2],
      [0, 3]
    ],
    T: [
      [0, 0],
      [0, 1],
      [0, -1],
      [1, 0]
    ],
    O: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1]
    ],
    S: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -1]
    ],
    Z: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -1]
    ],
    L: [
      [0, 1],
      [0, 0],
      [0, -1],
      [-1, 1]
    ],
    J: [
      [0, 0],
      [0, 1],
      [0, -1],
      [1, 1]
    ]
  },
  SPAWN_POINT: [0, 4] as Coordinate,
  SHAPE_COLORS: {
    I: "#00ffff",
    T: "#800080",
    O: "#ffff00",
    S: "#ff0000",
    Z: "#800080",
    L: "#ff7f00",
    J: "#0000ff"
  },
  BOARD_WIDTH: 10,
  BOARD_HEIGHT: 20
};

/**
 * Functions
 */

// tickGravity (game) -> game
// rotateBlock (game) -> game
// dropBlock (game) -> game

/**creates a new blank slate game object; requires a call to spawnNewBlock() to create first falling block */
export const gameInit = (): Game => {
  return {
    board: [...Array(CONFIG.BOARD_HEIGHT)].map(_ =>
      Array(CONFIG.BOARD_WIDTH).fill(null)
    ),
    fallingBlock: null,
    inputForbidden: false,
    blocksSpawned: 0
  };
};
export const startGame = (game: Game): Game =>
  game.blocksSpawned === 0 ? spawnNewBlock(game) : game;
const spawnNewBlock = (game: Game): Game => {
  return {
    ...game,
    fallingBlock: newFallingBlock(),
    blocksSpawned: game.blocksSpawned + 1
  };
};
const isNotNull = <T>(arg: T | null): arg is T => arg !== null;

const coordinateSum = (c1: Coordinate, c2: Coordinate): Coordinate => {
  return [c1[0] + c2[0], c1[1] + c2[1]];
};
//gets the on-board coordinates of all of a block's cells
const blockOccupiedCells = (block: Block | null) => {
  return block === null
    ? null
    : block.body.map(cell => coordinateSum(cell, block.origin));
};

const isOffScreen = (coord: Coordinate, board: Board): boolean => {
  return (
    coord[0] < 0 ||
    coord[0] > board.length - 1 ||
    coord[1] < 0 ||
    coord[1] > board[0].length - 1
  );
};
//checks whether a proposed block position will be a collision
const blockIntersectsSettledOrWalls = (board: Board, block: Block) => {
  const occupiedCells = blockOccupiedCells(block);
  if (occupiedCells === null) return false;
  return occupiedCells.some(
    boardLocation =>
      isOffScreen(boardLocation, board) ||
      board[boardLocation[0]][boardLocation[1]]
  );
};
//get the next spawnable block, currently at random

/**For later: The NES Tetris randomizer is super basic. Basically it rolls an 8 sided die, 1-7 being the 7 pieces
 *  and 8 being "reroll". If you get the same piece as the last piece you got, or you hit the reroll number, It'll
 * roll a 2nd 7 sided die. This time you can get the same piece as your previous one and the roll is final. */
const getNewBlockShape = (): TetrisShape => {
  const keys = Object.keys(CONFIG.BLOCK_SHAPES) as Array<
    keyof typeof CONFIG.BLOCK_SHAPES
  >;
  return keys[(keys.length * Math.random()) << 0];
};

/**
 * Creates a falling block at the top of the board (overwrites any current falling block)
 */
const newFallingBlock = (): Block => {
  const shape = getNewBlockShape();
  const body = CONFIG.BLOCK_SHAPES[shape];
  const newBlock: Block = {
    origin: CONFIG.SPAWN_POINT,
    shape,
    body
  };
  return newBlock;
};

/** Locks the game's fallingBlock into place as part of the board*/
const settleBlock = (game: Game): Game => {
  const [oldBoard, fallenBlock] = [game.board, game.fallingBlock!];
  const fallenBlockEndCoords = blockOccupiedCells(fallenBlock);
  if (fallenBlockEndCoords === null) return game;
  const newColor = CONFIG.SHAPE_COLORS[fallenBlock.shape];
  const newBoard = structuredClone(oldBoard);
  fallenBlockEndCoords.forEach(
    coord => (newBoard[coord[0]][coord[1]] = newColor)
  );
  return spawnNewBlock({ ...game, board: newBoard });
};

/**
 * moves the game's falling block down on square, or settles it if doing so would intersect
 */
export const tickGravity = (game: Game): Game => {
  if (game.fallingBlock === null) return game;
  const nextBlock = shiftedBlock(game.fallingBlock, "D");
  if (blockIntersectsSettledOrWalls(game.board, nextBlock))
    return settleBlock(game);
  return { ...game, fallingBlock: nextBlock };
};

/** SCORE/CLEAR  EVENTS */

/** Gets a list of the indices of full rows on the board */
const fullRows = (board: Board): number[] => {
  return board
    .map((row, rowIndex) => (row.every(cell => cell) ? rowIndex : null))
    .filter(isNotNull);
};

/**Returns a copy of the board with full rows nulled*/
export const clearFullRows = (board: Board): Board => {
  const rowsToClear = fullRows(board);
  return board.map((row, r) =>
    rowsToClear.includes(r) ? Array.from(row, () => null) : structuredClone(row)
  );
};

/**Settle the board squares above a clear by an amount equal to the clear*/
export const collapseGapRows = (board: Board): Board => {
  const firstNonEmptyRowIndex = board.findIndex(row => row.some(cell => cell));
  //indices of the empty rows below the topmost nonempty row
  const emptyRowIndices = board
    .map((row, rowIndex) =>
      row.some(cell => cell) && rowIndex >= firstNonEmptyRowIndex
        ? null
        : rowIndex
    )
    .filter(isNotNull);
  let newBoard = structuredClone(board);
  //for each empty row index, splice out that row in newBoard and then put a new empty row on top; this should let the rest of the indices keep working as expected
  emptyRowIndices.forEach(rowIndex => {
    newBoard.splice(rowIndex, 1);
    newBoard = [Array.from(newBoard[0], (): Cell => null)].concat(newBoard);
  });
  return newBoard;
};

/** INPUT RESPONSES */

/** Rotates a block 90° CW | CCW about its origin */
export const rotateBlock = (game: Game, direction: RotDirection): Game => {
  if (game.fallingBlock === null) return game;
  return {
    ...game,
    fallingBlock: {
      ...game.fallingBlock,
      body: game.fallingBlock.body.map(coord =>
        direction === "CW" ? [-coord[1], coord[0]] : [coord[1], -coord[0]]
      )
    }
  };
};
/**Takes in a block and returns one shifted L */
const shiftedBlock = (
  block: Block,
  direction: Direction,
  distance: number = 1
): Block => {
  const transforms: Record<Direction, Coordinate> = {
    L: [0, -1],
    R: [0, 1],
    D: [distance, 0]
  };
  return {
    ...block,
    origin: coordinateSum(block.origin, transforms[direction])
  };
};

/**Shifts the game's falling block one unit L | R | D */
export const shiftBlock = (game: Game, direction: Direction): Game => {
  if (game.fallingBlock === null) return game;
  const nextBlock = shiftedBlock(game.fallingBlock, direction, 1);
  return {
    ...game,
    fallingBlock: blockIntersectsSettledOrWalls(game.board, nextBlock)
      ? game.fallingBlock
      : nextBlock
  };
};
shiftBlock;
/**Drops a block all the way to the settled pile settles it into the board*/
export const hardDropBlock = (game: Game): Game => {
  if (game.fallingBlock === null) return game;
  const coords = blockOccupiedCells(game.fallingBlock);
  const floorCeilingDistance = (column: number) =>
    game.board.findIndex(row => isNotNull(row[column]));
  const heights = coords!.map(
    ([row, column]) => -(row - floorCeilingDistance(column)) - 1
  );
  const distanceToDrop = Math.min(...heights);
  const newBlock = shiftedBlock(game.fallingBlock, "D", distanceToDrop);
  return settleBlock({ ...game, fallingBlock: newBlock });
};

export const boardWithFallingBlock = (game: Game): Board => {
  const { fallingBlock, board } = game;
  const occupiedCells = blockOccupiedCells(fallingBlock);
  if (occupiedCells === null) return board;
  return board.map((row, r) =>
    row.map((cell, c) =>
      occupiedCells.some(coord => coord[0] === r && coord[1] === c)
        ? CONFIG.SHAPE_COLORS[fallingBlock!.shape]
        : cell
    )
  );
};
