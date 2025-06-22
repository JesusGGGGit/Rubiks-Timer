import './CubeVisualization.css';

export default function CubeVisualization({ cubeState, cubeType = '3x3' }) {
  // Extraemos el tamaño solo si es 2 o 3, sino no renderizamos nada
  const cubeSize = parseInt(cubeType[0]);
  if (cubeSize !== 2 && cubeSize !== 3) {
    return
  }

  const stickersPerFace = cubeSize * cubeSize;

  const safeCubeState = {
    U: cubeState.U?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('white'),
    L: cubeState.L?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('orange'),
    F: cubeState.F?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('green'),
    R: cubeState.R?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('red'),
    B: cubeState.B?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('blue'),
    D: cubeState.D?.slice(0, stickersPerFace) || Array(stickersPerFace).fill('yellow')
  };

  const stickerSize = cubeSize === 2 ? '40px' : '30px';
  const gapSize = '1px';
  const faceWidth = `calc(${cubeSize} * ${stickerSize} + ${(cubeSize - 1)} * ${gapSize})`;

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
        gridTemplateColumns: `repeat(${cubeSize}, ${stickerSize})`,
        gridTemplateRows: `repeat(${cubeSize}, ${stickerSize})`,
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
