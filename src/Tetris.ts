import { CONFIG } from './TetrisConfig';
//prettier-ignore
import type {Config,Coordinate,TetrisShape,InputCategory,Color} from "./TetrisConfig";
import { SHAPE_NAMES } from './TetrisConfig';
/**
 * Types
 */

export type Game = {
  board: Board;
  clock: number;
  prevGravityTickTime: number;
  fallingBlock: {
    self: Block;
    dropLocation: Coordinate;
    totalGroundTime: number; //counts total time sitting on the ground so that it settles eventually even if we keep resetting it
    groundTimer: number; //counts down each tick the falling bacl is on the ground; settles when it hits 0; resets when moved
  } | null;
  shapeQueue: TetrisShape[];
  heldShape: TetrisShape | null;
  score: number;
  linesCleared: number;
  level: number;
  blocksSpawned: number;
  gravityTickInterval: number;
  maxGroundTime: number;
  settleTime: number;
  over: boolean;
  allowedInputs: Record<InputCategory, boolean>;
  paused: boolean;
  CONFIG: Config;
};
export type Cell = {
  color: Color;
  type: 'wall' | 'block' | 'shadow' | 'empty';
};
export type Board = Cell[][];
type Block = {
  origin: Coordinate;
  body: Coordinate[];
  shape: TetrisShape;
};
export type Direction = 'U' | 'L' | 'R' | 'D';
export type RotDirection = 'CW' | 'CCW';
type ConditionalNull<argType, nonNullArgType, returnType> =
  argType extends nonNullArgType ? returnType : null;
/**
 * Data
 */

/**
 * Functions
 */

/**creates a new blank slate game object; requires a call to spawnNewBlock() to create first falling block */
export const gameInit = (config: Config): Game => {
  return {
    board: newBlankBoard(config),
    clock: 0, //global timestamp
    prevGravityTickTime: new Date().getTime(), //clock timestamp of the last gravity tick
    fallingBlock: null, //current falling block
    shapeQueue: [...newShapeBag(), ...newShapeBag()], //upcoming shapes to drop
    heldShape: null,
    score: 0,
    linesCleared: 0,
    level: 1,
    blocksSpawned: 0,
    gravityTickInterval: config.STARTING_G_TICK_INTERVAL,
    maxGroundTime: config.BASE_MAX_GROUND_TIME,
    settleTime: config.BASE_SETTLE_TIME,
    over: false,
    allowedInputs: { rotate: true, shift: true, drop: true, hold: true },
    paused: false,
    CONFIG: config,
  };
};
export const pauseGame = (game: Game): Game => ({ ...game, paused: true });
export const unpauseGame = (game: Game): Game => ({
  ...game,
  paused: false,
  prevGravityTickTime: new Date().getTime(), //resets gravity tick time so that the falling block doesnt jump down immediately
});
const newEmptyCell = (): Cell => ({ color: [0, 0, 0], type: 'empty' });
const newWallCell = (config: Config): Cell => ({
  color: [...config.WALL_COLOR],
  type: 'wall',
});
const newEmptyRow = (config: Config): Cell[] => {
  const row = Array(config.BOARD_WIDTH).fill(newEmptyCell());
  return config.WALLS
    ? [newWallCell(config)].concat(row).concat(newWallCell(config))
    : row;
};
const newBlankBoard = (config: Config): Board => {
  const newBoard = [...Array(config.BOARD_HEIGHT)].map(() =>
    newEmptyRow(config)
  );
  return config.WALLS
    ? newBoard.concat([Array(config.BOARD_WIDTH + 2).fill(newWallCell(config))])
    : newBoard;
};
export const setGravityTickInterval = (
  game: Game,
  newInterval: number
): Game => ({
  ...game,
  gravityTickInterval: newInterval,
});
export const setAllowedInput = (
  game: Game,
  input: InputCategory,
  state: boolean
): Game => ({
  ...game,
  allowedInputs: { ...game.allowedInputs, [input]: state },
});
export const tickGameClock = (game: Game): Game => {
  if (game.paused) return game;
  const newTime = new Date().getTime();
  //increment ground timer/settle block if necessary
  const newFallingBlock = blockOnGround(game)
    ? {
        ...game.fallingBlock,
        totalGroundTime:
          game.fallingBlock.totalGroundTime + game.CONFIG.CLOCK_TICK_RATE,
        groundTimer:
          game.fallingBlock.groundTimer - game.CONFIG.CLOCK_TICK_RATE,
      }
    : game.fallingBlock;

  const newGame = { ...game, clock: newTime, fallingBlock: newFallingBlock };
  const gravityTicks = Math.floor(
    (newTime - game.prevGravityTickTime) / game.gravityTickInterval
  );
  return gravityTicks > 0 ? tickGravity(newGame, gravityTicks) : newGame;
};

