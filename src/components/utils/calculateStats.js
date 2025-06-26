export function calculateStats(times = [], plusTwoTimes = [], dnfTimes = []) {
  // Preprocesamiento de tiempos
  const validTimes = times.map((t, i) => ({
    time: t.time,
    scramble: t.scramble,
    timestamp: t.timestamp,
    index: i,
    isDNF: dnfTimes.includes(i),
    isPlusTwo: plusTwoTimes.includes(i)
  }));

  // Tiempos numéricos con penalizaciones aplicadas
  const numericTimes = validTimes
    .map(t => t.isDNF ? null : (t.isPlusTwo ? t.time + 2000 : t.time))
    .filter(t => t !== null);

  // Lista ordenada para cálculos estadísticos
  const sortedTimes = numericTimes.length > 0 ? [...numericTimes].sort((a, b) => a - b) : [];
  const count = numericTimes.length;

  // Función helper para redondeo
  const roundTo = (value, decimals = 2) => value !== null ? Number(value.toFixed(decimals)) : null;

  // Función para calcular percentiles
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

  // Cálculos básicos
  const bestTime = count > 0 ? sortedTimes[0] : null;
  const worstTime = count > 0 ? sortedTimes[count - 1] : null;
  const totalSolves = times.length;
  const totalDnfs = dnfTimes.length;
  const totalPlusTwo = plusTwoTimes.length;
  const successRate = roundTo(totalSolves > 0 ? ((totalSolves - totalDnfs) / totalSolves * 100) : 0, 1);
  const dnfRate = roundTo(totalSolves > 0 ? (totalDnfs / totalSolves * 100) : 0, 1);
  const plusTwoRate = roundTo(totalSolves > 0 ? (totalPlusTwo / totalSolves * 100) : 0, 1);
  const overallAverage = count > 0 ? roundTo(numericTimes.reduce((a, b) => a + b, 0) / count) : null;
  const median = percentile(numericTimes, 50);

  // Función para calcular promedios (ao5, ao12, etc.)
  const average = (slice) => {
    const nums = slice.map(t => {
      if (t.isDNF) return null;
      return t.isPlusTwo ? t.time + 2000 : t.time;
    }).filter(t => t !== null);

    if (nums.length === 0) return null;

    if (nums.length >= 3) {
      const sorted = [...nums].sort((a, b) => a - b);
      const trimmed = sorted.slice(1, -1);
      return roundTo(trimmed.reduce((a, b) => a + b, 0) / trimmed.length);
    }
    return roundTo(nums.reduce((a, b) => a + b, 0) / nums.length);
  };

  // Promedios móviles
  const ao5 = times.length >= 5 ? average(validTimes.slice(-5)) : null;
  const ao12 = times.length >= 12 ? average(validTimes.slice(-12)) : null;
  const ao50 = times.length >= 50 ? average(validTimes.slice(-50)) : null;
  const ao100 = times.length >= 100 ? average(validTimes.slice(-100)) : null;
  const mo3 = numericTimes.length >= 3 ? average(validTimes.slice(-3)) : null;

  // Cálculo de series de promedios móviles
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

  // Mejores/peores promedios
  const bestAo5 = ao5s.length > 0 ? roundTo(Math.min(...ao5s)) : null;
  const worstAo5 = ao5s.length > 0 ? roundTo(Math.max(...ao5s)) : null;
  const bestAo12 = ao12s.length > 0 ? roundTo(Math.min(...ao12s)) : null;
  const worstAo12 = ao12s.length > 0 ? roundTo(Math.max(...ao12s)) : null;
  const bestAo50 = ao50s.length > 0 ? roundTo(Math.min(...ao50s)) : null;
  const worstAo50 = ao50s.length > 0 ? roundTo(Math.max(...ao50s)) : null;
  const bestAo100 = ao100s.length > 0 ? roundTo(Math.min(...ao100s)) : null;
  const worstAo100 = ao100s.length > 0 ? roundTo(Math.max(...ao100s)) : null;

  // Índices de mejores/peores tiempos
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

  // Desviación estándar y consistencia
  const stdDev = count > 1 ?
    roundTo(Math.sqrt(numericTimes.map(x => Math.pow(x - overallAverage, 2)).reduce((a, b) => a + b) / count)) : null;

  const consistencyIndex = stdDev !== null && overallAverage !== null ? roundTo(stdDev / overallAverage) : null;

  // Contadores por rangos de tiempo
  const countSub10 = numericTimes.filter(t => t < 10000).length;
  const countSub15 = numericTimes.filter(t => t < 15000).length;
  const countSub20 = numericTimes.filter(t => t < 20000).length;
  const countSub30 = numericTimes.filter(t => t < 30000).length;
  const countOver30 = numericTimes.filter(t => t >= 30000).length;

  // Medias de últimos solves
  const meanOfLast5 = numericTimes.length >= 5 ? 
    roundTo(numericTimes.slice(-5).reduce((a, b) => a + b, 0) / 5) : null;
  const meanOfLast12 = numericTimes.length >= 12 ? 
    roundTo(numericTimes.slice(-12).reduce((a, b) => a + b, 0) / 12) : null;
  const meanOfLast50 = numericTimes.length >= 50 ? 
    roundTo(numericTimes.slice(-50).reduce((a, b) => a + b, 0) / 50) : null;
  const meanOfLast100 = numericTimes.length >= 100 ? 
    roundTo(numericTimes.slice(-100).reduce((a, b) => a + b, 0) / 100) : null;

  // Tiempo total y rango
  const totalTime = roundTo(numericTimes.reduce((a, b) => a + b, 0));
  const timeRange = count > 0 ? roundTo(worstTime - bestTime) : null;

  // Tasa de mejora
  let improvementRate = null;
  if (count >= 10) {
    const first10Percent = numericTimes.slice(0, Math.floor(count * 0.1));
    const last10Percent = numericTimes.slice(-Math.floor(count * 0.1));
    const firstAvg = first10Percent.reduce((a, b) => a + b, 0) / first10Percent.length;
    const lastAvg = last10Percent.reduce((a, b) => a + b, 0) / last10Percent.length;
    improvementRate = roundTo(((firstAvg - lastAvg) / firstAvg) * 100);
  }

  // Rachas y PBs
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

    // PB tracking
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

    // Rachas sin DNF
    if (!t.isDNF) {
      currentStreakNoDNF++;
      if (currentStreakNoDNF > bestStreakNoDNF) bestStreakNoDNF = currentStreakNoDNF;
    } else {
      currentStreakNoDNF = 0;
    }

    // Rachas de DNF
    if (t.isDNF) {
      currentDNFStreak++;
      if (currentDNFStreak > worstDNFStreak) worstDNFStreak = currentDNFStreak;
    } else {
      currentDNFStreak = 0;
    }

    // Rachas de mejora
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

  // Percentiles
  const p25 = percentile(numericTimes, 25);
  const p75 = percentile(numericTimes, 75);
  const p90 = percentile(numericTimes, 90);

  // Estadísticas de distribución
  const distributionStats = {
    timeDistribution: (() => {
      const distribution = {};
      const binSize = 5000; // 5 segundos
      numericTimes.forEach(t => {
        const bin = Math.floor(t / binSize) * binSize;
        distribution[bin] = (distribution[bin] || 0) + 1;
      });
      return distribution;
    })(),
    
    skewness: (() => {
      if (count < 3) return null;
      const mean = overallAverage;
      const std = stdDev;
      const cubedDifferences = numericTimes.map(t => Math.pow((t - mean) / std, 3));
      return roundTo((cubedDifferences.reduce((a, b) => a + b, 0) * count) / ((count - 1) * (count - 2)));
    })(),
    
    kurtosis: (() => {
      if (count < 4) return null;
      const mean = overallAverage;
      const std = stdDev;
      const fourthPowerDiffs = numericTimes.map(t => Math.pow((t - mean) / std, 4));
      return roundTo((count * (count + 1) / ((count - 1) * (count - 2) * (count - 3))) * 
             fourthPowerDiffs.reduce((a, b) => a + b, 0) - 
             (3 * Math.pow(count - 1, 2)) / ((count - 2) * (count - 3)));
    })(),
    
    mode: (() => {
      const frequencyMap = {};
      let maxCount = 0;
      let modeValue = null;
      
      numericTimes.forEach(t => {
        const rounded = Math.round(t / 100) * 100;
        frequencyMap[rounded] = (frequencyMap[rounded] || 0) + 1;
        
        if (frequencyMap[rounded] > maxCount) {
          maxCount = frequencyMap[rounded];
          modeValue = rounded;
        }
      });
      
      return modeValue;
    })(),
    
    iqr: p75 !== null && p25 !== null ? roundTo(p75 - p25) : null,
    
    outlierCount: (() => {
      const threshold = overallAverage !== null && stdDev !== null ? overallAverage + 2 * stdDev : null;
      return threshold !== null ? numericTimes.filter(t => t > threshold).length : null;
    })()
  };

  // Estadísticas de tendencia
  const trendStats = {
    linearTrend: (() => {
      if (count < 2) return null;
      
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      
      numericTimes.forEach((t, i) => {
        sumX += i;
        sumY += t;
        sumXY += i * t;
        sumX2 += i * i;
      });
      
      const slope = (count * sumXY - sumX * sumY) / (count * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / count;
      
      return {
        slope: roundTo(slope),
        intercept: roundTo(intercept),
        rSquared: (() => {
          const yMean = sumY / count;
          let ssTot = 0;
          let ssRes = 0;
          
          numericTimes.forEach((t, i) => {
            ssTot += Math.pow(t - yMean, 2);
            const yPred = slope * i + intercept;
            ssRes += Math.pow(t - yPred, 2);
          });
          
          return roundTo(1 - (ssRes / ssTot));
        })()
      };
    })(),
    
    relativeImprovement: (() => {
      if (count < 10) return null;
      const first10 = numericTimes.slice(0, Math.floor(count * 0.1));
      const last10 = numericTimes.slice(-Math.floor(count * 0.1));
      
      const avgFirst = first10.reduce((a, b) => a + b, 0) / first10.length;
      const avgLast = last10.reduce((a, b) => a + b, 0) / last10.length;
      
      return {
        absolute: roundTo(avgFirst - avgLast),
        relative: roundTo(((avgFirst - avgLast) / avgFirst) * 100)
      };
    })(),
    
    improvementPer100: improvementRate ? roundTo(improvementRate * (100 / count)) : null
  };

  // Estadísticas de consistencia avanzadas
  const advancedConsistency = {
    coefficientOfVariation: stdDev !== null && overallAverage !== null ? 
      roundTo((stdDev / overallAverage) * 100) : null,
    
    within1StdDev: stdDev !== null && overallAverage !== null ?
      roundTo(numericTimes.filter(t => Math.abs(t - overallAverage) <= stdDev).length / count * 100) : null,
    within2StdDev: stdDev !== null && overallAverage !== null ?
      roundTo(numericTimes.filter(t => Math.abs(t - overallAverage) <= 2 * stdDev).length / count * 100) : null,
    within3StdDev: stdDev !== null && overallAverage !== null ?
      roundTo(numericTimes.filter(t => Math.abs(t - overallAverage) <= 3 * stdDev).length / count * 100) : null,
    
    percentileConsistency: p75 !== null && p25 !== null ? roundTo(p75 / p25) : null,
    
    ao5Variability: ao5s.length > 1 ? roundTo((() => {
      const diffs = [];
      for (let i = 1; i < ao5s.length; i++) {
        diffs.push(Math.abs(ao5s[i] - ao5s[i-1]));
      }
      return diffs.reduce((a, b) => a + b, 0) / diffs.length;
    })()) : null
  };

  // Estadísticas de PB
  const pbStats = {
    totalPBs: pbHistory.length,
    pbFrequency: (() => {
      if (pbHistory.length < 2) return null;
      const intervals = [];
      for (let i = 1; i < pbHistory.length; i++) {
        intervals.push(pbHistory[i].index - pbHistory[i-1].index);
      }
      return {
        average: roundTo(intervals.reduce((a, b) => a + b, 0) / intervals.length),
        median: roundTo(percentile(intervals, 50)),
        longest: Math.max(...intervals),
        shortest: Math.min(...intervals)
      };
    })(),
    
    pbImprovementRates: (() => {
      if (pbHistory.length < 2) return null;
      const improvements = [];
      for (let i = 1; i < pbHistory.length; i++) {
        improvements.push(((pbHistory[i-1].time - pbHistory[i].time) / pbHistory[i-1].time) * 100);
      }
      return {
        average: roundTo(improvements.reduce((a, b) => a + b, 0) / improvements.length),
        largest: roundTo(Math.max(...improvements)),
        smallest: roundTo(Math.min(...improvements))
      };
    })(),
    
    pbTimeIntervals: (() => {
      if (pbHistory.length < 2) return null;
      const intervals = [];
      for (let i = 1; i < pbHistory.length; i++) {
        intervals.push((new Date(pbHistory[i].timestamp) - new Date(pbHistory[i-1].timestamp)) / (1000 * 60 * 60 * 24));
      }
      return {
        daysAverage: roundTo(intervals.reduce((a, b) => a + b, 0) / intervals.length),
        daysMedian: roundTo(percentile(intervals, 50)),
        longestDays: Math.max(...intervals),
        shortestDays: Math.min(...intervals)
      };
    })()
  };

  // Estadísticas temporales
  const timeStats = {
    timeOfDayDistribution: (() => {
      const hours = Array(24).fill(0);
      validTimes.forEach(t => {
        if (t.timestamp) {
          const date = new Date(t.timestamp);
          const hour = date.getHours();
          hours[hour]++;
        }
      });
      return hours.map((count, hour) => ({ hour, count }));
    })(),
    
    performanceByHour: (() => {
      const hourStats = {};
      validTimes.forEach(t => {
        if (t.timestamp && !t.isDNF) {
          const date = new Date(t.timestamp);
          const hour = date.getHours();
          const timeValue = t.isPlusTwo ? t.time + 2000 : t.time;
          
          if (!hourStats[hour]) {
            hourStats[hour] = {
              count: 0,
              total: 0,
              times: []
            };
          }
          
          hourStats[hour].count++;
          hourStats[hour].total += timeValue;
          hourStats[hour].times.push(timeValue);
        }
      });
      
      const result = [];
      for (let hour = 0; hour < 24; hour++) {
        if (hourStats[hour]) {
          const avg = hourStats[hour].total / hourStats[hour].count;
          const sorted = [...hourStats[hour].times].sort((a, b) => a - b);
          const median = sorted.length % 2 === 0 ? 
            (sorted[sorted.length/2 - 1] + sorted[sorted.length/2]) / 2 : 
            sorted[Math.floor(sorted.length/2)];
          
          result.push({
            hour,
            count: hourStats[hour].count,
            average: roundTo(avg),
            median: roundTo(median),
            best: Math.min(...hourStats[hour].times),
            worst: Math.max(...hourStats[hour].times)
          });
        }
      }
      
      return result;
    })(),
    
    performanceByWeekday: (() => {
      const weekdayStats = {};
      validTimes.forEach(t => {
        if (t.timestamp && !t.isDNF) {
          const date = new Date(t.timestamp);
          const weekday = date.getDay();
          const timeValue = t.isPlusTwo ? t.time + 2000 : t.time;
          
          if (!weekdayStats[weekday]) {
            weekdayStats[weekday] = {
              count: 0,
              total: 0,
              times: []
            };
          }
          
          weekdayStats[weekday].count++;
          weekdayStats[weekday].total += timeValue;
          weekdayStats[weekday].times.push(timeValue);
        }
      });
      
      const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      return weekdays.map((day, index) => {
        if (weekdayStats[index]) {
          const avg = weekdayStats[index].total / weekdayStats[index].count;
          const sorted = [...weekdayStats[index].times].sort((a, b) => a - b);
          const median = sorted.length % 2 === 0 ? 
            (sorted[sorted.length/2 - 1] + sorted[sorted.length/2]) / 2 : 
            sorted[Math.floor(sorted.length/2)];
          
          return {
            weekday: day,
            count: weekdayStats[index].count,
            average: roundTo(avg),
            median: roundTo(median),
            best: Math.min(...weekdayStats[index].times),
            worst: Math.max(...weekdayStats[index].times)
          };
        }
        return null;
      }).filter(Boolean);
    })()
  };

  // Estadísticas de scrambles
  const scrambleStats = {
    averageScrambleLength: roundTo(validTimes
      .map(t => t.scramble ? t.scramble.split(' ').length : 0)
      .reduce((a, b) => a + b, 0) / validTimes.length),
    
    commonMoves: (() => {
      const moveCounts = {};
      validTimes.forEach(t => {
        if (t.scramble) {
          t.scramble.split(' ').forEach(move => {
            const cleanMove = move.replace(/[2']/g, '');
            moveCounts[cleanMove] = (moveCounts[cleanMove] || 0) + 1;
          });
        }
      });
      
      return Object.entries(moveCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([move, count]) => ({ move, count }));
    })(),
    
    scrambleLengthVsTime: (() => {
      const data = validTimes
        .filter(t => !t.isDNF && t.scramble)
        .map(t => ({
          length: t.scramble.split(' ').length,
          time: t.isPlusTwo ? t.time + 2000 : t.time
        }));
      
      if (data.length < 2) return null;
      
      const n = data.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      
      data.forEach(d => {
        sumX += d.length;
        sumY += d.time;
        sumXY += d.length * d.time;
        sumX2 += d.length * d.length;
      });
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      return {
        slope: roundTo(slope),
        intercept: roundTo(intercept),
        correlation: roundTo((() => {
          const xMean = sumX / n;
          const yMean = sumY / n;
          let numerator = 0;
          let denomX = 0;
          let denomY = 0;
          
          data.forEach(d => {
            numerator += (d.length - xMean) * (d.time - yMean);
            denomX += Math.pow(d.length - xMean, 2);
            denomY += Math.pow(d.time - yMean, 2);
          });
          
          return numerator / Math.sqrt(denomX * denomY);
        })())
      };
    })()
  };

  return {
    // Estadísticas básicas
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

    // Promedios
    ao5,
    ao12,
    ao50,
    ao100,
    mo3,

    // Mejores/peores promedios
    bestAo5,
    worstAo5,
    bestAo12,
    worstAo12,
    bestAo50,
    worstAo50,
    bestAo100,
    worstAo100,

    // Índices
    bestTimeIndex,
    worstTimeIndex,
    bestAo5Index,
    worstAo5Index,
    bestAo12Index,
    worstAo12Index,

    // Rangos de tiempo
    countSub10,
    countSub15,
    countSub20,
    countSub30,
    countOver30,

    // Medias de últimos solves
    meanOfLast5,
    meanOfLast12,
    meanOfLast50,
    meanOfLast100,

    // Tiempo total y rango
    totalTime,
    timeRange,

    // Tasa de mejora
    improvementRate,

    // Rachas
    bestNonDNFStreak: bestStreakNoDNF,
    worstDNFStreak,
    bestImprovementStreak,

    // PBs
    pbHistory,
    totalPBs: pbHistory.length,
    timeSinceLastPB: pbHistory.length > 0 ? 
      new Date() - new Date(pbHistory[pbHistory.length-1].timestamp) : null,
    maxSolvesWithoutPB,

    // Percentiles
    percentile25: p25,
    percentile50: median,
    percentile75: p75,
    percentile90: p90,

    // Estadísticas avanzadas
    distributionStats,
    trendStats,
    advancedConsistency,
    pbStats,
    timeStats,
    scrambleStats,

    // Datos brutos para gráficos
    numericTimes,
    validTimes,
    ao5s,
    ao12s,
    ao50s,
    ao100s,
    sortedTimes
  };
}