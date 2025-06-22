// utils/timesUtils.js
export const getSortedTimes = (activeSession, sortOrder) => {
  if (!activeSession || !activeSession.times) return [];

  const timesWithIndices = activeSession.times.map((t, i) => ({
    ...t,
    index: i,
    isDnf: activeSession.dnfTimes.includes(i),
    isPlusTwo: activeSession.plusTwoTimes.includes(i),
    numericTime: activeSession.dnfTimes.includes(i)
      ? Infinity
      : activeSession.plusTwoTimes.includes(i)
      ? t.time + 2000
      : t.time,
  }));

  switch (sortOrder) {
    case "recent":
      return [...timesWithIndices].reverse();
    case "oldest":
      return [...timesWithIndices];
    case "fastest":
      return [...timesWithIndices].sort((a, b) => a.numericTime - b.numericTime);
    case "slowest":
      return [...timesWithIndices].sort((a, b) => b.numericTime - a.numericTime);
    default:
      return [...timesWithIndices].reverse();
  }
};
