import './CubeVisualization.css';

export default function CubeVisualization({ cubeState, cubeType = '3x3' }) {
  const cubeDimensions = parseInt(cubeType[0]);
  if (cubeDimensions !== 2 && cubeDimensions !== 3) {
    return null;
  }

  const stickersPerFace = cubeDimensions * cubeDimensions;

  const safeCubeState = {
    U: cubeState.U?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('white'),
    L: cubeState.L?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('orange'),
    F: cubeState.F?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('green'),
    R: cubeState.R?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('red'),
    B: cubeState.B?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('blue'),
    D: cubeState.D?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('yellow')
  };

  const baseStickerSize = cubeDimensions === 2 ? 'var(--cube-size, 30px)' : 'calc(var(--cube-size, 30px) / 1.5)';
  const stickerSize = baseStickerSize;
  const gapSize = '1px';
  const faceWidth = `calc(${cubeDimensions} * ${stickerSize} + ${(cubeDimensions - 1)} * ${gapSize})`;

  const renderPlaceholder = () => (
    <div
      className="cube-face placeholder"
      style={{ width: faceWidth, height: faceWidth }}
    ></div>
  );

  const renderFace = (face, faceName) => (
    <div
      className={`cube-face ${faceName}-face`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cubeDimensions}, ${stickerSize})`,
        gridTemplateRows: `repeat(${cubeDimensions}, ${stickerSize})`,
        gap: gapSize,
        width: faceWidth,
        height: faceWidth,
        padding: '0',
        border: 'none'
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
            border: 'none'
          }}
        ></div>
      ))}
    </div>
  );

  return (
    <div className={`cube-visualization cube-${cubeDimensions}x${cubeDimensions}`}>
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