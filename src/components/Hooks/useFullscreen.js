import { useState, useEffect } from "react";

export default function useFullscreen(isActiveInitial = false) {
  const [isFullscreen, setIsFullscreen] = useState(isActiveInitial);

  useEffect(() => {
    if (isFullscreen) {
      document.documentElement.requestFullscreen().catch(e => console.log(e));
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log(e));
      }
    }
  }, [isFullscreen]);

  // Opcional: escuchar cambios de fullscreen para sincronizar estado
  useEffect(() => {
    const onFullscreenChange = () => {
      const fsElement = document.fullscreenElement;
      setIsFullscreen(!!fsElement);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  return [isFullscreen, setIsFullscreen];
}
