// hooks/useScramble.js
import { useCallback, useEffect, useState } from "react";
import { parseScramble } from "../utils/cubeUtils";

const eventMap = {
  "2x2": "222",
  "3x3": "333",
  "4x4": "444",
  "5x5": "555",
  "6x6": "666",
  "7x7": "777",
  Pyraminx: "pyram",
};

export function useScramble(cubeType = "3x3") {
  const [scramble, setScramble] = useState("Generating scramble...");
  const [cubeState, setCubeState] = useState(parseScramble(""));

  const generateScramble = useCallback(async () => {
    const event = eventMap[cubeType] || "333";

    setScramble("Generating scramble...");
    setCubeState(parseScramble(""));

    try {
      if (window.Worker && window.scrambleWorker) {
        const scramble = await new Promise((resolve) => {
          window.scrambleWorker.onmessage = (e) => resolve(e.data);
          window.scrambleWorker.postMessage({ event });
        });
        setScramble(scramble);
        setCubeState(parseScramble(scramble, event));
      } else {
        if (typeof window.randomScrambleForEvent !== "function") {
          throw new Error("Scramble library not ready");
        }
        const scr = await window.randomScrambleForEvent(event);
        setScramble(scr.toString());
        setCubeState(parseScramble(scr.toString(), event));
      }
    } catch (e) {
      console.error("generateScramble error for", event, e);
      setScramble("Error generating scramble");
    }
  }, [cubeType]);

  useEffect(() => {
    if (window.scrambleLibraryLoaded) {
      generateScramble();
    } else {
      const interval = setInterval(() => {
        if (window.scrambleLibraryLoaded) {
          generateScramble();
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [generateScramble]);

  return { scramble, cubeState, generateScramble };
}
