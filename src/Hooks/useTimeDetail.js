// src/Hooks/useTimeDetail.js
import { useState, useCallback } from 'react';

export function useTimeDetail({ activeSessionId, setSessions, activeSession }) {
  const [selectedTimeDetail, setSelectedTimeDetail] = useState(null);
  const [showTimeDetailModal, setShowTimeDetailModal] = useState(false);

  const openTimeDetailModal = useCallback((index) => {
    const time = activeSession?.times?.[index];
    if (!time) return;
    setSelectedTimeDetail({
      index,
      time: time.time,
      scramble: time.scramble
    });
    setShowTimeDetailModal(true);
  }, [activeSession]);

  const applyPlusTwo = useCallback(() => {
    if (!selectedTimeDetail) return;

    setSessions(prevSessions => prevSessions.map(session =>
      session.id === activeSessionId
        ? {
            ...session,
            plusTwoTimes: session.plusTwoTimes.includes(selectedTimeDetail.index)
              ? session.plusTwoTimes.filter(i => i !== selectedTimeDetail.index)
              : [...session.plusTwoTimes, selectedTimeDetail.index],
            dnfTimes: session.dnfTimes.filter(i => i !== selectedTimeDetail.index)
          }
        : session
    ));
  }, [selectedTimeDetail, activeSessionId, setSessions]);

  const applyDnf = useCallback(() => {
    if (!selectedTimeDetail) return;

    setSessions(prevSessions => prevSessions.map(session =>
      session.id === activeSessionId
        ? {
            ...session,
            dnfTimes: session.dnfTimes.includes(selectedTimeDetail.index)
              ? session.dnfTimes.filter(i => i !== selectedTimeDetail.index)
              : [...session.dnfTimes, selectedTimeDetail.index],
            plusTwoTimes: session.plusTwoTimes.filter(i => i !== selectedTimeDetail.index)
          }
        : session
    ));
  }, [selectedTimeDetail, activeSessionId, setSessions]);

  return {
    selectedTimeDetail,
    showTimeDetailModal,
    setShowTimeDetailModal,
    openTimeDetailModal,
    applyPlusTwo,
    applyDnf
  };
}
