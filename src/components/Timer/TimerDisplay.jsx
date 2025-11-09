import React from 'react';
import { formatTime } from '../../utils/helpers';

export default function TimerDisplay({ time, running, inspectionRunning, ready, dnf }) {
  const getTimerClass = () => {
    if (dnf) return 'dnf';
    if (inspectionRunning) {
      if (time >= -15000) return 'inspection-running';
      return 'inspection-almost-done';
    }
    if (ready) return 'ready';
    if (running) return 'running';
    return '';
  };

  return (
    <div className={`timer-display ${getTimerClass()}`}>
      <div className="time">
        {formatTime(time)}
      </div>
      {dnf && <div className="dnf-label">DNF</div>}
    </div>
  );
}