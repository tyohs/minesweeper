export type CellState = 'hidden' | 'flagged' | 'questioned' | 'revealed';

export type Cell = {
  adjacentMines: number;
  isMine: boolean;
  state: CellState;
};

export type Board = Cell[][];

export type Position = {
  x: number;
  y: number;
};

export type RevealResult = {
  board: Board;
  hitMine: boolean;
};

export type RandomSource = () => number;

const DIRECTIONS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
] as const;

export function createBoard(rows: number, columns: number): Board {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => ({
      adjacentMines: 0,
      isMine: false,
      state: 'hidden' as const,
    })),
  );
}

function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function isInside(board: Board, { x, y }: Position): boolean {
  return y >= 0 && y < board.length && x >= 0 && x < (board[0]?.length ?? 0);
}

function getNeighbors(board: Board, position: Position): Position[] {
  return DIRECTIONS.map(([dx, dy]) => ({ x: position.x + dx, y: position.y + dy })).filter(
    (neighbor) => isInside(board, neighbor),
  );
}

export function placeMines(
  board: Board,
  mineCount: number,
  firstClick: Position,
  random: RandomSource = Math.random,
): Board {
  const rows = board.length;
  const columns = board[0]?.length ?? 0;
  const availableCellCount = rows * columns - 1;

  if (!isInside(board, firstClick)) {
    throw new RangeError('First click must be inside the board.');
  }
  if (mineCount < 0 || mineCount > availableCellCount) {
    throw new RangeError('Mine count must fit in the board while keeping the first click safe.');
  }

  const nextBoard = createBoard(rows, columns);
  const candidates = Array.from({ length: rows * columns }, (_, index) => ({
    x: index % columns,
    y: Math.floor(index / columns),
  })).filter(({ x, y }) => x !== firstClick.x || y !== firstClick.y);

  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(random() * (index + 1));
    const candidate = candidates[index];
    candidates[index] = candidates[targetIndex];
    candidates[targetIndex] = candidate;
  }

  candidates.slice(0, mineCount).forEach(({ x, y }) => {
    nextBoard[y][x].isMine = true;
  });

  return nextBoard.map((row, y) =>
    row.map((cell, x) => ({
      ...cell,
      adjacentMines: getNeighbors(nextBoard, { x, y }).filter(
        (neighbor) => nextBoard[neighbor.y][neighbor.x].isMine,
      ).length,
    })),
  );
}

export function revealCell(board: Board, start: Position): RevealResult {
  if (!isInside(board, start)) {
    return { board, hitMine: false };
  }

  const startCell = board[start.y][start.x];
  if (startCell.state !== 'hidden' && startCell.state !== 'questioned') {
    return { board, hitMine: false };
  }

  const nextBoard = cloneBoard(board);
  if (startCell.isMine) {
    nextBoard[start.y][start.x].state = 'revealed';
    return { board: nextBoard, hitMine: true };
  }

  const queue = [start];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    const key = `${current.x}:${current.y}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const cell = nextBoard[current.y][current.x];
    if (cell.isMine || cell.state === 'flagged') continue;

    cell.state = 'revealed';
    if (cell.adjacentMines === 0) {
      getNeighbors(nextBoard, current).forEach((neighbor) => {
        const neighborCell = nextBoard[neighbor.y][neighbor.x];
        if (!neighborCell.isMine && neighborCell.state !== 'revealed') queue.push(neighbor);
      });
    }
  }

  return { board: nextBoard, hitMine: false };
}

export function toggleMark(board: Board, position: Position): Board {
  if (!isInside(board, position)) return board;

  const current = board[position.y][position.x];
  if (current.state === 'revealed') return board;

  const nextBoard = cloneBoard(board);
  const nextState: Record<Exclude<CellState, 'revealed'>, Exclude<CellState, 'revealed'>> = {
    hidden: 'flagged',
    flagged: 'questioned',
    questioned: 'hidden',
  };
  nextBoard[position.y][position.x].state = nextState[current.state];
  return nextBoard;
}

export function revealAllMines(board: Board): Board {
  return board.map((row) =>
    row.map((cell) => (cell.isMine ? { ...cell, state: 'revealed' } : { ...cell })),
  );
}

export function isCleared(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell.isMine || cell.state === 'revealed'));
}

export function countFlags(board: Board): number {
  return board.flat().filter((cell) => cell.state === 'flagged').length;
}

export function advanceTimer(current: number): number {
  return Math.min(current + 1, 999);
}
