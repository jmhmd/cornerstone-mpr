const RotatingCalipers = require('rotating-calipers');

const inPlaneVertices = [[1, 512], [1, 1], [512, 1], [512, 512]];

var solver = new RotatingCalipers(inPlaneVertices);
var bbVertices = solver
  .convexHull()
var vertices = solver.minAreaEnclosingRectangle()
  .vertices
  // .vertices.map(v => new Vector3(...v, inPlaneVertices[0].z));

console.log('bb vertices', vertices);