const endGame = (game: Game): Game => ({ ...game, over: true });
export const startGame = (game: Game): Game =>
  game.blocksSpawned === 0
    ? spawnNewBlock(game)
    : game.over
      ? spawnNewBlock(gameInit(game.CONFIG))
      : game;
const newBlockFromShape = (game: Game, shape: TetrisShape): Block => ({
  origin: game.CONFIG.SPAWN_POINT,
  shape: shape,
  body: game.CONFIG.BLOCK_SHAPES[shape],
});
/**Does nothing more less than pop a shape off the next queue and start it falling (except also enable hold swap again) */
const spawnNewBlock = (game: Game): Game => {
  // pop the next shape off the queue
  const newBlockShape = game.shapeQueue[0];
  const newBlock = newBlockFromShape(game, newBlockShape);
  const newQueue = game.shapeQueue
    .slice(1)
    .concat(game.shapeQueue.length < 8 ? newShapeBag() : []); //
  if (blockIntersectsSettledOrWalls(game.board, newBlock, game.CONFIG.WALLS))
    return endGame(game);
  if (
    boardCoordIsOccupied(game.board, game.CONFIG.SPAWN_POINT, game.CONFIG.WALLS)
  )
    return endGame(game);
  return {
    ...game,
    fallingBlock: {
      self: newBlock,
      dropLocation: hardDropEndOrigin(game.board, newBlock),
      totalGroundTime: 0,
      groundTimer: game.settleTime,
    },
    shapeQueue: newQueue,
    blocksSpawned: game.blocksSpawned + 1,
    allowedInputs: { ...game.allowedInputs, hold: true }, //turn on holding once we spawn a new block (hold function manually turns this off after a swap)
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
    : (block.body.map((cell) =>
        coordinateSum(cell, block.origin)
      ) as ConditionalNull<T, Block, Coordinate[]>);
};
/**Checks if a coordinate is off the screen; to allow poking over top of board, check that separately */
const isOffScreen = (coord: Coordinate, board: Board): boolean => {
  return (
    coord[0] < 0 ||
    coord[0] > board.length - 1 ||
    coord[1] < 0 ||
    coord[1] > board[0].length - 1
  );
};
//check whether a board location is occupied by a block or wall
const boardCoordIsOccupied = (
  board: Board,
  coord: Coordinate,
  walls: boolean
): boolean =>
  cellIsOccupied(board[coord[0]][coord[1]]) ||
  (walls && (coord[1] === 0 || coord[1] === board[0].length - 1)); //if walls enabled, anything in col 1 or last col is considered occupied
const cellIsOccupied = (cell: Cell) => ['block', 'wall'].includes(cell.type);
//checks whether a proposed block position will be a collision
const blockIntersectsSettledOrWalls = (
  board: Board,
  block: Block | null,
  walls: boolean
) => {
  const occupiedCells = blockOccupiedCells(block);
  if (occupiedCells === null) return false;
  return occupiedCells.some(
    (boardLocation) =>
      (walls &&
        (boardLocation[1] === 0 || boardLocation[1] === board[0].length - 1)) || //if walls enabled, anything in col 1 or last col is considered occupied
      (boardLocation[0] >= 0 && isOffScreen(boardLocation, board)) || //(should only happen in walless mode; disallow if goes offscreen); only check offscreen below top of board so that we dont consider poking over to be intersecting
      (boardLocation[0] >= 0 &&
        boardCoordIsOccupied(board, boardLocation, walls)) //check if any cells inside the visible board are occupier
  );
};

/**Create/replace the bag of shapes abvailable to pick the next block in the queue from */
const newShapeBag = (): TetrisShape[] => {
  // Create a well-shuffled copy of SHAPE_NAMES
  const shuffledShapes = [...SHAPE_NAMES];
  for (let i = shuffledShapes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledShapes[i], shuffledShapes[j]] = [
      shuffledShapes[j],
      shuffledShapes[i],
    ];
  }
  // Assign the shuffled array to the game's shapeBag
  return shuffledShapes;
};

