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
  const calcBoard = (userInputs: number[][], bombMap: number[][]) => {
    const newcalc = structuredClone(board);
    const h = userInputs.length;
    const w = userInputs[0].length;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (userInputs[y][x] === -1) {
          newcalc[y][x] = bombMap[y][x] - 1;
        } else {
          newcalc[y][x] = userInputs[y][x];
        }
      }
    }
    console.log(bombMap);
    console.log(newcalc);
    return newcalc;
  };
  const bombRandom = () => {
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
  const bombCount = (currentBombMap: number[][]) => {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        let bombCount = 0;
        for (const [dy, dx] of directions) {
          const ry = y + dy;
          const rx = x + dx;
          if (
            currentBombMap[ry] !== undefined &&
            currentBombMap[ry][rx] !== undefined &&
            currentBombMap[ry][rx] === 10
          ) {
            bombCount++;
          }
        }
        numberMap[y][x] = bombCount;
      }
    }
    return numberMap;
  };
  //git hub gemini
  //calc何に使う？←userinputsとbombmapを 合わせて爆弾を認知する、tsxでの管理
  const clickHandler = (x: number, y: number) => {
    console.log(x, y);
    const newUserInputs = structuredClone(userInputs);
    let currentBombMap = bombMap;
    if (!gameStarted) {
      const generatedBombMap = bombRandom();
      const generatedNumberMap = bombCount(generatedBombMap);
      setBombMap(generatedBombMap);
      currentBombMap = generatedBombMap;
      setGameStarted(true);
      setNumberMap(generatedNumberMap);
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
      {/* <div className={styles.sampleCell} style={{ backgroundPosition: sampleCounter * -30 }} /> */}
      <div className={styles.board}>
        {board.map((row, y) =>
          row.map((value, x) => (
            <div
              className={styles.cell}
              key={`${x}-${y}`}
              onClick={() => clickHandler(x, y)}
              onContextMenu={(e) => handleRightClick(e, x, y)}
            >
              {userInputs[y][x] === 10 && (
                <div
                  className={styles.iconCell}
                  style={{ backgroundPosition: `${-30 * userInputs[y][x]}px ` }}
                />
              )}
              {userInputs[y][x] === -1 && numberMap[y][x] >= 1 ? (
                <div
                  className={styles.iconCell}
                  style={{ backgroundPosition: `${(numberMap[y][x] - 1) * -30}px 0px` }}
                />
              ) : userInputs[y][x] === -1 ? (
                <div className={styles.openCell} />
              ) : null}
              {userInputs[y][x] === 9 && (
                <div
                  className={styles.iconFlagAndQuestion}
                  style={{ backgroundPosition: `${-30 * userInputs[y][x]}px ` }}
                />
              )}
              {userInputs[y][x] === 8 && (
                <div
                  className={styles.iconFlagAndQuestion}
                  style={{ backgroundPosition: `${-30 * userInputs[y][x]}px ` }}
                />
              )}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
