export function calculateStats(times = [], plusTwoTimes = [], dnfTimes = []) {
  // Process valid times with additional metadata
  const validTimes = times.map((t, i) => ({
    time: t.time,
    scramble: t.scramble,
    timestamp: t.timestamp,
    index: i,
    isDNF: dnfTimes.includes(i),
    isPlusTwo: plusTwoTimes.includes(i)
  }));

  // Numeric times (excluding DNFs, including +2s)
  const numericTimes = validTimes
    .map(t => t.isDNF ? null : (t.isPlusTwo ? t.time + 2000 : t.time))
    .filter(t => t !== null);

  // Basic calculations
  const bestTime = numericTimes.length > 0 ? Math.min(...numericTimes) : null;
  const worstTime = numericTimes.length > 0 ? Math.max(...numericTimes) : null;
  const totalSolves = times.length;
  const totalDnfs = dnfTimes.length;
  const totalPlusTwo = plusTwoTimes.length;
  const successRate = totalSolves > 0 ? ((totalSolves - totalDnfs) / totalSolves * 100).toFixed(1) : 0;
  const dnfRate = totalSolves > 0 ? (totalDnfs / totalSolves * 100).toFixed(1) : 0;
  const plusTwoRate = totalSolves > 0 ? (totalPlusTwo / totalSolves * 100).toFixed(1) : 0;
  const overallAverage = numericTimes.length > 0 ? numericTimes.reduce((a, b) => a + b, 0) / numericTimes.length : null;

  // Median calculation
  const median = numericTimes.length > 0 ? (() => {
    const sorted = [...numericTimes].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  })() : null;

  // Helper function to calculate averages (with DNF handling)
  const average = (slice) => {
    const nums = slice.map(t => {
      if (t.isDNF) return null;
      return t.isPlusTwo ? t.time + 2000 : t.time;
    }).filter(t => t !== null);

    if (nums.length === 0) return null;

    // For averages, remove best and worst if we have enough solves
    if (nums.length >= 3) {
      const sorted = [...nums].sort((a, b) => a - b);
      const trimmed = sorted.slice(1, -1);
      return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
    }
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  };

  // Current averages
  const ao5 = times.length >= 5 ? average(validTimes.slice(-5)) : null;
  const ao12 = times.length >= 12 ? average(validTimes.slice(-12)) : null;
  const ao50 = times.length >= 50 ? average(validTimes.slice(-50)) : null;
  const ao100 = times.length >= 100 ? average(validTimes.slice(-100)) : null;
  const mo3 = numericTimes.length >= 3 ? average(validTimes.slice(-3)) : null;

  // Calculate all moving averages
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

  // Best/worst averages
  const bestAo5 = ao5s.length > 0 ? Math.min(...ao5s) : null;
  const worstAo5 = ao5s.length > 0 ? Math.max(...ao5s) : null;
  const bestAo12 = ao12s.length > 0 ? Math.min(...ao12s) : null;
  const worstAo12 = ao12s.length > 0 ? Math.max(...ao12s) : null;
  const bestAo50 = ao50s.length > 0 ? Math.min(...ao50s) : null;
  const worstAo50 = ao50s.length > 0 ? Math.max(...ao50s) : null;
  const bestAo100 = ao100s.length > 0 ? Math.min(...ao100s) : null;
  const worstAo100 = ao100s.length > 0 ? Math.max(...ao100s) : null;

  // Indices for best/worst times and averages
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

  // Standard deviation
  const stdDev = numericTimes.length > 1 ?
    Math.sqrt(numericTimes.map(x => Math.pow(x - overallAverage, 2)).reduce((a, b) => a + b) / numericTimes.length) : null;

  // Consistency index (lower is better)
  const consistencyIndex = stdDev !== null && overallAverage !== null ? stdDev / overallAverage : null;

  // Time range counts
  const countSub10 = numericTimes.filter(t => t < 10000).length;
  const countSub15 = numericTimes.filter(t => t < 15000).length;
  const countSub20 = numericTimes.filter(t => t < 20000).length;
  const countSub30 = numericTimes.filter(t => t < 30000).length;
  const countOver30 = numericTimes.filter(t => t >= 30000).length;

  // Means of last X solves
  const meanOfLast5 = numericTimes.length >= 5 ? 
    numericTimes.slice(-5).reduce((a, b) => a + b, 0) / 5 : null;
  const meanOfLast12 = numericTimes.length >= 12 ? 
    numericTimes.slice(-12).reduce((a, b) => a + b, 0) / 12 : null;
  const meanOfLast50 = numericTimes.length >= 50 ? 
    numericTimes.slice(-50).reduce((a, b) => a + b, 0) / 50 : null;
  const meanOfLast100 = numericTimes.length >= 100 ? 
    numericTimes.slice(-100).reduce((a, b) => a + b, 0) / 100 : null;

  // Total time spent solving
  const totalTime = numericTimes.reduce((a, b) => a + b, 0);

  // Improvement rate (comparing first 10% vs last 10%)
  let improvementRate = null;
  if (numericTimes.length >= 10) {
    const first10Percent = numericTimes.slice(0, Math.floor(numericTimes.length * 0.1));
    const last10Percent = numericTimes.slice(-Math.floor(numericTimes.length * 0.1));
    const firstAvg = first10Percent.reduce((a, b) => a + b, 0) / first10Percent.length;
    const lastAvg = last10Percent.reduce((a, b) => a + b, 0) / last10Percent.length;
    improvementRate = ((firstAvg - lastAvg) / firstAvg) * 100;
  }

  // Streaks calculations
  let currentStreakNoDNF = 0;
  let bestStreakNoDNF = 0;
  let currentDNFStreak = 0;
  let worstDNFStreak = 0;
  let currentImprovementStreak = 0;
  let bestImprovementStreak = 0;

  // PB history tracking
  const pbHistory = [];
  let currentPB = Infinity;

  validTimes.forEach((t, i) => {
    const timeValue = t.isDNF ? Infinity : (t.isPlusTwo ? t.time + 2000 : t.time);

    // Track PBs
    if (timeValue < currentPB) {
      currentPB = timeValue;
      pbHistory.push({
        index: i,
        time: currentPB,
        timestamp: t.timestamp,
        scramble: t.scramble
      });
    }

    // Streak without DNFs
    if (!t.isDNF) {
      currentStreakNoDNF++;
      if (currentStreakNoDNF > bestStreakNoDNF) bestStreakNoDNF = currentStreakNoDNF;
    } else {
      currentStreakNoDNF = 0;
    }

    // DNF streak
    if (t.isDNF) {
      currentDNFStreak++;
      if (currentDNFStreak > worstDNFStreak) worstDNFStreak = currentDNFStreak;
    } else {
      currentDNFStreak = 0;
    }

    // Improvement streak
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

  // Time of day statistics
  const timeOfDayStats = (() => {
    if (!validTimes[0]?.timestamp) return null;

    const byHour = Array(24).fill(0).map(() => ({ 
      count: 0, 
      total: 0, 
      best: Infinity,
      times: [] 
    }));

    validTimes.forEach(t => {
      if (!t.timestamp) return;
      const hour = new Date(t.timestamp).getHours();
      const timeValue = t.isDNF ? null : (t.isPlusTwo ? t.time + 2000 : t.time);

      if (timeValue !== null) {
        byHour[hour].count++;
        byHour[hour].total += timeValue;
        byHour[hour].times.push(timeValue);
        if (timeValue < byHour[hour].best) byHour[hour].best = timeValue;
      }
    });

    return byHour.map((h, i) => ({
      hour: i,
      hourLabel: `${i}:00`,
      average: h.count > 0 ? h.total / h.count : null,
      best: h.count > 0 ? h.best : null,
      count: h.count,
      times: h.times
    })).filter(h => h.count > 0);
  })();

  // Generate AO5 and AO12 lists for progression charts
  const ao5List = [];
  const ao12List = [];
  for (let i = 4; i < validTimes.length; i++) {
    ao5List.push(average(validTimes.slice(i - 4, i + 1)));
  }
  for (let i = 11; i < validTimes.length; i++) {
    ao12List.push(average(validTimes.slice(i - 11, i + 1)));
  }

  // Return all calculated statistics
  return {
    // Basic stats
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

    // Current averages
    ao5,
    ao12,
    ao50,
    ao100,
    mo3,

    // Best/worst averages
    bestAo5,
    worstAo5,
    bestAo12,
    worstAo12,
    bestAo50,
    worstAo50,
    bestAo100,
    worstAo100,

    // Indices
    bestTimeIndex,
    worstTimeIndex,
    bestAo5Index,
    worstAo5Index,
    bestAo12Index,
    worstAo12Index,

    // Time ranges
    countSub10,
    countSub15,
    countSub20,
    countSub30,
    countOver30,

    // Means of last X
    meanOfLast5,
    meanOfLast12,
    meanOfLast50,
    meanOfLast100,

    // Time data
    totalTime,
    timeRange: numericTimes.length > 0 ? worstTime - bestTime : null,

    // Improvement
    improvementRate,

    // Streaks
    bestNonDNFStreak: bestStreakNoDNF,
    worstDNFStreak,
    bestImprovementStreak,

    // PB tracking
    pbHistory,
    totalPBs: pbHistory.length,
    timeSinceLastPB: pbHistory.length > 0 ? 
      new Date() - new Date(pbHistory[pbHistory.length-1].timestamp) : null,

    // Time of day
    timeOfDayStats,

    // Raw data
    numericTimes,
    validTimes,
    ao5List,
    ao12List,
    ao5s,
    ao12s,
    ao50s,
    ao100s
  };
}