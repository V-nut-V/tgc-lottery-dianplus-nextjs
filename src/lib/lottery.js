export function drawPrizeAndUpdate(originalPrizeArray) {
  // 创建深拷贝，避免修改原始数据
  const prizeArray = originalPrizeArray.map((p) => ({ ...p }));

  const totalQuantity = prizeArray.reduce(
    (sum, item) => sum + item.Quantity,
    0
  );
  if (totalQuantity === 0) return null;

  // 使用概率权重方式抽奖，避免遍历
  const weights = new Float64Array(prizeArray.length);
  weights[0] = prizeArray[0].Quantity / totalQuantity;
  
  for (let i = 1; i < prizeArray.length; i++) {
    weights[i] = weights[i-1] + (prizeArray[i].Quantity / totalQuantity);
  }

  const random = Math.random();
  const selectedIndex = weights.findIndex(w => random <= w);
  
  if (selectedIndex !== -1) {
    prizeArray[selectedIndex].Quantity--;
    const selectedPrize = { ...prizeArray[selectedIndex], Quantity: 1 }; // 复制抽中的奖项（表示抽中1个）
    return {
      selected: selectedPrize,
      afterPrizes: prizeArray,
    };
  }
  return null;
}

export function rollPrizeText(prizeArray, getFinalPrizeFn, setRollingText, stopFn) {
  if (!Array.isArray(prizeArray)) {
    throw new Error("Invalid prizeArray passed to rollPrizeText");
  }
  // 只取前10个奖品用于展示
  const names = prizeArray.slice(0, 10).map((p) => p.Name);
  let index = 0;
  let rollingTimer = null;
  let checkingTimer = null;

  function startRolling() {
    rollingTimer = setInterval(() => {
      setRollingText(names[index % names.length]);
      index++;
    }, 100);
  }

  function stopRolling() {
    stopFn();
    clearInterval(rollingTimer);
    clearInterval(checkingTimer);
  }

  startRolling();

  // 开始2秒计时
  setTimeout(() => {
    const finalPrize = getFinalPrizeFn();
    if (isValidPrize(finalPrize)) {
      stopRolling();
      setRollingText(finalPrize);
    } else {
      checkingTimer = setInterval(() => {
        const prize = getFinalPrizeFn();
        if (isValidPrize(prize)) {
          stopRolling();
          setRollingText(prize);
        }
      }, 1000);
    }
  }, 2000);

  function isValidPrize(prize) {
    return typeof prize === "string" && prize.trim().length > 0;
  }

  // 返回控制器（可选使用）
  return {
    stop: stopRolling,
  };
}

export function isPrizePoolEmpty(prizeArray) {
  if (!Array.isArray(prizeArray)) {
    throw new Error("Invalid prizeArray passed to isPrizePoolEmpty");
  }
  const totalQuantity = prizeArray.reduce(
    (sum, item) => sum + item.Quantity,
    0
  );
  return totalQuantity === 0;
}
