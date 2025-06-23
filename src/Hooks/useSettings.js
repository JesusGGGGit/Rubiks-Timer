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

  return {
    inspectionTime,
    setInspectionTime,
    inspectionDuration,
    setInspectionDuration,
    holdToStart,
    setHoldToStart,
  };
}

export default useSettings;
