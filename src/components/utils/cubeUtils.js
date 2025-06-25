export function parseScramble(scramble, cubeType = "333") {
  const numericCubes = ["222", "333", "444", "555", "666", "777"];
  
  let size = 0;
  if (numericCubes.includes(cubeType)) {
    size = parseInt(cubeType[0]);
  } else {
    return getDefaultCubeStateForType(cubeType);
  }

  const stickersPerFace = size * size;

  const cubeState = {
    U: Array(stickersPerFace).fill('white'),
    L: Array(stickersPerFace).fill('orange'),
    F: Array(stickersPerFace).fill('green'),
    R: Array(stickersPerFace).fill('red'),
    B: Array(stickersPerFace).fill('blue'),
    D: Array(stickersPerFace).fill('yellow')
  };

  if (!scramble || typeof scramble !== 'string' || scramble.includes("Generating") || scramble.includes("Failed")) {
    return cubeState;
  }
if (cubeType === "222" || cubeType === "333") {
  const moves = scramble.trim().split(/\s+/);
  moves.forEach(move => {
    if (!move) return;
    const face = move[0];
    const isPrime = move.includes("'");
    const isDouble = move.includes("2");
    const turns = isDouble ? 2 : (isPrime ? 3 : 1);

    for (let i = 0; i < turns; i++) {
      switch (cubeType) {
        case "222":
          rotateFace2x2(cubeState, face);
          break;
        case "333":
          rotateFace3x3(cubeState, face);
          break;
        default:
          // No hacer nada o lanzar error si quieres
          break;
      }
    }
  });
}
return cubeState;

}

function getDefaultCubeStateForType(cubeType) {
  switch(cubeType) {
    case "pyram": 
      return {
        U: Array(9).fill('green'),
        L: Array(9).fill('blue'),
        R: Array(9).fill('red'),
        B: Array(9).fill('yellow')
      };
    default:
      return {};
  }
}


function rotateFace2x2(cubeState, face) {
  const fc = cubeState[face];
  cubeState[face] = [
    fc[2], fc[0],
    fc[3], fc[1]
  ];

  let temp;
  switch (face) {
    case 'U': {
      temp = [cubeState.F[0], cubeState.F[1]];
      cubeState.F[0] = cubeState.R[0];
      cubeState.F[1] = cubeState.R[1];

      cubeState.R[0] = cubeState.B[0];
      cubeState.R[1] = cubeState.B[1];

      cubeState.B[0] = cubeState.L[0];
      cubeState.B[1] = cubeState.L[1];

      cubeState.L[0] = temp[0];
      cubeState.L[1] = temp[1];
      break;
    }

    case 'D': {
      temp = [cubeState.F[2], cubeState.F[3]];
      cubeState.F[2] = cubeState.L[2];
      cubeState.F[3] = cubeState.L[3];

      cubeState.L[2] = cubeState.B[2];
      cubeState.L[3] = cubeState.B[3];

      cubeState.B[2] = cubeState.R[2];
      cubeState.B[3] = cubeState.R[3];

      cubeState.R[2] = temp[0];
      cubeState.R[3] = temp[1];
      break;
    }

    case 'F': {
      temp = [cubeState.U[2], cubeState.U[3]];
      cubeState.U[2] = cubeState.L[3];
      cubeState.U[3] = cubeState.L[1];

      cubeState.L[1] = cubeState.D[0];
      cubeState.L[3] = cubeState.D[1];

      cubeState.D[0] = cubeState.R[2];
      cubeState.D[1] = cubeState.R[0];

      cubeState.R[2] = temp[1];
      cubeState.R[0] = temp[0];
      break;
    }

    case 'B': {
      temp = [cubeState.U[0], cubeState.U[1]];
      cubeState.U[0] = cubeState.R[1];
      cubeState.U[1] = cubeState.R[3];

      cubeState.R[1] = cubeState.D[2];
      cubeState.R[3] = cubeState.D[3];

      cubeState.D[2] = cubeState.L[2];
      cubeState.D[3] = cubeState.L[0];

      cubeState.L[2] = temp[0];
      cubeState.L[0] = temp[1];
      break;
    }

    case 'R': {
      temp = [cubeState.U[1], cubeState.U[3]];
      cubeState.U[1] = cubeState.F[1];
      cubeState.U[3] = cubeState.F[3];

      cubeState.F[1] = cubeState.D[1];
      cubeState.F[3] = cubeState.D[3];

      cubeState.D[1] = cubeState.B[2];
      cubeState.D[3] = cubeState.B[0];

      cubeState.B[0] = temp[1];
      cubeState.B[2] = temp[0];
      break;
    }

    case 'L': {
      temp = [cubeState.U[0], cubeState.U[2]];
      cubeState.U[0] = cubeState.B[3];
      cubeState.U[2] = cubeState.B[1];

      cubeState.B[1] = cubeState.D[2];
      cubeState.B[3] = cubeState.D[0];

      cubeState.D[0] = cubeState.F[0];
      cubeState.D[2] = cubeState.F[2];

      cubeState.F[0] = temp[0];
      cubeState.F[2] = temp[1];
      break;
    }
    default:
      break;
  }
}


