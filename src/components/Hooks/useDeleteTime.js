import { useState, useCallback, useEffect } from "react";

export function useDeleteTime(activeSessionId, setSessions, externalDontAskAgain, externalSetDontAskAgain) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [timeToDeleteIndex, setTimeToDeleteIndex] = useState(null);

  // Support external shared dontAskAgain (from useSettings) or keep local state
  const hasExternal = typeof externalDontAskAgain !== 'undefined';
  const [localDontAsk, setLocalDontAsk] = useState(() => {
    return localStorage.getItem("dontAskDelete") === "true";
  });
  const dontAskAgain = hasExternal ? externalDontAskAgain : localDontAsk;
  const setDontAskAgain = hasExternal ? (externalSetDontAskAgain || (()=>{})) : setLocalDontAsk;

  useEffect(() => {
    if (!hasExternal) {
      localStorage.setItem("dontAskDelete", dontAskAgain ? "true" : "false");
    }
  }, [dontAskAgain, hasExternal]);

  const deleteTime = useCallback(
    (index) => {
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                times: session.times.filter((_, i) => i !== index),
                plusTwoTimes: session.plusTwoTimes
                  .filter((i) => i !== index)
                  .map((i) => (i > index ? i - 1 : i)),
                dnfTimes: session.dnfTimes
                  .filter((i) => i !== index)
                  .map((i) => (i > index ? i - 1 : i)),
              }
            : session
        )
      );
    },
    [activeSessionId, setSessions]
  );

  const requestDeleteTime = useCallback(
    (index) => {
      // Re-evaluate localStorage in case other parts changed it
      const currentDontAsk = hasExternal ? dontAskAgain : (localStorage.getItem("dontAskDelete") === "true");
      if (currentDontAsk) {
        deleteTime(index);
      } else {
        setTimeToDeleteIndex(index);
        setShowDeleteModal(true);
      }
    },
    [deleteTime, hasExternal, dontAskAgain]
  );

  const confirmDeleteTime = useCallback(() => {
    if (timeToDeleteIndex !== null) {
      deleteTime(timeToDeleteIndex);
    }
    setShowDeleteModal(false);
  }, [timeToDeleteIndex, deleteTime]);

  return {
    showDeleteModal,
    setShowDeleteModal,
    timeToDeleteIndex,
    setTimeToDeleteIndex,
    dontAskAgain,
    setDontAskAgain,
    deleteTime,
    requestDeleteTime,
    confirmDeleteTime,
  };
}
