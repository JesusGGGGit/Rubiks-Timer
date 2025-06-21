import React from 'react';

export default function CubeVisualization({ cubeState, cubeType = '3x3' }) {
  const cubeSize = parseInt(cubeType[0]) || 3;
  const stickersPerFace = cubeSize * cubeSize;

  const safeCubeState = {
    U: cubeState.U?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('white'),
    L: cubeState.L?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('orange'),
    F: cubeState.F?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('green'),
    R: cubeState.R?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('red'),
    B: cubeState.B?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('blue'),
    D: cubeState.D?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('yellow')
  };

  const getStickerSize = () => {
    switch (cubeSize) {
      case 2: return '40px';
      case 3: return '30px';
      case 4: return '22px';
      case 5: return '18px';
      case 6: return '15px';
      case 7: return '13px';
      default: return '30px';
    }
  };

  const stickerSize = getStickerSize();
  const gapSize = '1px';

  const faceWidth = `calc(${cubeSize} * ${stickerSize} + ${(cubeSize - 1)} * ${gapSize})`;

  const renderPlaceholder = () => (
    <div
      className="cube-face placeholder"
      style={{
        width: faceWidth,
        height: faceWidth
      }}
    ></div>
  );

  const renderFace = (face, faceName) => (
    <div
      className={`cube-face ${faceName}-face`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cubeSize}, ${stickerSize})`,
        gridTemplateRows: `repeat(${cubeSize}, ${stickerSize})`,
        gap: gapSize,
        width: faceWidth,
        height: faceWidth,
        padding: cubeSize >= 4 ? '2px' : '0',
        border: cubeSize >= 4 ? '1px solid #333' : 'none'
      }}
    >
      {safeCubeState[face].map((color, i) => (
        <div
          key={`${face}${i}`}
          className="cube-sticker"
          style={{
            backgroundColor: color,
            width: stickerSize,
            height: stickerSize,
            border: cubeSize >= 4 ? '1px solid rgba(0,0,0,0.1)' : 'none'
          }}
        ></div>
      ))}
    </div>
  );

  return (
    <div className={`cube-visualization cube-${cubeSize}x${cubeSize}`}>
      <div className="cube-face-row">
        {renderPlaceholder()}
        {renderFace('U', 'up')}
        {renderPlaceholder()}
        {renderPlaceholder()}
      </div>
      <div className="cube-face-row">
        {renderFace('L', 'left')}
        {renderFace('F', 'front')}
        {renderFace('R', 'right')}
        {renderFace('B', 'back')}
      </div>
      <div className="cube-face-row">
        {renderPlaceholder()}
        {renderFace('D', 'down')}
        {renderPlaceholder()}
        {renderPlaceholder()}
      </div>
    </div>
  );
}
