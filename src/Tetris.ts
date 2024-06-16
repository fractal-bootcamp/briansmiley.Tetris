/**
 * Types
 */

export type Game = {
  board: Board;
  fallingBlock: Block | null;
  score: number;
  inputForbidden: boolean;
  blocksSpawned: number;
  tickInterval: number;
  over: boolean;
  CONFIG: Config;
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
  STARTING_TICK_INTERVAL: number;
  INPUT_REPEAT_DELAY: number;
};

type ConditionalNull<argType, nonNullArgType, returnType> =
  argType extends nonNullArgType ? returnType : null;
/**
 * Data
 */

export const CONFIG: Config = {
  BLOCK_SHAPES: {
    I: [
      [0, -1],
      [0, 0],
      [0, 1],
      [0, 2]
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
      [0, 1],
      [1, -1]
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
  BOARD_HEIGHT: 20,
  STARTING_TICK_INTERVAL: 500,
  INPUT_REPEAT_DELAY: 75
};

/**
 * Functions
 */

export const setTickInterval = (game: Game, newInterval: number): Game => ({
  ...game,
  tickInterval: newInterval
});

/**creates a new blank slate game object; requires a call to spawnNewBlock() to create first falling block */
export const gameInit = (): Game => {
  return {
    board: [...Array(CONFIG.BOARD_HEIGHT)].map(_ =>
      Array(CONFIG.BOARD_WIDTH).fill(null)
    ),
    fallingBlock: null,
    score: 0,
    inputForbidden: false,
    blocksSpawned: 0,
    tickInterval: CONFIG.STARTING_TICK_INTERVAL,
    over: false,
    CONFIG: CONFIG
  };
};
export const forbidInput = (game: Game): Game => ({
  ...game,
  inputForbidden: true
});
export const allowInput = (game: Game): Game => ({
  ...game,
  inputForbidden: false
});
const endGame = (game: Game): Game => ({ ...game, over: true });
export const startGame = (game: Game): Game =>
  game.blocksSpawned === 0
    ? spawnNewBlock(game)
    : game.over
    ? spawnNewBlock(gameInit())
    : game;
const spawnNewBlock = (game: Game): Game => {
  const [spawnR, spawnC] = CONFIG.SPAWN_POINT;
  const newBlock = newFallingBlock();
  if (blockIntersectsSettledOrWalls(game.board, newBlock)) return endGame(game);
  if (game.board[spawnR][spawnC]) return endGame(game);
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
const blockOccupiedCells = <T extends Block | null>(
  block: T
): ConditionalNull<T, Block, Coordinate[]> => {
  return block === null
    ? (null as ConditionalNull<T, Block, Coordinate[]>)
    : (block.body.map(cell =>
        coordinateSum(cell, block.origin)
      ) as ConditionalNull<T, Block, Coordinate[]>);
};

const isOffScreen = (coord: Coordinate, board: Board): boolean => {
  return (
    //Lets allow things to go above the board?
    // coord[0] < 0 ||
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
      (boardLocation[0] >= 0 && board[boardLocation[0]][boardLocation[1]])
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
  const newGame = clearThenCollapseRows(game);
  if (newGame.fallingBlock === null) return newGame;
  const nextBlock = shiftedBlock(newGame.fallingBlock, "D");
  if (blockIntersectsSettledOrWalls(newGame.board, nextBlock))
    return settleBlock(newGame);
  return clearFullRows(
    collapseGapRows({ ...newGame, fallingBlock: nextBlock })
  );
};

/** SCORE/CLEAR  EVENTS */

/** Gets a list of the indices of full rows on the board */
const fullRows = (board: Board): number[] => {
  return board
    .map((row, rowIndex) => (row.every(cell => cell) ? rowIndex : null))
    .filter(isNotNull);
};

/**Returns a copy of the board with full rows nulled*/
export const clearFullRows = (game: Game): Game => {
  const { board } = game;
  const rowsToClear = fullRows(board);
  return {
    ...game,
    board: board.map((row, r) =>
      rowsToClear.includes(r)
        ? Array.from(row, () => null)
        : structuredClone(row)
    )
  };
};

/**Settle the board squares above a clear by an amount equal to the clear*/
export const collapseGapRows = (game: Game): Game => {
  const { board } = game;
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
  return { ...game, board: newBoard };
};
/** Clears any full rows and simultaneously collapses them */
export const clearThenCollapseRows = (game: Game): Game =>
  collapseGapRows(clearFullRows(game));
/** INPUT RESPONSES */

const rotatedBlock = <T extends Block | null>(
  block: T,
  direction: RotDirection
): ConditionalNull<T, Block, Block> =>
  block === null
    ? (null as ConditionalNull<T, Block, Block>)
    : ({
        ...block,
        body: block.body.map(coord =>
          direction === "CW"
            ? ([-coord[1], coord[0]] as Coordinate)
            : ([coord[1], -coord[0]] as Coordinate)
        )
      } as ConditionalNull<T, Block, Block>);

/** Rotates a block 90° CW | CCW about its origin */
export const rotateBlock = (game: Game, direction: RotDirection): Game => {
  if (game.fallingBlock === null || game.fallingBlock.shape === "O")
    return game;
  const newBlock = rotatedBlock(game.fallingBlock, direction);
  if (blockIntersectsSettledOrWalls(game.board, newBlock)) return game;
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
/**Calculate how far out of any board boundary the block sticks and return the resulting coordinate offsets we need to add to correct */
// const outOfBoundsCorrection = (block: Block, board: Board): Coordinate => {
//   const coords = blockOccupiedCells(block);
//   const leftCorrection = -coords.reduce(
//     (prev, curr) => Math.min(prev, curr[1]),
//     0
//   );
//   const rightCorrection = -coords.reduce(
//     (prev, curr) => Math.max(prev, curr[1] - (board[0].length - 1)),
//     0
//   ); //maximum distance past right of board
//   const bottomCorrection = -coords.reduce(
//     (prev, curr) => Math.max(prev, curr[0] - (board.length - 1)),
//     0
//   ); //maximum row coordinate overflow
//   const topCorrection = -coords.reduce(
//     (prev, curr) => Math.min(prev, curr[0]),
//     0
//   ); //most negative row underflow

//   return [leftCorrection + rightCorrection, bottomCorrection + topCorrection];
// };
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
/**Drops a block all the way to the settled pile settles it into the board*/
export const hardDropBlock = (game: Game): Game => {
  if (game.fallingBlock === null) return game;
  const coords = blockOccupiedCells(game.fallingBlock);

  //get the index of the row containing a column's highest occupied cell
  const colFloorIndex = (column: number) => {
    const floorIndex = game.board.findIndex(row => isNotNull(row[column]));

    return floorIndex === -1 ? game.board.length : floorIndex; //if floorIndex is -1 we didnt find a non-null row so the floor is the board end
  };
  //map the current falling block's cells to their distances from (1 cell above) the floor in their column
  const heights = coords!.map(
    ([row, column]) => colFloorIndex(column) - 1 - row
  );
  const distanceToDrop = Math.min(...heights);
  const newBlock = shiftedBlock(game.fallingBlock, "D", distanceToDrop);
  return settleBlock({ ...game, fallingBlock: newBlock });
};

/** Returns a board containing the fallingBlock cells filled in for rendering purposes */
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
