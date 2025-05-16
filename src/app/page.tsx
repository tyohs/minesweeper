'use client';

import { useState } from 'react';
import styles from './page.module.css';
const calcTotalPoint = (arr: number[], counter: number) => {
  counter;
  const su = arr.reduce((accumulater, currntValue) => accumulater + currntValue);
  return su + counter;
};
const down = (n: number) => {
  if (n === -1) {
    return;
  } else {
    console.log(n);
    down(n - 1);
  }
};
down(10);
const sum1 = (n: number): number => {
  return n <= 1 ? n : n + sum1(n - 1);
};
const sum2 = (s: number, i: number): number => {
  // if (i <= s) {
  //   return s;
  // } else {
  //   return i + sum2(s, i - 1);
  // }
  return i <= s ? s : i + sum2(s, i - 1);
};
const sum3 = (s: number, i: number): number => {
  return (1 / 2) * (i - s + 1) * (s + i);
};
console.log(sum1(10));
console.log(sum2(3, 10));
console.log(sum3(4, 10));
export default function Home() {
  const [sampleCounter, setSampleCounter] = useState(0);
  console.log('sampleCounter=', sampleCounter);
  const [samplePoints, setSamplePoints] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  console.log('samplePoints=', samplePoints);
  const clickHandler = () => {
    setSampleCounter((sampleCounter + 1) % 14);
    const newSamplePoints = structuredClone(samplePoints);
    newSamplePoints[sampleCounter] += 1;
    setSamplePoints(newSamplePoints);
  };
  const totalPoint = calcTotalPoint(samplePoints, sampleCounter);
  console.log('totalPoint=', totalPoint);
  return (
    <div className={styles.container}>
      <div className={styles.sampleCell} style={{ backgroundPosition: sampleCounter * -30 }} />
      <button onClick={clickHandler}>クリック</button>
    </div>
  );
}