/** Locks the game's fallingBlock into place as part of the board*/
const settleBlockAndSpawnNew = (game: Game): Game => {
  const [oldBoard, fallenBlock] = [game.board, game.fallingBlock];
  if (fallenBlock === null) return game;
  const fallenBlockEndCoords = blockOccupiedCells(fallenBlock.self);
  const newColor = game.CONFIG.SHAPE_COLORS[fallenBlock.self.shape];
  const newBoard = structuredClone(oldBoard);
  fallenBlockEndCoords.forEach(
    (coord) =>
      !isOffScreen(coord, newBoard) &&
      (newBoard[coord[0]][coord[1]] = { color: newColor, type: 'block' })
  );
  return spawnNewBlock({ ...game, board: newBoard });
};

/**
 * moves the game's falling block down on square, or settles it if doing so would intersect
 */
export const tickGravity = (game: Game, ticks: number = 1): Game => {
  const newGame = clearThenCollapseRows({
    ...game,
    prevGravityTickTime: game.clock,
  });
  //if there is no falling block, all we need to do is clear and collpase
  if (newGame.fallingBlock === null) return newGame;
  //if the falling block timer hits 0, settle and spawn

  if (blockOnGround(game)) {
    if (
      newGame.fallingBlock.groundTimer <= 0 ||
      newGame.fallingBlock.totalGroundTime > game.maxGroundTime
    ) {
      return settleBlockAndSpawnNew(newGame);
    }
    //if timers havent run out, tick gravity does nothing but clear and collapse
    else {
      return newGame;
    }
  } else {
    //otherwise, shift the block down
    //make sure we dont shift farther than a hard drop would go (handy, that)
    const maxShiftDistance =
      hardDropEndOrigin(newGame.board, newGame.fallingBlock.self)[0] -
      newGame.fallingBlock.self.origin[0];
    const nextBlock = shiftedBlock(
      newGame.fallingBlock.self,
      'D',
      Math.min(maxShiftDistance, ticks)
    );
    return clearFullRowsAndScore(
      collapseGapRows({
        ...newGame,
        fallingBlock: {
          ...newGame.fallingBlock,
          self: nextBlock,
          dropLocation: hardDropEndOrigin(newGame.board, nextBlock),
        },
      })
    );
  }
};

/** SCORING/CLEAR  EVENTS */
/**A row is full if it contains no nulls and is not entirely wall (i.e. the floor)*/
const rowIsFull = (row: Cell[]) =>
  row.every(cellIsOccupied) && !row.every((cell) => cell.type === 'wall');
const rowIsEmpty = (row: Cell[]) =>
  !rowIncludesBlock(row) && !row.every((cell) => cell.type === 'wall');
/**Row has at least one cell that matches SHAPE_COLORS */
const rowIncludesBlock = (row: Cell[]) =>
  row.some((cell) => cell.type === 'block');
/** Gets a list of the indices of full rows on the board */
const fullRows = (board: Board): number[] => {
  return board
    .map((row, rowIndex) => (rowIsFull(row) ? rowIndex : null))
    .filter(isNotNull);
};

