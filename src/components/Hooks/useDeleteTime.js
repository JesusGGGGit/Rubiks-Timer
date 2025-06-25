import { useState, useCallback, useEffect } from "react";

export function useDeleteTime(activeSessionId, setSessions) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [timeToDeleteIndex, setTimeToDeleteIndex] = useState(null);
  const [dontAskAgain, setDontAskAgain] = useState(() => {
    return localStorage.getItem("dontAskDelete") === "true";
  });

  useEffect(() => {
    localStorage.setItem("dontAskDelete", dontAskAgain ? "true" : "false");
  }, [dontAskAgain]);

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
      if (dontAskAgain) {
        deleteTime(index);
      } else {
        setTimeToDeleteIndex(index);
        setShowDeleteModal(true);
      }
    },
    [dontAskAgain, deleteTime]
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
