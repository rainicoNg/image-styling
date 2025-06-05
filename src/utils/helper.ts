const getGCD = (a: number, b: number): number =>
  b === 0 ? a : getGCD(b, a % b);

export const getAspectRatio = (width: number, height: number) => {
  const gcd = getGCD(width, height);
  return `${width / gcd}/${height / gcd}`;
};

export const getGridCols = (col: number) => {
  switch (col) {
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-3";
    case 1:
    default:
      return "grid-cols-1";
  }
};