/**Clears out filled rows and increments score/lines cleared*/
export const clearFullRowsAndScore = (game: Game): Game => {
  const { board } = game;
  const rowsToClear = fullRows(board);
  const newLinesCleared = game.linesCleared + rowsToClear.length;
  const newLevel = Math.max(
    0,
    Math.floor(newLinesCleared / game.CONFIG.LEVEL_LINES)
  );
  //calculate the new falling speed
  const newGravityTickInterval = game.CONFIG.GRAVITY_LEVELS[newLevel] || 0;
  return {
    ...game,
    score: game.score + clearedLinesScore(rowsToClear.length),
    linesCleared: newLinesCleared,
    level: newLevel,
    gravityTickInterval: newGravityTickInterval,
    // Linearly interpolate settle times and max ground times based on level
    maxGroundTime:
      game.CONFIG.MIN_MAX_GROUND_TIME +
      ((game.CONFIG.BASE_MAX_GROUND_TIME - game.CONFIG.MIN_MAX_GROUND_TIME) *
        Math.max(20 - newLevel, 0)) /
        19,
    settleTime:
      game.CONFIG.MIN_SETTLE_TIME +
      ((game.CONFIG.BASE_SETTLE_TIME - game.CONFIG.MIN_SETTLE_TIME) *
        Math.max(20 - newLevel, 0)) /
        19,
    board: board.map((row, r) =>
      rowsToClear.includes(r) ? newEmptyRow(game.CONFIG) : structuredClone(row)
    ),
  };
};

const clearedLinesScore = (lines: number): number => {
  return [0, 40, 100, 300, 1200][lines];
};

/**Settle the board squares above a clear by an amount equal to the clear*/
export const collapseGapRows = (game: Game): Game => {
  const { board } = game;
  const firstNonEmptyRowIndex = board.findIndex(rowIncludesBlock);
  if (firstNonEmptyRowIndex === -1) return game;
  //indices of the empty rows below the topmost nonempty row
  const emptyRowIndices = board
    .map((row, rowIndex) =>
      !rowIsEmpty(row) && rowIndex >= firstNonEmptyRowIndex ? null : rowIndex
    )
    .filter(isNotNull);
  let newBoard = structuredClone(board);
  //for each empty row index, splice out that row in newBoard and then put a new empty row on top; this should let the rest of the indices keep working as expected
  emptyRowIndices.forEach((rowIndex) => {
    newBoard.splice(rowIndex, 1);
    newBoard = [newEmptyRow(game.CONFIG)].concat(newBoard);
  });
  const newFallingBlock = game.fallingBlock
    ? {
        ...game.fallingBlock,
        dropLocation: hardDropEndOrigin(newBoard, game.fallingBlock.self),
      }
    : null;
  return { ...game, board: newBoard, fallingBlock: newFallingBlock };
};
/** Clears any full rows and simultaneously collapses them */
export const clearThenCollapseRows = (game: Game): Game =>
  collapseGapRows(clearFullRowsAndScore(game));
/** INPUT RESPONSES */

const rotatedBlock = <T extends Block | null>(
  block: T,
  direction: RotDirection
): ConditionalNull<T, Block, Block> =>
  block === null
    ? (null as ConditionalNull<T, Block, Block>)
    : ({
        ...block,
        body: block.body.map((coord) =>
          direction === 'CW'
            ? ([coord[1], -coord[0]] as Coordinate)
            : ([-coord[1], coord[0]] as Coordinate)
        ),
      } as ConditionalNull<T, Block, Block>);

// /**Tells us if a block is on the ground (i.e. one more gravity tick would settle it)*/
const blockOnGround = (
  game: Game
): game is Game & { fallingBlock: { groundTimer: number } } =>
  game.fallingBlock !== null &&
  blockIntersectsSettledOrWalls(
    game.board,
    shiftedBlock(game.fallingBlock.self, 'D'),
    game.CONFIG.WALLS
  );

