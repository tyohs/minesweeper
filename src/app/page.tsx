'use client';

import { useEffect, useState } from 'react';
import type { Board, Cell, Position } from '../lib/minesweeper';
import {
  advanceTimer,
  countFlags,
  createBoard,
  isCleared,
  placeMines,
  revealAllMines,
  revealCell,
  toggleMark,
} from '../lib/minesweeper';
import styles from './page.module.css';

const ROWS = 9;
const COLUMNS = 9;
const MINE_COUNT = 10;

type GameStatus = 'waiting' | 'playing' | 'gameOver' | 'clear';

function getCellLabel(cell: Cell, { x, y }: Position): string {
  const location = `${y + 1}行${x + 1}列`;
  if (cell.state === 'flagged') return `${location}、旗`;
  if (cell.state === 'questioned') return `${location}、不明`;
  if (cell.state === 'hidden') return `${location}、閉じたマス`;
  if (cell.isMine) return `${location}、地雷`;
  if (cell.adjacentMines === 0) return `${location}、周囲に地雷なし`;
  return `${location}、周囲の地雷${cell.adjacentMines}個`;
}

function getStatusMessage(status: GameStatus): string {
  switch (status) {
    case 'playing':
      return 'ゲーム中です。右クリックで旗と疑問符を切り替えられます。';
    case 'gameOver':
      return 'ゲームオーバー。顔ボタンで再挑戦できます。';
    case 'clear':
      return 'ゲームクリア！おめでとうございます。';
    default:
      return '最初のマスを選んでゲームを始めてください。';
  }
}

export default function Home() {
  const [board, setBoard] = useState<Board>(() => createBoard(ROWS, COLUMNS));
  const [status, setStatus] = useState<GameStatus>('waiting');
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (status !== 'playing') return;

    const timer = window.setInterval(() => {
      setTime(advanceTimer);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status]);

  const resetGame = () => {
    setBoard(createBoard(ROWS, COLUMNS));
    setStatus('waiting');
    setTime(0);
  };

  const handleReveal = (position: Position) => {
    if (status === 'gameOver' || status === 'clear') return;

    const preparedBoard = status === 'waiting' ? placeMines(board, MINE_COUNT, position) : board;
    const result = revealCell(preparedBoard, position);

    if (result.hitMine) {
      setBoard(revealAllMines(result.board));
      setStatus('gameOver');
      return;
    }

    setBoard(result.board);
    setStatus(isCleared(result.board) ? 'clear' : 'playing');
  };

  const handleMark = (event: React.MouseEvent<HTMLButtonElement>, position: Position) => {
    event.preventDefault();
    if (status === 'gameOver' || status === 'clear') return;
    setBoard((current) => toggleMark(current, position));
  };

  const remainingMines = Math.max(0, MINE_COUNT - countFlags(board));

  return (
    <main className={styles.container}>
      <section className={styles.game} aria-label="マインスイーパー">
        <header className={styles.header}>
          <output className={styles.digitalDisplay} aria-label={`残り地雷${remainingMines}個`}>
            {String(remainingMines).padStart(3, '0')}
          </output>

          <button
            aria-label="ゲームをリセット"
            className={styles.resetButton}
            data-status={status}
            onClick={resetGame}
            type="button"
          >
            <span className={styles.faceIcon} aria-hidden="true" />
          </button>

          <output className={styles.digitalDisplay} aria-label={`経過時間${time}秒`}>
            {String(time).padStart(3, '0')}
          </output>
        </header>

        <div className={styles.board} role="group" aria-label="9行9列の盤面">
          {board.map((row, y) =>
            row.map((cell, x) => {
              const position = { x, y };
              const isRevealed = cell.state === 'revealed';
              const iconPosition = cell.isMine
                ? '-300px 0'
                : cell.adjacentMines > 0
                  ? `${(cell.adjacentMines - 1) * -30}px 0`
                  : undefined;

              return (
                <button
                  aria-label={getCellLabel(cell, position)}
                  className={isRevealed ? styles.openCell : styles.cell}
                  disabled={isRevealed}
                  key={`${x}-${y}`}
                  onClick={() => handleReveal(position)}
                  onContextMenu={(event) => handleMark(event, position)}
                  type="button"
                >
                  {isRevealed && iconPosition ? (
                    <span
                      aria-hidden="true"
                      className={styles.iconCell}
                      style={{ backgroundPosition: iconPosition }}
                    />
                  ) : null}
                  {cell.state === 'flagged' || cell.state === 'questioned' ? (
                    <span
                      aria-hidden="true"
                      className={styles.iconFlagAndQuestion}
                      style={{
                        backgroundPosition: cell.state === 'flagged' ? '-270px 0' : '-240px 0',
                      }}
                    />
                  ) : null}
                </button>
              );
            }),
          )}
        </div>
      </section>

      <p className={styles.status} aria-live="polite">
        {getStatusMessage(status)}
      </p>
    </main>
  );
}
