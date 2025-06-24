// descriptions.js
export const getStdDevDescription = (cv) => {
  if (cv === null || isNaN(cv)) return "No hay datos suficientes para calcular la variación de tus tiempos.";
  if (cv <= 5) return "Muy baja variación: tus tiempos son muy estables y casi no cambian.";
  if (cv <= 10) return "Baja variación: tus tiempos son bastante similares entre sí.";
  if (cv <= 15) return "Variación moderada: tus tiempos suelen ser bastante regulares.";
  if (cv <= 20) return "Variación aceptable: hay algo de diferencia entre tus tiempos, pero es normal.";
  if (cv <= 25) return "Variación notable: tus tiempos cambian con cierta frecuencia.";
  if (cv <= 30) return "Alta variación: tus tiempos son irregulares y cambian bastante.";
  if (cv <= 40) return "Muy alta variación: tus tiempos fluctúan mucho y son impredecibles.";
  return "Extrema variación: tus tiempos son muy inconsistentes y muy variables.";
};

export const getStdDevColor = (cv) => {
  if (cv === null || isNaN(cv)) return "inherit";
  if (cv <= 5) return "#00FF00";     // Bright green
  if (cv <= 10) return "#7FFF00";    // Chartreuse
  if (cv <= 15) return "#ADFF2F";    // Green-yellow
  if (cv <= 20) return "#FFFF00";    // Yellow
  if (cv <= 25) return "#FFA500";    // Orange
  if (cv <= 30) return "#FF8C00";    // Dark orange
  if (cv <= 40) return "#FF4500";    // Orange-red
  return "#DC143C";                  // Crimson
};

// New helper functions for Estadisticas
export const getConsistencyDescription = (index) => {
  if (index === null || isNaN(index)) return "No hay datos suficientes para calcular la consistencia.";
  if (index <= 0.05) return "Consistencia excepcional: tus tiempos son extremadamente regulares.";
  if (index <= 0.1) return "Muy consistente: tus tiempos varían muy poco.";
  if (index <= 0.15) return "Consistente: tus tiempos son bastante regulares.";
  if (index <= 0.2) return "Consistencia moderada: hay algo de variación pero es normal.";
  if (index <= 0.25) return "Consistencia aceptable: tus tiempos tienen variaciones notables.";
  if (index <= 0.3) return "Poca consistencia: tus tiempos varían significativamente.";
  if (index <= 0.4) return "Inconsistente: hay mucha variación en tus tiempos.";
  return "Muy inconsistente: tus tiempos son altamente impredecibles.";
};

export const getImprovementDescription = (rate) => {
  if (rate === null || isNaN(rate)) return "No hay datos suficientes para calcular la mejora.";
  if (rate > 10) return "Mejora espectacular: ¡estás progresando muy rápidamente!";
  if (rate > 5) return "Gran mejora: tu progreso es muy notable.";
  if (rate > 2) return "Mejora constante: estás progresando a buen ritmo.";
  if (rate > 0) return "Ligera mejora: hay progreso pero podría ser más rápido.";
  if (rate === 0) return "Sin mejora: tus tiempos se mantienen iguales.";
  return "Regresión: tus tiempos están empeorando en promedio.";
};

export const getTimeRangeColor = (time) => {
  if (time < 10000) return "#4CAF50";    // Green for sub-10
  if (time < 15000) return "#8BC34A";    // Light green for sub-15
  if (time < 20000) return "#FFC107";    // Amber for sub-20
  if (time < 30000) return "#FF9800";    // Orange for sub-30
  return "#F44336";                      // Red for 30+
};