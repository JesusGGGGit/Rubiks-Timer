
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
  if (cv <= 5) return "#00FF00";     
  if (cv <= 10) return "#7FFF00";     
  if (cv <= 15) return "#ADFF2F";      
  if (cv <= 20) return "#FFFF00";    
  if (cv <= 25) return "#FFA500";   
  if (cv <= 30) return "#FF8C00";   
  if (cv <= 40) return "#FF4500";     
  return "#DC143C";               
};