// Rota una cara de un cubo 3x3
function rotateFace3x3(cubeState, face) {
  const fc = cubeState[face];
  cubeState[face] = [
    fc[6], fc[3], fc[0],
    fc[7], fc[4], fc[1],
    fc[8], fc[5], fc[2]
  ];

  let temp;
  switch (face) {
    case 'U': {
      temp = cubeState.F.slice(0, 3);
      cubeState.F[0] = cubeState.R[0];
      cubeState.F[1] = cubeState.R[1];
      cubeState.F[2] = cubeState.R[2];

      cubeState.R[0] = cubeState.B[0];
      cubeState.R[1] = cubeState.B[1];
      cubeState.R[2] = cubeState.B[2];

      cubeState.B[0] = cubeState.L[0];
      cubeState.B[1] = cubeState.L[1];
      cubeState.B[2] = cubeState.L[2];

      cubeState.L[0] = temp[0];
      cubeState.L[1] = temp[1];
      cubeState.L[2] = temp[2];
      break;
    }

    case 'D': {
      temp = cubeState.F.slice(6, 9);
      cubeState.F[6] = cubeState.L[6];
      cubeState.F[7] = cubeState.L[7];
      cubeState.F[8] = cubeState.L[8];

      cubeState.L[6] = cubeState.B[6];
      cubeState.L[7] = cubeState.B[7];
      cubeState.L[8] = cubeState.B[8];

      cubeState.B[6] = cubeState.R[6];
      cubeState.B[7] = cubeState.R[7];
      cubeState.B[8] = cubeState.R[8];

      cubeState.R[6] = temp[0];
      cubeState.R[7] = temp[1];
      cubeState.R[8] = temp[2];
      break;
    }

    case 'F': {
      temp = [cubeState.U[6], cubeState.U[7], cubeState.U[8]];
      cubeState.U[6] = cubeState.L[8];
      cubeState.U[7] = cubeState.L[5];
      cubeState.U[8] = cubeState.L[2];

      cubeState.L[8] = cubeState.D[2];
      cubeState.L[5] = cubeState.D[1];
      cubeState.L[2] = cubeState.D[0];

      cubeState.D[0] = cubeState.R[6];
      cubeState.D[1] = cubeState.R[3];
      cubeState.D[2] = cubeState.R[0];

      cubeState.R[0] = temp[0];
      cubeState.R[3] = temp[1];
      cubeState.R[6] = temp[2];
      break;
    }

    case 'B': {
      temp = [cubeState.U[0], cubeState.U[1], cubeState.U[2]];
      cubeState.U[0] = cubeState.R[2];
      cubeState.U[1] = cubeState.R[5];
      cubeState.U[2] = cubeState.R[8];

      cubeState.R[2] = cubeState.D[8];
      cubeState.R[5] = cubeState.D[7];
      cubeState.R[8] = cubeState.D[6];

      cubeState.D[6] = cubeState.L[0];
      cubeState.D[7] = cubeState.L[3];
      cubeState.D[8] = cubeState.L[6];

      cubeState.L[0] = temp[2];
      cubeState.L[3] = temp[1];
      cubeState.L[6] = temp[0];
      break;
    }

    case 'R': {
      temp = [cubeState.U[2], cubeState.U[5], cubeState.U[8]];
      cubeState.U[2] = cubeState.F[2];
      cubeState.U[5] = cubeState.F[5];
      cubeState.U[8] = cubeState.F[8];

      cubeState.F[2] = cubeState.D[2];
      cubeState.F[5] = cubeState.D[5];
      cubeState.F[8] = cubeState.D[8];

      cubeState.D[2] = cubeState.B[6];
      cubeState.D[5] = cubeState.B[3];
      cubeState.D[8] = cubeState.B[0];

      cubeState.B[0] = temp[2];
      cubeState.B[3] = temp[1];
      cubeState.B[6] = temp[0];
      break;
    }

    case 'L': {
      temp = [cubeState.U[0], cubeState.U[3], cubeState.U[6]];
      cubeState.U[0] = cubeState.B[8];
      cubeState.U[3] = cubeState.B[5];
      cubeState.U[6] = cubeState.B[2];

      cubeState.B[2] = cubeState.D[6];
      cubeState.B[5] = cubeState.D[3];
      cubeState.B[8] = cubeState.D[0];

      cubeState.D[0] = cubeState.F[0];
      cubeState.D[3] = cubeState.F[3];
      cubeState.D[6] = cubeState.F[6];

      cubeState.F[0] = temp[0];
      cubeState.F[3] = temp[1];
      cubeState.F[6] = temp[2];
      break;
    }

    default:
      break;
  }
}

