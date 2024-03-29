export default function workerLoop(deadLine) {
  //单位是微秒
  console.log(deadLine.timeRemaining());
  let shouldYeild = false;
  while (!shouldYeild) {
    // 一直执行，直到时间不够
    shouldYeild = deadLine.timeRemaining() < 1;
  }
  requestIdleCallback(workerLoop);
}

requestIdleCallback(workerLoop);
