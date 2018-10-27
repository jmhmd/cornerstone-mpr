// https://www.geeksforgeeks.org/bresenhams-algorithm-for-3-d-line-drawing/
// http://members.chello.at/~easyfilter/bresenham.html

function bresenham3D(point1: Array<number>, point2: Array<number>) {
  let [x1, y1, z1] = point1.map(Math.ceil);
  let [x2, y2, z2] = point2.map(Math.ceil);
  const hasNaN = [...point1, ...point2].filter(isNaN);
  const hasUndefined = [...point1, ...point2].filter(p => p === undefined);
  if (hasNaN.length > 0 || hasUndefined.length > 0) throw new Error('Invalid coordinate');

  const listOfPoints: Array<Array<number>> = [];
  listOfPoints.push([x1, y1, z1]);
  const dx: number = Math.abs(x2 - x1);
  const dy: number = Math.abs(y2 - y1);
  const dz: number = Math.abs(z2 - z1);
  let xs: number;
  let ys: number;
  let zs: number;
  if (x2 > x1) {
    xs = 1;
  } else {
    xs = -1;
  }
  if (y2 > y1) {
    ys = 1;
  } else {
    ys = -1;
  }
  if (z2 > z1) {
    zs = 1;
  } else {
    zs = -1;
  }

  // Driving axis is X-axis
  if (dx >= dy && dx >= dz) {
    let p1: number = 2 * dy - dx;
    let p2: number = 2 * dz - dx;
    while (x1 !== x2) {
      x1 += xs;
      if (p1 >= 0) {
        y1 += ys;
        p1 -= 2 * dx;
      }
      if (p2 >= 0) {
        z1 += zs;
        p2 -= 2 * dx;
      }
      p1 += 2 * dy;
      p2 += 2 * dz;
      listOfPoints.push([x1, y1, z1]);
    }
  }

  // Driving axis is Y-axis
  else if (dy >= dx && dy >= dz) {
    let p1: number = 2 * dx - dy;
    let p2: number = 2 * dz - dy;
    while (y1 !== y2) {
      y1 += ys;
      if (p1 >= 0) {
        x1 += xs;
        p1 -= 2 * dy;
      }
      if (p2 >= 0) {
        z1 += zs;
        p2 -= 2 * dy;
      }
      p1 += 2 * dx;
      p2 += 2 * dz;
      listOfPoints.push([x1, y1, z1]);
    }
  }

  // Driving axis is Z-axis
  else {
    let p1: number = 2 * dy - dz;
    let p2: number = 2 * dx - dz;
    while (z1 !== z2) {
      z1 += zs;
      if (p1 >= 0) {
        y1 += ys;
        p1 -= 2 * dz;
      }
      if (p2 >= 0) {
        x1 += xs;
        p2 -= 2 * dz;
      }
      p1 += 2 * dy;
      p2 += 2 * dx;
      listOfPoints.push([x1, y1, z1]);
    }
  }

  return listOfPoints;
}

function getPlane(
  topLeft: Array<number>,
  topRight: Array<number>,
  bottomLeft: Array<number>,
  bottomRight: Array<number>
) {
  const firstColumn = bresenham3D(topLeft, bottomLeft);
  const lastColumn = bresenham3D(topRight, bottomRight);
  if (firstColumn.length !== lastColumn.length) {
    // console.log(firstColumn.length, lastColumn.length);
    // throw new Error('Plane not quadrilateral');
    if (firstColumn.length > lastColumn.length) {
      firstColumn.pop();
    } else {
      lastColumn.pop();
    }
  }

  let rows: Array<Array<Array<number>>> = [];
  for (let i = 0; i < firstColumn.length; i++) {
    const startPoint = firstColumn[i];
    const endPoint = lastColumn[i];
    rows.push(bresenham3D(startPoint, endPoint));
  }

  // truncate all rows to shortest length
  const minRowLength = Math.min(...rows.map(r => r.length));
  rows.forEach(row => {
    if (row.length > minRowLength) {
      const numToRemove = row.length - minRowLength;
      row.splice(row.length - numToRemove, numToRemove);
    }
  });

  return rows;
}

function test() {
  for (let i = 0; i < 100; i++) {
    console.log(bresenham3D([-1, 1, i], [5, 3, -1]));
  }
}

export { bresenham3D, getPlane, test };
