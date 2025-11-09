import { useState, useEffect } from "react";

export function useSettings() {
  // Inicializar estados leyendo localStorage o valores por defecto
  const [inspectionTime, setInspectionTime] = useState(() => localStorage.getItem("inspectionTime") === "true");
  const [inspectionDuration, setInspectionDuration] = useState(() => {
    const stored = localStorage.getItem("inspectionDuration");
    return stored ? parseInt(stored, 10) : 15;
  });
  const [holdToStart, setHoldToStart] = useState(() => localStorage.getItem("holdToStart") !== "false");

  // Efectos para guardar los cambios en localStorage
  useEffect(() => {
    localStorage.setItem("inspectionTime", inspectionTime);
  }, [inspectionTime]);

  useEffect(() => {
    localStorage.setItem("inspectionDuration", inspectionDuration);
  }, [inspectionDuration]);

  useEffect(() => {
    localStorage.setItem("holdToStart", holdToStart);
  }, [holdToStart]);

  // Don't-ask-again for deletion (shared setting)
  const [dontAskAgain, setDontAskAgain] = useState(() => {
    return localStorage.getItem("dontAskDelete") === "true";
  });

  useEffect(() => {
    localStorage.setItem("dontAskDelete", dontAskAgain ? "true" : "false");
  }, [dontAskAgain]);

  // Show/hide cube preference
  const [showCube, setShowCube] = useState(() => {
    const stored = localStorage.getItem('showCube');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('showCube', showCube ? 'true' : 'false');
  }, [showCube]);

  return {
    inspectionTime,
    setInspectionTime,
    inspectionDuration,
    setInspectionDuration,
    holdToStart,
    setHoldToStart,
    dontAskAgain,
    setDontAskAgain,
    showCube,
    setShowCube,
  };
}

export default useSettings;