/** Rotates a block 90° CW | CCW about its origin */
export const rotateBlock = (game: Game, direction: RotDirection): Game => {
  if (game.fallingBlock === null || game.fallingBlock.self.shape === 'O')
    return game;
  const newBlock = rotatedBlock(game.fallingBlock.self, direction);
  //if the rotated block intersects the board or walls, try shifting it one or two spaces in every direction and pick the first that works. Otherwise return with no rotation
  if (blockIntersectsSettledOrWalls(game.board, newBlock, game.CONFIG.WALLS)) {
    const directions: Direction[] = ['R', 'L', 'D', 'U'];
    for (const shiftDir of directions) {
      for (const distance of [1, 2]) {
        const shiftCandidate = shiftedBlock(newBlock, shiftDir, distance);
        //return as soon as we find a shift that makes the rotation work (and set grace to true)
        if (
          !blockIntersectsSettledOrWalls(
            game.board,
            shiftCandidate,
            game.CONFIG.WALLS
          )
        )
          return {
            ...game,
            fallingBlock: {
              ...game.fallingBlock,
              groundTimer: game.settleTime,
              self: shiftCandidate,
              dropLocation: hardDropEndOrigin(game.board, shiftCandidate),
            },
          };
      }
    }
    //if no shifts worked, return game as is
    return game;
  }
  //if we dont intersect, return the game with a rotated block
  return {
    ...game,
    fallingBlock: {
      ...game.fallingBlock,
      groundTimer: game.settleTime,
      self: newBlock,
      dropLocation: hardDropEndOrigin(game.board, newBlock),
    },
  };
};

/**Takes in a block and returns one shifted in the argument direction */
const shiftedBlock = (
  block: Block,
  direction: Direction,
  distance: number = 1
): Block => {
  const transforms: Record<Direction, Coordinate> = {
    L: [0, -distance],
    R: [0, distance],
    U: [-distance, 0],
    D: [distance, 0],
  };
  return {
    ...block,
    origin: coordinateSum(block.origin, transforms[direction]),
  };
};
/**Add current falling piece to the heldShape slot; spawns next block popped either from held slot or the queue if it's the first held piece*/
export const holdAndPopHeld = (game: Game): Game => {
  //if there is no falling block, do nothing
  if (game.fallingBlock === null) return game;
  //If there is no held shape, we hold the current falling block then spawn a new block as usual
  let newGame: Game;
  if (game.heldShape === null)
    newGame = spawnNewBlock({
      ...game,
      heldShape: game.fallingBlock!.self.shape,
    });
  //Otherwise:
  //return a game state where we spawn a new block having just shifted the held shape onto the head of the queue
  else
    newGame = spawnNewBlock({
      ...game,
      heldShape: game.fallingBlock.self.shape, //previous falling shape is now held
      shapeQueue: [game.heldShape, ...game.shapeQueue], //previously held shape is now popped off the queue by spawnNewBlock
    });
  return setAllowedInput(newGame, 'hold', false); //disable hold until next piece
};
/**Shifts the game's falling block one unit L | R | D */
export const shiftBlock = (game: Game, direction: Direction): Game => {
  if (game.fallingBlock === null) return game;
  const nextBlock = shiftedBlock(game.fallingBlock.self, direction, 1);
  return blockIntersectsSettledOrWalls(game.board, nextBlock, game.CONFIG.WALLS)
    ? game
    : {
        ...game,
        fallingBlock: {
          ...game.fallingBlock,
          groundTimer: game.settleTime,
          self: nextBlock,
          dropLocation: hardDropEndOrigin(game.board, nextBlock),
        },
      };
};

