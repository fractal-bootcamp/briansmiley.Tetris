/**
 * Types
 */

type Game = {
  board: Board;
  fallingBlock: Block;
  inputForbidden: boolean;
};

//Cell contains either a color code or null if it is empty
type Cell = string | null;

type Board = Cell[][];

/**
 * Blocks are defined by their origin (board location of their pivot), and their body (offsets from their origin to each of their constituent cells)
 */
type Block = {
  origin: Coordinate;
  body: Coordinate[];
  shape: TetrisShape;
};
type Direction = "L" | "R" | "D";
type Coordinate = [number, number];

type TetrisShape = "I" | "T" | "O" | "S" | "Z" | "L" | "J";

/**
 * Data
 */
const BLOCK_SHAPES: Record<TetrisShape, Coordinate[]> = {
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
};
const SPAWN_POINT: Coordinate = [4, 0];
const SHAPE_COLORS: Record<TetrisShape, string> = {
  I: "#00ffff",
  T: "#800080",
  O: "#ffff00",
  S: "#ff0000",
  Z: "#800080",
  L: "#ff7f00",
  J: "#0000ff"
};
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
/**
 * Functions
 */

// tickGravity (game) -> game
// rotateBlock (game) -> game
// dropBlock (game) -> game
const isNotNull = <T>(arg: T | null): arg is T => arg !== null;

const coordinateSum = (c1: Coordinate, c2: Coordinate): Coordinate => {
  return [c1[0] + c2[0], c1[1] + c2[1]];
};
//gets the on-board coordinates of all of a block's cells
const blockOccupiedCells = (block: Block) => {
  return block.body.map(cell => coordinateSum(cell, block.origin));
};

const isOffScreen = (coord: Coordinate, board: Board): boolean => {
  return (
    coord[0] < 0 ||
    coord[0] > board.length ||
    coord[1] < 0 ||
    coord[1] > board[0].length - 1
  );
};
//checks whether a proposed block position will be a collision
const blockIntersectsSettledOrWalls = (board: Board, block: Block) => {
  const occupiedCells = blockOccupiedCells(block);
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
const getNewBlockShape = () => {
  const keys = Object.keys(BLOCK_SHAPES) as Array<keyof typeof BLOCK_SHAPES>;
  return keys[(keys.length * Math.random()) << 0];
};

const fullRows = (board: Board): number[] => {
  return board
    .map((row, rowIndex) => (row.every(cell => cell) ? rowIndex : null))
    .filter(isNotNull);
};

/**
 * Returns a copy of the board with argument rows nulled
 */
const clearFullRows = (board: Board): Board => {
  const rowsToClear = fullRows(board);
  return board.map((row, r) =>
    rowsToClear.includes(r) ? Array.from(row, () => null) : structuredClone(row)
  );
};

/**
 * Settle the board squares above a clear by an amount equal to the clear
 */
const collapseGapRows = (board: Board): Board => {
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
  //for each empty row index, splice out that row in newBoard and then put a new empty row on top
  emptyRowIndices.forEach(rowIndex => {
    newBoard.splice(rowIndex, 1);
    newBoard = [Array.from(newBoard[0], (): Cell => null)].concat(newBoard);
  });
  return newBoard;
};

/**
 * Creates a falling block at the top of the board (overwrites any current falling block)
 */
const spawnNewBlock = (game: Game): Game => {
  const shape = getNewBlockShape();
  const body = BLOCK_SHAPES[shape];
  const newBlock: Block = {
    origin: SPAWN_POINT,
    shape,
    body
  };
  return { ...game, fallingBlock: newBlock };
};

/**
 * Locks the game's fallingBlock into place as part of the board
 */
const settleBlock = (game: Game): Game => {
  const [oldBoard, fallenBlock] = [game.board, game.fallingBlock];
  const fallenBlockEndCoords = blockOccupiedCells(fallenBlock);
  const newColor = SHAPE_COLORS[game.fallingBlock.shape];
  const newBoard = structuredClone(oldBoard);
  fallenBlockEndCoords.forEach(
    coord => (newBoard[coord[0]][coord[1]] = newColor)
  );
  return { ...game, board: newBoard };
};

const shiftedBlock = (block: Block, direction: Direction): Block => {
  const transforms: Record<Direction, Coordinate> = {
    L: [0, -1],
    R: [0, 1],
    D: [1, 0]
  };
  return {
    ...block,
    origin: coordinateSum(block.origin, transforms[direction])
  };
};

const sideShiftBlock = (game: Game, direction: Direction): Game => {
  const nextBlock = shiftedBlock(game.fallingBlock, direction);
  return {
    ...game,
    fallingBlock: blockIntersectsSettledOrWalls(game.board, nextBlock)
      ? game.fallingBlock
      : nextBlock
  };
};

const tickGravity = (game: Game): Game => {
  const nextBlock = shiftedBlock(game.fallingBlock, "D");
  if (blockIntersectsSettledOrWalls(game.board, nextBlock))
    return settleBlock(game);
  return { ...game, fallingBlock: nextBlock };
};
