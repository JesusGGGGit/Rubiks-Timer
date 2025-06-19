import React from 'react';

export default function CubeVisualization({ cubeState }) {
  return (
    <div className="cube-visualization">
      <div className="cube-face-row">
        <div className="cube-face placeholder"></div>
        <div className="cube-face up-face">
          {cubeState.U.map((color, i) => (
            <div key={`U${i}`} className="cube-sticker" style={{ backgroundColor: color }}></div>
          ))}
        </div>
        <div className="cube-face placeholder"></div>
        <div className="cube-face placeholder"></div>
      </div>
      <div className="cube-face-row">
        <div className="cube-face left-face">
          {cubeState.L.map((color, i) => (
            <div key={`L${i}`} className="cube-sticker" style={{ backgroundColor: color }}></div>
          ))}
        </div>
        <div className="cube-face front-face">
          {cubeState.F.map((color, i) => (
            <div key={`F${i}`} className="cube-sticker" style={{ backgroundColor: color }}></div>
          ))}
        </div>
        <div className="cube-face right-face">
          {cubeState.R.map((color, i) => (
            <div key={`R${i}`} className="cube-sticker" style={{ backgroundColor: color }}></div>
          ))}
        </div>
        <div className="cube-face back-face">
          {cubeState.B.map((color, i) => (
            <div key={`B${i}`} className="cube-sticker" style={{ backgroundColor: color }}></div>
          ))}
        </div>
      </div>
      <div className="cube-face-row">
        <div className="cube-face placeholder"></div>
        <div className="cube-face down-face">
          {cubeState.D.map((color, i) => (
            <div key={`D${i}`} className="cube-sticker" style={{ backgroundColor: color }}></div>
          ))}
        </div>
        <div className="cube-face placeholder"></div>
        <div className="cube-face placeholder"></div>
      </div>
    </div>
  );
}
