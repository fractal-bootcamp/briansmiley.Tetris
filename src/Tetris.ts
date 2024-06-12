/**
 * Types
 */

type Game = {
  board: Board;
  fallingBlock: Block;
  inputForbidden: boolean;
};

//Cell contains either a color code or null if it is empty
type Cell = {
  fill: string | null;
};

type Board = Cell[][];

/**
 * Blocks are defined by their origin (board location of their pivot), and their body (offsets from their origin to each of their constituent cells)
 */
type Block = {
  origin: Coordinate;
  body: Coordinate[]
  shape: TetrisShape;
  };
  
type Coordinate = [number,number]

type TetrisShape = "I" | "T" | "O" | "S" | "Z" | "L" | "J"


/**
 * Data
 */
const BLOCK_SHAPES: Record<TetrisShape,Coordinate[]> = {
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
const SPAWN_POINT:Coordinate = [ 4, 0 ]
const SHAPE_COLORS:Record<TetrisShape,string> = {
    I: "#00ffff",
    T: "#800080",
    O: "#ffff00",
    S: "#ff0000",
    Z: "#800080",
    L: "#ff7f00",
    J: "#0000ff"
}
/**
 * Functions
 */

// spawnBlock (game) -> game
// tickGravity (game) -> game
// shiftBlock (game) -> game
// rotateBlock (game) -> game
// dropBlock (game) -> game


const makeNewBlock = () => {
    
}
const orientedBlock = (block:Block, ) => {

}

const coordinateSum = (c1:Coordinate, c2:Coordinate):Coordinate {
    return [ c1[0] + c2[0], c1[1] + c2[1] ]
}
//gets the on-board coordinates of all of a block's cells
const blockOccupiedCells = (block: Block) => {
    return block.body.map(cell => coordinateSum(cell,block.origin))
}

//checks whether a proposed block position will be a collision
const blockIntersectsSettled = (board:Board, block:Block) => {
    return blockOccupiedCells(block).some( boardLocation => board[boardLocation[0]][boardLocation[1]].fill)
}
//get the next spawnable block, currently at random

/**For later: The NES Tetris randomizer is super basic. Basically it rolls an 8 sided die, 1-7 being the 7 pieces
 *  and 8 being "reroll". If you get the same piece as the last piece you got, or you hit the reroll number, It'll 
 * roll a 2nd 7 sided die. This time you can get the same piece as your previous one and the roll is final. */
const getNewBlockShape = () => {
    const keys = Object.keys(BLOCK_SHAPES) as Array<keyof typeof BLOCK_SHAPES>
    return keys[(keys.length * Math.random()) << 0]
}
//generates a random new falling block and places it at game origin
const spawnBlock = (game:Game):Game =>{
    const shape = getNewBlockShape()
    const body = BLOCK_SHAPES[shape].body
    const newBlock: Block = {
        origin: SPAWN_POINT,
        shape,
        body
    }
    return {
        board: game.board,
        fallingBlock: newBlock,
        inputForbidden: false,
    }

}

//row is full if none of its cells are `null`
const rowIsFull = (row: Cell[]): boolean => row.every(cell => cell);

const settleBlock = (game:Game):Game => {

}