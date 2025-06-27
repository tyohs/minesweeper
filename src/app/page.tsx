'use client';

import { useMemo, useState } from 'react';
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

// ヘルパー関数：空の盤面を作成
const createEmptyBoard = (rows: number, cols: number): number[][] => {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
};

// ヘルパー関数：爆弾をランダムに配置した新しい盤面を生成
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
    newBombMap[y][x] = 11; // 爆弾を11とする
    bombsPlaced++;
  }
  return newBombMap;
};

// ヘルパー関数：表示用の盤面を計算
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

      // 0:未開封, 9:旗, 8:? はそのまま表示コードとして使う
      if (userInput === 0 || userInput === 9 || userInput === 8) {
        displayBoard[y][x] = userInput;
        continue;
      }
      // 踏んでしまった爆弾
      if (userInput === 11) {
        displayBoard[y][x] = 11;
        continue;
      }
      // 開封済みの安全なマス
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

// ヘルパー関数：安全なセルを連鎖的に開く
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
    if (cy < 0 || cy >= height || cx < 0 || cx >= width || newUserInputs[cy][cx] !== 0) {
      return;
    }

    if (bombMap[cy][cx] !== 0) {
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
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'gameOver'>('waiting');

  const boardForDisplay = useMemo(() => {
    return calcBoard(userInputs, bombMap);
  }, [userInputs, bombMap]);

  const clickHandler = (x: number, y: number) => {
    if (gameStatus === 'gameOver' || userInputs[y][x] !== 0) {
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
      return;
    }

    const finalUserInputs = openSafeCells(y, x, currentBombMap, userInputs);
    setUserInputs(finalUserInputs);
  };

  const handleRightClick = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (
      gameStatus === 'gameOver' ||
      (userInputs[y][x] !== 0 && userInputs[y][x] !== 9 && userInputs[y][x] !== 8)
    ) {
      return;
    }
    const newUserInputs = structuredClone(userInputs);
    newUserInputs[y][x] = newUserInputs[y][x] === 0 ? 9 : newUserInputs[y][x] === 9 ? 8 : 0;
    setUserInputs(newUserInputs);
  };

  return (
    <div className={styles.container}>
      <div className={styles.board}>
        {boardForDisplay.map((row, y) =>
          row.map((displayCode, x) => {
            // 未開封、旗、？ の状態のセル
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
                      className={styles.iconFlagAndQuestion} // 旗と？のアイコンを表示する共通のクラス
                      style={{ backgroundPosition: displayCode === 9 ? '-270px 0' : '-240px 0' }}
                    />
                  )}
                </div>
              );
            }

            // 開封済みのセル
            if (displayCode === -1) {
              // 空マス
              return <div key={`${x}-${y}`} className={styles.openCell} />;
            }

            // 数字または爆弾のセル
            return (
              <div key={`${x}-${y}`} className={styles.openCell}>
                <div
                  className={styles.iconCell}
                  style={{
                    backgroundPosition:
                      displayCode >= 1 && displayCode <= 8
                        ? `${(displayCode - 1) * -30}px 0` // 数字
                        : '-300px 0', // 爆弾
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