/**Returns the block that would result from a hypothetical hard drop */
const hardDropEndOrigin = (
  board: Board,
  fallingBlock: Block | null
): Coordinate => {
  if (fallingBlock === null) return [0, 0];
  const coords = blockOccupiedCells(fallingBlock);
  //the highest row occupied by the falling block
  const highestRowInBlock = (column: number) =>
    coords.reduce(
      (prev, curr) => (curr[1] === column ? Math.min(curr[0], prev) : prev),
      board.length
    );
  //for a given column, get the index of the row containing a column's highest occupied cell (that is below the top of the block)
  const colFloorIndex = (column: number) => {
    const floorIndex = board.findIndex(
      (row, idx) =>
        idx > highestRowInBlock(column) && cellIsOccupied(row[column])
    );

    return floorIndex === -1 ? board.length : floorIndex; //if floorIndex is -1 we didnt find a non-null row so the floor is the board end
  };
  //map the current falling block's cells to their distances from (1 cell above) the floor in their column
  const heights = coords.map(
    ([row, column]) => colFloorIndex(column) - row - 1
  );
  //drop distance is the minimum of these heights
  const distanceToDrop = Math.min(...heights);
  return [fallingBlock.origin[0] + distanceToDrop, fallingBlock.origin[1]];
};

/**Drops a block all the way to the settled pile settles it into the board*/
export const hardDropBlock = (game: Game): Game => {
  if (game.fallingBlock === null || game.over) return game;
  const newBlockOrigin = hardDropEndOrigin(game.board, game.fallingBlock.self); //get the position of a hard drop
  const newBlock = {
    ...game.fallingBlock,
    self: { ...game.fallingBlock.self, origin: newBlockOrigin },
  };
  return settleBlockAndSpawnNew({ ...game, fallingBlock: newBlock }); //move the falling block to that end position, settle, and spawn new
};

/** Returns a board containing the fallingBlock cells filled in for rendering purposes */
export const boardWithFallingBlock = (game: Game): Board => {
  const { fallingBlock, board } = game;
  if (fallingBlock === null) return board;
  const fallingBlockOccupiedCells = blockOccupiedCells(fallingBlock.self);
  const shadowOccupiedCells = blockOccupiedCells({
    ...fallingBlock.self,
    origin: fallingBlock.dropLocation,
  });
  return board.map((row, r) =>
    row.map((cell, c) =>
      fallingBlockOccupiedCells.some(
        (coord) => coord[0] === r && coord[1] === c
      )
        ? { color: CONFIG.SHAPE_COLORS[fallingBlock.self.shape], type: 'block' }
        : shadowOccupiedCells.some((coord) => coord[0] === r && coord[1] === c)
          ? {
              color: game.CONFIG.SHAPE_COLORS[fallingBlock.self.shape],
              type: 'shadow',
            }
          : cell
    )
  );
};

/**Returns a board for displaying upcoming shape(s) */
export const miniPreviewBoard = (
  shapeQueue: Game['shapeQueue'],
  config: Config
): Board => {
  const upcomingShape = shapeQueue[0];

  // Create a small box with walls
  const boxSize = 8; // 6x6 inner area + 1 cell padding on each side
  const miniBoard: Board = Array(boxSize)
    .fill(null)
    .map(() => Array(boxSize).fill({ color: config.WALL_COLOR, type: 'wall' }));

  // Fill the inner area with empty cells
  for (let r = 1; r < boxSize - 1; r++) {
    for (let c = 1; c < boxSize - 1; c++) {
      miniBoard[r][c] = { color: [0, 0, 0], type: 'empty' };
    }
  }
  if (upcomingShape === undefined) return miniBoard; //if there is no upcoming shape, return the blank board
  // Place the upcoming shape in the center of the box
  const origin: Coordinate = [4, 4];
  const shapeCoords = config.BLOCK_SHAPES[upcomingShape].map((coord) =>
    coordinateSum(coord, origin)
  );
  shapeCoords.forEach(([r, c]) => {
    miniBoard[r][c] = {
      color: config.SHAPE_COLORS[upcomingShape],
      type: 'block',
    };
  });

  return miniBoard;
};

/**Literally does the same thing as miniPreviewBoard but for the held shape for now */
export const miniHeldBoard = (heldShape: TetrisShape | null, config: Config) =>
  heldShape
    ? miniPreviewBoard([heldShape], config)
    : miniPreviewBoard([], config);
