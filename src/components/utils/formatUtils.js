export function formatTimeDisplay(ms, showFullMs = false) {
  if (ms === "DNF" || ms === null) return "DNF";
  
  if (typeof ms !== 'number') return '--';
  
  if (ms >= 0) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const decimals = showFullMs ? Math.floor(ms % 1000) : Math.floor((ms % 1000) / 10);
    
    const twoDigits = (n) => n.toString().padStart(2, "0");
    const threeDigits = (n) => n.toString().padStart(3, "0");
    
    if (hours > 0) {
      return `${hours}:${twoDigits(minutes)}:${twoDigits(seconds)}.${showFullMs ? threeDigits(decimals) : twoDigits(decimals)}`;
    }
    if (minutes > 0) {
      return `${minutes}:${twoDigits(seconds)}.${showFullMs ? threeDigits(decimals) : twoDigits(decimals)}`;
    }
    return `${seconds}.${showFullMs ? threeDigits(decimals) : twoDigits(decimals)}`;
  } else {
    const seconds = Math.ceil(Math.abs(ms) / 1000);
    return `${seconds}`;
  }
}

export function formatTimeFull(ms, index, plusTwoTimes = [], dnfTimes = []) {
  if (ms === "DNF" || ms === null) return "DNF";
  
  const isPlusTwo = plusTwoTimes.includes(index);
  const isDnf = dnfTimes.includes(index);

  if (isDnf) return "DNF";
  
  const displayMs = isPlusTwo && typeof ms === 'number' ? ms + 2000 : ms;
  
  if (displayMs === "DNF") return "DNF";
  
  let formatted = formatTimeDisplay(displayMs, true); 
  return isPlusTwo ? `${formatted} (+2)` : formatted;
}