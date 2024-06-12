/**
 * Types
 */

type Game = {
  board: Board;
  fallingBlock: Block;
  inputForbidden: boolean;
};

// spawnBlock (game) -> game
// tickGravity (game) -> game
// shiftBlock (game) -> game
// rotateBlock (game) -> game
// dropBlock (game) -> game

//setInputTimeout -> setTimeout(inputDelay => inputForbidden --> true)
//
//Cell contains either a color code or null if it is empty
type Cell = {
  fill: string | null;
};
type Board = Cell[][];
type Block = {
  position: [number, number];
  orientation: 0 | 90 | 180 | 270;
  shape: keyof typeof blockShapes;
};

/**
 * Data
 */
const BLOCK_SHAPES = {
  I: [
    [-1, 0],
    [1, 0],
    [2, 0],
    [3, 0]
  ],
  T: [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1]
  ],
  O: [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1]
  ],
  S: [
    [0, 0],
    [0, 1],
    [1, 1],
    [-1, 0]
  ],
  Z: [
    [0, 0],
    [1, 0],
    [-1, 1],
    [0, 1]
  ],
  L: [
    [1, 0],
    [0, 0],
    [0, 1],
    [0, 2]
  ],
  J: [
    [0, 0],
    [-1, 0],
    [0, 1],
    [0, 2]
  ]
};
/**
 * Functions
 */


const blockIntersectsSettled (board:Board, block:Block) {
    
}

const getRandomBlockShape = () => {
    const keys = Object.keys(BLOCK_SHAPES) as Array<keyof typeof BLOCK_SHAPES>
    return keys[(keys.length * Math.random()) << 0]
}
const spawnBlock = (game:Game):Game =>{
    const blockShape = BLOCK_SHAPES[getRandomBlockShape()]

    //check for collision

    //return game with new shape attached at its position
}

//row is full if none of its cells are `null`
const rowIsFull = (row: Cell[]): boolean => row.every(cell => cell);

