
export function formatTimeDisplay(ms) {
  if (ms >= 0) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    const twoDigits = (n) => (n < 10 ? "0" + n : n);

    if (hours > 0) return `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}.${tenths}`;
    if (minutes > 0) return `${minutes}:${twoDigits(seconds)}.${tenths}`;
    return `${seconds}.${tenths}`;
  } else {
    const seconds = Math.ceil(Math.abs(ms) / 1000);
    return `${seconds}`;
  }
}

export function formatTimeFull(ms, index, plusTwoTimes, dnfTimes) {
  const isPlusTwo = plusTwoTimes.includes(index);
  const isDnf = dnfTimes.includes(index);

  if (isDnf) return "DNF";

  const displayMs = isPlusTwo && typeof ms === 'number' ? ms + 2000 : ms;

  if (displayMs === "DNF") return "DNF";

  const hours = Math.floor(displayMs / 3600000);
  const minutes = Math.floor((displayMs % 3600000) / 60000);
  const seconds = Math.floor((displayMs % 60000) / 1000);
  const centiseconds = Math.floor((displayMs % 1000) / 10);
  const twoDigits = (n) => (n < 10 ? "0" + n : n);

  let timeStr;
  if (hours > 0) {
    timeStr = `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}.${twoDigits(centiseconds)}`;
  } else if (minutes > 0) {
    timeStr = `${minutes}:${twoDigits(seconds)}.${twoDigits(centiseconds)}`;
  } else {
    timeStr = `${seconds}.${twoDigits(centiseconds)}`;
  }

  return isPlusTwo ? `${timeStr} (+2)` : timeStr;
}
