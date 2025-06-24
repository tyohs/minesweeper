'use client';

import { useState } from 'react';
import styles from './page.module.css';

// const calcTotalPoint = (arr: number[], counter: number) => {
//   counter;
//   const su = arr.reduce((accumulater, currntValue) => accumulater + currntValue);
//   return su + counter;
// };
// const down = (n: number) => {
//   if (n === -1) {
//     return;
//   } else {
//     console.log(n);
//     down(n - 1);
//   }
// };
// down(10);
// const sum1 = (n: number): number => {
//   return n <= 1 ? n : n + sum1(n - 1);
// };
// const sum2 = (s: number, i: number): number => {
//   // if (i <= s) {
//   //   return s;
//   // } else {
//   //   return i + sum2(s, i - 1);
//   // }
//   return i <= s ? s : i + sum2(s, i - 1);
// };
// const sum3 = (s: number, i: number): number => {
//   return (1 / 2) * (i - s + 1) * (s + i);
// };
// console.log(sum1(10));
// console.log(sum2(3, 10));
// console.log(sum3(4, 10));
export default function Home() {
  const [sampleCounter, setSampleCounter] = useState(0);
  const board = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const [bombMap, setBombMap] = useState(board);
  const [userInputs, setUserInputs] = useState(board);
  const [gameStarted, setGameStarted] = useState(false);
  const [numberMap, setNumberMap] = useState(board);
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
  // console.log('sampleCounter=', sampleCounter);
  // const [samplePoints, setSamplePoints] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  // console.log('samplePoints=', samplePoints);
  // const totalPoint = calcTotalPoint(samplePoints, sampleCounter);
  // console.log('totalPoint=', totalPoint);
  // setSampleCounter((sampleCounter + 1) % 14);
  // const newSamplePoints = structuredClone(samplePoints);
  // newSamplePoints[sampleCounter] += 1;
  // setSamplePoints(newSamplePoints);
  const calcBoard = (userInputs: number[][], bombMap: number[][]): number[][] => {
    const height = userInputs.length;
    const width = userInputs[0]?.length || 0;
    // 表示用の新しい盤面を作成
    const displayBoard: number[][] = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => 0),
    );

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const userInput = userInputs[y][x];
        const isBomb = bombMap[y][x] === 10; // 爆弾の値はあなたのコードに合わせて10とします

        if (userInput === 0) {
          // 未開封
          displayBoard[y][x] = 0;
        } else if (userInput === 9 || userInput === 8) {
          // 旗または「？」
          displayBoard[y][x] = userInput;
        } else if (userInput === 10) {
          // 踏んでしまった爆弾
          displayBoard[y][x] = 10;
        } else if (userInput === -1) {
          // 開封済みの安全なマス
          if (isBomb) {
            // このルートは通常通りませんが、安全のために
            displayBoard[y][x] = 11; // 別の爆弾コード
          } else {
            // ★★★ ここで、その場で周囲の爆弾の数を数える ★★★
            let bombCount = 0;
            for (const [dy, dx] of directions) {
              if (bombMap[y + dy]?.[x + dx] === 10) {
                bombCount++;
              }
            }
            // 計算結果を表示用の値としてセット (0の場合は開封済みを示す-1)
            displayBoard[y][x] = bombCount > 0 ? bombCount : -1;
          }
        }
      }
    }
    // ゲームオーバー時の処理などもここに追加できます

    return displayBoard;
  };
  const boardForDisplay = calcBoard(userInputs, bombMap);
  const bombRandom = () => {
    numberMap;
    let bombCounter = 0;
    const newBombMap = structuredClone(bombMap);
    while (bombCounter < 10) {
      const y = Math.floor(Math.random() * 9);
      const x = Math.floor(Math.random() * 9);
      if (bombMap[y][x] === 0) {
        newBombMap[y][x] = 10;
        bombCounter++;
      }
    }
    return newBombMap;
  };
  //git hub gemini
  //calc何に使う？←userinputsとbombmapを 合わせて爆弾を認知する、tsxでの管理
  const clickHandler = (x: number, y: number) => {
    if (userInputs[y][x] !== 0) {
      return;
    }
    console.log(x, y);
    const newUserInputs = structuredClone(userInputs);
    let currentBombMap = bombMap;
    if (!gameStarted) {
      const generatedBombMap = bombRandom();
      setBombMap(generatedBombMap);
      currentBombMap = generatedBombMap;
      setGameStarted(true);
    }
    if (currentBombMap[y][x] === 10) {
      newUserInputs[y][x] = 10;
      console.log('ボム');
    } else {
      newUserInputs[y][x] = -1;
    }
    setUserInputs(newUserInputs);
  };
  const handleRightClick = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (userInputs[y][x] === -1 || userInputs[y][x] === 11) {
      return;
    }
    const newUserInputs = structuredClone(userInputs);
    if (newUserInputs[y][x] === 0) {
      newUserInputs[y][x] = 9;
    } else if (newUserInputs[y][x] === 9) {
      newUserInputs[y][x] = 8;
    } else if (newUserInputs[y][x] === 8) {
      newUserInputs[y][x] = 0;
    }
    setUserInputs(newUserInputs);
  };
  return (
    <div className={styles.container}>
      <div className={styles.board}>
        {/* 表示用の盤面データ(boardForDisplay)を元にmapを実行 */}
        {boardForDisplay.map((row, y) =>
          row.map((displayCode, x) => {
            // このセルに適用するCSSクラスを格納する配列
            const classNames = [styles.cell]; // 全てのセルに基本の .cell を適用

            // displayCodeの値に応じて、追加のクラスを決定する

            // --- セルの見た目を決定 ---
            if (
              displayCode === -1 ||
              (displayCode >= 1 && displayCode <= 8) ||
              displayCode === 11
            ) {
              // 開封済みのマス（空、数字、爆弾）
              classNames.push(styles.opened);
            }

            // --- セルの中身（アイコン）を決定 ---
            if (displayCode >= 1 && displayCode <= 8) {
              // 数字アイコンの場合
              classNames.push(styles[`iconNumber${displayCode}`]); // 例: styles.iconNumber1
            } else if (displayCode === 9) {
              // 「？」アイコンの場合
              classNames.push(styles.iconQuestion);
            } else if (displayCode === 10) {
              // 旗アイコンの場合
              classNames.push(styles.iconFlag);
            } else if (displayCode === 11) {
              // 爆弾アイコンの場合
              classNames.push(styles.iconBomb);
            }
            // displayCodeが0（未開封）や-1（空の開封済みマス）の場合は、アイコン用のクラスは追加されない

            // --- クリックイベントの有無を決定 ---
            // 未開封、旗、？ の状態のセルだけクリックイベントを付与する
            if (displayCode === 0 || displayCode === 9 || displayCode === 10) {
              return (
                <div
                  key={`${x}-${y}`}
                  className={classNames.join(' ')}
                  onClick={() => clickHandler(x, y)}
                  onContextMenu={(e) => handleRightClick(e, x, y)}
                />
              );
            }

            // それ以外（開封済みのセル）はクリックイベントなし
            return <div key={`${x}-${y}`} className={classNames.join(' ')} />;
          }),
        )}
      </div>
    </div>
  );
}
