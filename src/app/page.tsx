'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';
const directions = [
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
];
const createEmptyBoard = (rows: number, cols: number): number[][] => {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
};
const generateBombMap = (
  rows: number,
  cols: number,
  bombCount: number,
  firstClick: { y: number; x: number },
): number[][] => {
  const newBombMap = createEmptyBoard(rows, cols);
  let bombsPlaced = 0;
  while (bombsPlaced < bombCount) {
    const y = Math.floor(Math.random() * rows);
    const x = Math.floor(Math.random() * cols);
    if ((y === firstClick.y && x === firstClick.x) || newBombMap[y][x] !== 0) {
      continue;
    }
    newBombMap[y][x] = 11;
    bombsPlaced++;
  }
  return newBombMap;
};
const calcBoard = (userInputBoard: number[][], bombMap: number[][]): number[][] => {
  const height = userInputBoard.length;
  const width = userInputBoard[0]?.length || 0;
  const displayBoard: number[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 0),
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const userInput = userInputBoard[y][x];
      const isBomb = bombMap[y][x] === 11;
      if (userInput === 0 || userInput === 9 || userInput === 8) {
        displayBoard[y][x] = userInput;
        continue;
      }
      if (userInput === 11) {
        displayBoard[y][x] = 11;
        continue;
      }
      if (userInput === -1) {
        if (isBomb) {
          displayBoard[y][x] = 11;
        } else {
          let adjacentBombs = 0;
          for (const [dy, dx] of directions) {
            if (bombMap[y + dy]?.[x + dx] === 11) {
              adjacentBombs++;
            }
          }
          displayBoard[y][x] = adjacentBombs > 0 ? adjacentBombs : -1;
        }
      }
    }
  }
  return displayBoard;
};
const openSafeCells = (
  y: number,
  x: number,
  bombMap: number[][],
  currentInputs: number[][],
): number[][] => {
  const newUserInputs = structuredClone(currentInputs);
  const height = bombMap.length;
  const width = bombMap[0]?.length || 0;

  const recursiveOpen = (cy: number, cx: number) => {
    if (cy < 0 || cy >= height || cx < 0 || cx >= width || newUserInputs[cy][cx] === -1) {
      return;
    }
    if (bombMap[cy][cx] === 11) {
      return;
    }
    newUserInputs[cy][cx] = -1;
    let adjacentBombs = 0;
    for (const [dy, dx] of directions) {
      if (bombMap[cy + dy]?.[cx + dx] === 11) {
        adjacentBombs++;
      }
    }
    if (adjacentBombs === 0) {
      for (const [dy, dx] of directions) {
        recursiveOpen(cy + dy, cx + dx);
      }
    }
  };

  recursiveOpen(y, x);
  return newUserInputs;
};
export default function Home() {
  const ROWS = 9;
  const COLS = 9;
  const BOMB_COUNT = 10;

  const [userInputs, setUserInputs] = useState(() => createEmptyBoard(ROWS, COLS));
  const [bombMap, setBombMap] = useState(() => createEmptyBoard(ROWS, COLS));
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'gameOver' | 'clear'>(
    'waiting',
  );
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (gameStatus !== 'playing') {
      return;
    }
    const isGameInProgress = userInputs.some((row, y) =>
      row.some((cell, x) => bombMap[y][x] !== 11 && cell === 0),
    );
    if (!isGameInProgress) {
      setGameStatus('clear');
      window.alert('ゲームクリア！おめでとうございます！');
    }
  }, [userInputs, bombMap, gameStatus]);
  const boardForDisplay = useMemo(() => {
    return calcBoard(userInputs, bombMap);
  }, [userInputs, bombMap]);
  const resetGame = () => {
    setUserInputs(createEmptyBoard(ROWS, COLS));
    setBombMap(createEmptyBoard(ROWS, COLS));
    setGameStatus('waiting');
    setTime(0);
  };
  const getFaceStyle = () => {
    switch (gameStatus) {
      case 'gameOver':
        return { backgroundPosition: '-390px 0' };
      case 'clear':
        return { backgroundPosition: '-360px 0' };
      default:
        return { backgroundPosition: '-330px 0' };
    }
  };

  const clickHandler = (x: number, y: number) => {
    if (gameStatus === 'gameOver' || gameStatus === 'clear' || userInputs[y][x] !== 0) {
      return;
    }

    let currentBombMap = bombMap;
    if (gameStatus === 'waiting') {
      const newBombMap = generateBombMap(ROWS, COLS, BOMB_COUNT, { y, x });
      setBombMap(newBombMap);
      setGameStatus('playing');
      currentBombMap = newBombMap;
    }

    if (currentBombMap[y][x] === 11) {
      const newUserInputs = structuredClone(userInputs);
      newUserInputs[y][x] = 11;
      setUserInputs(newUserInputs);
      setGameStatus('gameOver');
      console.log('ボム！ ゲームオーバー');
      window.alert('ゲームオーバー');
      return;
    }

    const finalUserInputs = openSafeCells(y, x, currentBombMap, userInputs);
    setUserInputs(finalUserInputs);
  };

  const handleRightClick = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (
      gameStatus === 'gameOver' ||
      gameStatus === 'clear' ||
      (userInputs[y][x] !== 0 && userInputs[y][x] !== 9 && userInputs[y][x] !== 8)
    ) {
      return;
    }
    const newUserInputs = structuredClone(userInputs);
    newUserInputs[y][x] = newUserInputs[y][x] === 0 ? 9 : newUserInputs[y][x] === 9 ? 8 : 0;
    setUserInputs(newUserInputs);
  };
  const flagCount = userInputs.flat().filter((cell) => cell === 9).length;
  const remainingBombs = BOMB_COUNT - flagCount;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* ↓ 追加：残り爆弾数の表示 */}
        <div className={styles.digitalDisplay}>{String(remainingBombs).padStart(3, '0')}</div>

        <button className={styles.resetButton} onClick={resetGame}>
          <div className={styles.faceIcon} style={getFaceStyle()} />
        </button>

        {/* ↓ 追加：時間の表示 */}
        <div className={styles.digitalDisplay}>{String(time).padStart(3, '0')}</div>
      </div>
      <div className={styles.board}>
        {boardForDisplay.map((row, y) =>
          row.map((displayCode, x) => {
            if (displayCode === 0 || displayCode === 8 || displayCode === 9) {
              return (
                <div
                  key={`${x}-${y}`}
                  className={styles.cell}
                  onClick={() => clickHandler(x, y)}
                  onContextMenu={(e) => handleRightClick(e, x, y)}
                >
                  {(displayCode === 9 || displayCode === 8) && (
                    <div
                      className={styles.iconFlagAndQuestion}
                      style={{
                        backgroundPosition: displayCode === 9 ? '-270px 0' : '-240px 0',
                      }}
                    />
                  )}
                </div>
              );
            }

            if (displayCode === -1) {
              return <div key={`${x}-${y}`} className={styles.openCell} />;
            }
            return (
              <div key={`${x}-${y}`} className={styles.openCell}>
                <div
                  className={styles.iconCell}
                  style={{
                    backgroundPosition:
                      displayCode >= 1 && displayCode <= 8
                        ? `${(displayCode - 1) * -30}px 0`
                        : '-300px 0',
                  }}
                />
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
