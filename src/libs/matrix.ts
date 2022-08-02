export const createMatrix = () => {
  const array16 = Array.from(new Array(16));
  return array16.map((_row, rowIndex) =>
    array16.map((_col, colIndex) => `${rowIndex}:${colIndex}`)
  );
};

export const matrix = createMatrix();
export let matrixIds: string[] = [];
matrix.forEach((cols) => cols.forEach((col) => matrixIds.push(col)));
