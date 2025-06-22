export function calculateStats(times, plusTwoTimes, dnfTimes) {
  const numericTimes = times.map((t, i) => {
    if (dnfTimes.includes(i)) return null;
    if (t.time === "DNF") return null;
    return plusTwoTimes.includes(i) ? t.time + 2000 : t.time;
  }).filter(t => t !== null);

  const validTimes = times.map((t, i) => ({
    time: t.time,
    scramble: t.scramble,
    index: i,
    isDNF: dnfTimes.includes(i),
    isPlusTwo: plusTwoTimes.includes(i)
  }));

  const bestTime = numericTimes.length > 0 ? Math.min(...numericTimes) : null;
  const worstTime = numericTimes.length > 0 ? Math.max(...numericTimes) : null;
  const totalSolves = times.length;
  const totalDnfs = dnfTimes.length;
  const successRate = totalSolves > 0 ? ((totalSolves - totalDnfs) / totalSolves * 100).toFixed(1) : 0;
  const overallAverage = numericTimes.length > 0 ? numericTimes.reduce((a, b) => a + b, 0) / numericTimes.length : null;

  // Calculate averages
  const average = (arr) => {
    const nums = arr.map((t, i) => {
      if (dnfTimes.includes(t.index)) return null;
      if (t.time === "DNF") return null;
      return plusTwoTimes.includes(t.index) ? t.time + 2000 : t.time;
    }).filter(t => t !== null);

    return nums.length === 0 ? null : nums.reduce((a, b) => a + b, 0) / nums.length;
  };

  const ao5 = times.length >= 5 ? average(validTimes.slice(-5)) : null;
  const ao12 = times.length >= 12 ? average(validTimes.slice(-12)) : null;
  const ao50 = times.length >= 50 ? average(validTimes.slice(-50)) : null;
  const ao100 = times.length >= 100 ? average(validTimes.slice(-100)) : null;

  // Mean of 3
  const mo3 = times.length >= 3 ? average(validTimes.slice(-3)) : null;

  // Best and worst ao5/ao12
  let bestAo5 = null, worstAo5 = null;
  let bestAo12 = null, worstAo12 = null;
  
  if (times.length >= 5) {
    const ao5s = [];
    for (let i = 4; i < times.length; i++) {
      const slice = validTimes.slice(i - 4, i + 1);
      const avg = average(slice);
      if (avg !== null) ao5s.push(avg);
    }
    if (ao5s.length > 0) {
      bestAo5 = Math.min(...ao5s);
      worstAo5 = Math.max(...ao5s);
    }
  }

  if (times.length >= 12) {
    const ao12s = [];
    for (let i = 11; i < times.length; i++) {
      const slice = validTimes.slice(i - 11, i + 1);
      const avg = average(slice);
      if (avg !== null) ao12s.push(avg);
    }
    if (ao12s.length > 0) {
      bestAo12 = Math.min(...ao12s);
      worstAo12 = Math.max(...ao12s);
    }
  }

  const stdDev = numericTimes.length > 0 
    ? Math.sqrt(
        numericTimes
          .map(x => Math.pow(x - overallAverage, 2))
          .reduce((a, b) => a + b, 0) / numericTimes.length
      )
    : null;

  return {
    bestTime,
    worstTime,
    totalSolves,
    totalDnfs,
    successRate,
    overallAverage,
    ao5,
    ao12,
    ao50,
    ao100,
    mo3,
    bestAo5,
    worstAo5,
    bestAo12,
    worstAo12,
    stdDev,
    numericTimes,
    validTimes
  };
}