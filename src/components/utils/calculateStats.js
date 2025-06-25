export function calculateStats(times = [], plusTwoTimes = [], dnfTimes = []) {
  const validTimes = times.map((t, i) => ({
    time: t.time,
    scramble: t.scramble,
    timestamp: t.timestamp,
    index: i,
    isDNF: dnfTimes.includes(i),
    isPlusTwo: plusTwoTimes.includes(i)
  }));

  const numericTimes = validTimes
    .map(t => t.isDNF ? null : (t.isPlusTwo ? t.time + 2000 : t.time))
    .filter(t => t !== null);

  const bestTime = numericTimes.length > 0 ? Math.min(...numericTimes) : null;
  const worstTime = numericTimes.length > 0 ? Math.max(...numericTimes) : null;
  const totalSolves = times.length;
  const totalDnfs = dnfTimes.length;
  const totalPlusTwo = plusTwoTimes.length;
  const successRate = totalSolves > 0 ? ((totalSolves - totalDnfs) / totalSolves * 100).toFixed(1) : 0;
  const dnfRate = totalSolves > 0 ? (totalDnfs / totalSolves * 100).toFixed(1) : 0;
  const plusTwoRate = totalSolves > 0 ? (totalPlusTwo / totalSolves * 100).toFixed(1) : 0;
  const overallAverage = numericTimes.length > 0 ? numericTimes.reduce((a, b) => a + b, 0) / numericTimes.length : null;

  const median = numericTimes.length > 0 ? (() => {
    const sorted = [...numericTimes].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  })() : null;

  const average = (slice) => {
    const nums = slice.map(t => {
      if (t.isDNF) return null;
      return t.isPlusTwo ? t.time + 2000 : t.time;
    }).filter(t => t !== null);

    if (nums.length === 0) return null;

    if (nums.length >= 3) {
      const sorted = [...nums].sort((a, b) => a - b);
      const trimmed = sorted.slice(1, -1);
      return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
    }
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  };

  const ao5 = times.length >= 5 ? average(validTimes.slice(-5)) : null;
  const ao12 = times.length >= 12 ? average(validTimes.slice(-12)) : null;
  const ao50 = times.length >= 50 ? average(validTimes.slice(-50)) : null;
  const ao100 = times.length >= 100 ? average(validTimes.slice(-100)) : null;
  const mo3 = numericTimes.length >= 3 ? average(validTimes.slice(-3)) : null;

  const calculateMovingAverages = (windowSize) => {
    const averages = [];
    for (let i = windowSize - 1; i < validTimes.length; i++) {
      const slice = validTimes.slice(i - windowSize + 1, i + 1);
      const avg = average(slice);
      if (avg !== null) averages.push(avg);
    }
    return averages;
  };

  const ao5s = calculateMovingAverages(5);
  const ao12s = calculateMovingAverages(12);
  const ao50s = calculateMovingAverages(50);
  const ao100s = calculateMovingAverages(100);

  const bestAo5 = ao5s.length > 0 ? Math.min(...ao5s) : null;
  const worstAo5 = ao5s.length > 0 ? Math.max(...ao5s) : null;
  const bestAo12 = ao12s.length > 0 ? Math.min(...ao12s) : null;
  const worstAo12 = ao12s.length > 0 ? Math.max(...ao12s) : null;
  const bestAo50 = ao50s.length > 0 ? Math.min(...ao50s) : null;
  const worstAo50 = ao50s.length > 0 ? Math.max(...ao50s) : null;
  const bestAo100 = ao100s.length > 0 ? Math.min(...ao100s) : null;
  const worstAo100 = ao100s.length > 0 ? Math.max(...ao100s) : null;

  const bestTimeIndex = bestTime !== null ? validTimes.findIndex(t => 
    !t.isDNF && (t.isPlusTwo ? t.time + 2000 : t.time) === bestTime
  ) : null;
  
  const worstTimeIndex = worstTime !== null ? validTimes.findIndex(t => 
    !t.isDNF && (t.isPlusTwo ? t.time + 2000 : t.time) === worstTime
  ) : null;

  const bestAo5Index = bestAo5 !== null ? ao5s.indexOf(bestAo5) : null;
  const worstAo5Index = worstAo5 !== null ? ao5s.indexOf(worstAo5) : null;
  const bestAo12Index = bestAo12 !== null ? ao12s.indexOf(bestAo12) : null;
  const worstAo12Index = worstAo12 !== null ? ao12s.indexOf(worstAo12) : null;

  const stdDev = numericTimes.length > 1 ?
    Math.sqrt(numericTimes.map(x => Math.pow(x - overallAverage, 2)).reduce((a, b) => a + b) / numericTimes.length) : null;

  const consistencyIndex = stdDev !== null && overallAverage !== null ? stdDev / overallAverage : null;

  const countSub10 = numericTimes.filter(t => t < 10000).length;
  const countSub15 = numericTimes.filter(t => t < 15000).length;
  const countSub20 = numericTimes.filter(t => t < 20000).length;
  const countSub30 = numericTimes.filter(t => t < 30000).length;
  const countOver30 = numericTimes.filter(t => t >= 30000).length;

  const meanOfLast5 = numericTimes.length >= 5 ? 
    numericTimes.slice(-5).reduce((a, b) => a + b, 0) / 5 : null;
  const meanOfLast12 = numericTimes.length >= 12 ? 
    numericTimes.slice(-12).reduce((a, b) => a + b, 0) / 12 : null;
  const meanOfLast50 = numericTimes.length >= 50 ? 
    numericTimes.slice(-50).reduce((a, b) => a + b, 0) / 50 : null;
  const meanOfLast100 = numericTimes.length >= 100 ? 
    numericTimes.slice(-100).reduce((a, b) => a + b, 0) / 100 : null;

  const totalTime = numericTimes.reduce((a, b) => a + b, 0);
  const timeRange = numericTimes.length > 0 ? worstTime - bestTime : null;

  let improvementRate = null;
  if (numericTimes.length >= 10) {
    const first10Percent = numericTimes.slice(0, Math.floor(numericTimes.length * 0.1));
    const last10Percent = numericTimes.slice(-Math.floor(numericTimes.length * 0.1));
    const firstAvg = first10Percent.reduce((a, b) => a + b, 0) / first10Percent.length;
    const lastAvg = last10Percent.reduce((a, b) => a + b, 0) / last10Percent.length;
    improvementRate = ((firstAvg - lastAvg) / firstAvg) * 100;
  }

  let currentStreakNoDNF = 0;
  let bestStreakNoDNF = 0;
  let currentDNFStreak = 0;
  let worstDNFStreak = 0;
  let currentImprovementStreak = 0;
  let bestImprovementStreak = 0;

  const pbHistory = [];
  let currentPB = Infinity;
  let maxSolvesWithoutPB = 0;
  let currentSolvesWithoutPB = 0;

  validTimes.forEach((t, i) => {
    const timeValue = t.isDNF ? Infinity : (t.isPlusTwo ? t.time + 2000 : t.time);

    // PB tracking and max solves without improvement
    if (timeValue < currentPB) {
      currentPB = timeValue;
      pbHistory.push({
        index: i,
        time: currentPB,
        timestamp: t.timestamp,
        scramble: t.scramble
      });
      if (currentSolvesWithoutPB > maxSolvesWithoutPB) maxSolvesWithoutPB = currentSolvesWithoutPB;
      currentSolvesWithoutPB = 0;
    } else {
      currentSolvesWithoutPB++;
    }

    if (!t.isDNF) {
      currentStreakNoDNF++;
      if (currentStreakNoDNF > bestStreakNoDNF) bestStreakNoDNF = currentStreakNoDNF;
    } else {
      currentStreakNoDNF = 0;
    }

    if (t.isDNF) {
      currentDNFStreak++;
      if (currentDNFStreak > worstDNFStreak) worstDNFStreak = currentDNFStreak;
    } else {
      currentDNFStreak = 0;
    }

    if (i > 0) {
      const prevTime = validTimes[i-1].isDNF ? Infinity : 
                      (validTimes[i-1].isPlusTwo ? validTimes[i-1].time + 2000 : validTimes[i-1].time);
      if (timeValue < prevTime) {
        currentImprovementStreak++;
        if (currentImprovementStreak > bestImprovementStreak) bestImprovementStreak = currentImprovementStreak;
      } else {
        currentImprovementStreak = 0;
      }
    }
  });

  // Percentile calculation helper
  const percentile = (arr, p) => {
    if (arr.length === 0) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = (p / 100) * (sorted.length - 1);
    if (Math.floor(idx) === idx) {
      return sorted[idx];
    }
    const lower = sorted[Math.floor(idx)];
    const upper = sorted[Math.ceil(idx)];
    return lower + (upper - lower) * (idx - Math.floor(idx));
  };

  // Calculate percentiles
  const p25 = percentile(numericTimes, 25);
  const p50 = median; // ya calculado
  const p75 = percentile(numericTimes, 75);
  const p90 = percentile(numericTimes, 90);

  // Ratio PBs vs solves
  const totalPBs = pbHistory.length;
  const pbRatio = totalSolves > 0 ? (totalPBs / totalSolves * 100).toFixed(1) : null;

  // Average and median excluyendo +2 penalties
  const timesExcludingPlusTwo = validTimes
    .filter(t => !t.isDNF && !t.isPlusTwo)
    .map(t => t.time);

  const avgNoPlusTwo = timesExcludingPlusTwo.length > 0 ?
    timesExcludingPlusTwo.reduce((a, b) => a + b, 0) / timesExcludingPlusTwo.length : null;

  const medianNoPlusTwo = (() => {
    if (timesExcludingPlusTwo.length === 0) return null;
    const sorted = [...timesExcludingPlusTwo].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  })();

  // DNFs distribution (early vs late)
  const dnfPositions = dnfTimes;
  const earlyDnfs = dnfPositions.filter(i => i < totalSolves * 0.5).length;
  const lateDnfs = totalDnfs - earlyDnfs;

  // Mode of time ranges (define ranges of 5s, can ajustar)
  const rangeCounts = {};
  numericTimes.forEach(t => {
    const range = Math.floor(t / 5000) * 5000;
    rangeCounts[range] = (rangeCounts[range] || 0) + 1;
  });
  const modeRange = Object.entries(rangeCounts).reduce((max, curr) => curr[1] > max[1] ? curr : max, [null, 0])[0];

  // Outliers detection (times > mean + 2*stdDev)
  const outlierThreshold = overallAverage !== null && stdDev !== null ? overallAverage + 2 * stdDev : null;
  const outlierCount = outlierThreshold !== null ? numericTimes.filter(t => t > outlierThreshold).length : null;

  // Weighted average (más peso a tiempos recientes)
  let weightedSum = 0;
  let weightTotal = 0;
  numericTimes.forEach((t, idx) => {
    const weight = idx + 1; // peso incremental
    weightedSum += t * weight;
    weightTotal += weight;
  });
  const weightedAverage = weightTotal > 0 ? weightedSum / weightTotal : null;

  // Time of day stats (ya implementado arriba, mantengo)

  // Genero listas AO5 y AO12 (ya hecho arriba)

  return {
    bestTime,
    worstTime,
    totalSolves,
    totalDnfs,
    totalPlusTwo,
    successRate,
    dnfRate,
    plusTwoRate,
    overallAverage,
    median,
    stdDev,
    consistencyIndex,

    ao5,
    ao12,
    ao50,
    ao100,
    mo3,

    bestAo5,
    worstAo5,
    bestAo12,
    worstAo12,
    bestAo50,
    worstAo50,
    bestAo100,
    worstAo100,

    bestTimeIndex,
    worstTimeIndex,
    bestAo5Index,
    worstAo5Index,
    bestAo12Index,
    worstAo12Index,

    countSub10,
    countSub15,
    countSub20,
    countSub30,
    countOver30,

    meanOfLast5,
    meanOfLast12,
    meanOfLast50,
    meanOfLast100,

    totalTime,
    timeRange,

    improvementRate,

    bestNonDNFStreak: bestStreakNoDNF,
    worstDNFStreak,
    bestImprovementStreak,

    pbHistory,
    totalPBs,
    pbRatio,
    timeSinceLastPB: pbHistory.length > 0 ? 
      new Date() - new Date(pbHistory[pbHistory.length-1].timestamp) : null,


    // Nuevas estadísticas añadidas
    percentile25: p25,
    percentile50: p50,
    percentile75: p75,
    percentile90: p90,

    avgNoPlusTwo,
    medianNoPlusTwo,

    earlyDnfs,
    lateDnfs,

    modeRange,
    outlierCount,

    maxSolvesWithoutPB,

    weightedAverage,

    // Raw data
    numericTimes,
    validTimes,

    ao5s,
    ao12s,
    ao50s,
    ao100s
  };
}
