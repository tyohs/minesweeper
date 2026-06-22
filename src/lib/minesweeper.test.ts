import { describe, expect, it } from 'vitest';
import {
  advanceTimer,
  countFlags,
  createBoard,
  isCleared,
  placeMines,
  revealAllMines,
  revealCell,
  toggleMark,
} from './minesweeper';

describe('minesweeper engine', () => {
  it('places the requested number of unique mines and protects the first click', () => {
    const firstClick = { x: 4, y: 4 };
    const board = placeMines(createBoard(9, 9), 10, firstClick, () => 0.25);

    expect(board.flat().filter((cell) => cell.isMine)).toHaveLength(10);
    expect(board[firstClick.y][firstClick.x].isMine).toBe(false);
  });

  it('opens a connected empty area without opening mines', () => {
    const board = placeMines(createBoard(5, 5), 1, { x: 0, y: 0 }, () => 0);
    const emptyPosition = board
      .flatMap((row, y) => row.map((cell, x) => ({ cell, x, y })))
      .find(({ cell }) => !cell.isMine && cell.adjacentMines === 0);

    expect(emptyPosition).toBeDefined();
    if (!emptyPosition) return;

    const result = revealCell(board, emptyPosition);
    expect(result.hitMine).toBe(false);
    expect(result.board.flat().filter((cell) => cell.state === 'revealed').length).toBeGreaterThan(
      1,
    );
    expect(
      result.board.flat().filter((cell) => cell.isMine && cell.state === 'revealed'),
    ).toHaveLength(0);
  });

  it('does not treat marked safe cells as opened', () => {
    let board = placeMines(createBoard(3, 3), 1, { x: 0, y: 0 }, () => 0.5);
    const safePositions = board
      .flatMap((row, y) => row.map((cell, x) => ({ cell, x, y })))
      .filter(({ cell }) => !cell.isMine);
    const marked = safePositions[0];

    board = toggleMark(board, marked);
    safePositions.slice(1).forEach(({ x, y }) => {
      board = revealCell(board, { x, y }).board;
    });

    expect(board[marked.y][marked.x].state).toBe('flagged');
    expect(isCleared(board)).toBe(false);
  });

  it('clears only after every safe cell is revealed', () => {
    let board = placeMines(createBoard(3, 3), 1, { x: 0, y: 0 }, () => 0.5);
    board
      .flatMap((row, y) => row.map((cell, x) => ({ cell, x, y })))
      .filter(({ cell }) => !cell.isMine)
      .forEach(({ x, y }) => {
        board = revealCell(board, { x, y }).board;
      });

    expect(isCleared(board)).toBe(true);
  });

  it('reports a mine hit and can reveal all mines', () => {
    const board = placeMines(createBoard(4, 4), 3, { x: 0, y: 0 }, () => 0.7);
    const mine = board
      .flatMap((row, y) => row.map((cell, x) => ({ cell, x, y })))
      .find(({ cell }) => cell.isMine);

    expect(mine).toBeDefined();
    if (!mine) return;

    const result = revealCell(board, mine);
    expect(result.hitMine).toBe(true);
    expect(
      revealAllMines(result.board)
        .flat()
        .filter((cell) => cell.isMine && cell.state === 'revealed'),
    ).toHaveLength(3);
  });

  it('cycles hidden cells through flag, question and hidden', () => {
    let board = createBoard(2, 2);
    board = toggleMark(board, { x: 0, y: 0 });
    expect(board[0][0].state).toBe('flagged');
    expect(countFlags(board)).toBe(1);
    board = toggleMark(board, { x: 0, y: 0 });
    expect(board[0][0].state).toBe('questioned');
    board = toggleMark(board, { x: 0, y: 0 });
    expect(board[0][0].state).toBe('hidden');
  });

  it('caps the timer at 999 seconds', () => {
    expect(advanceTimer(0)).toBe(1);
    expect(advanceTimer(999)).toBe(999);
  });
});
