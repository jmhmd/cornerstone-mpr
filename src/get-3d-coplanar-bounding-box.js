const { get2dRotationQuaternion } = require('./get-2d-rotation-quaternion');
const { Vector3 } = require('three');
const RotatingCalipers = require('rotating-calipers');
const { get2dRotationQuaternion } = require('./get-2d-rotation-quaternion');

function get3dCoplanarBoundingBox(vertices, normal) {
  /**
   * Get rotation quaternion that will transform points to be coplanar to an axis (z)
   */
  const rotationQuaternion = get2dRotationQuaternion(normal, new Vector3(0, 0, 1));
  const inPlaneVertices = [];
  vertices.forEach(i => {
    inPlaneVertices.push(i.clone().applyQuaternion(rotationQuaternion));
  });

  /**
   * Simple axis-aligned bounding box
   */
  // const maxX = Math.max(...inPlaneVertices.map(v => v.x));
  // const maxY = Math.max(...inPlaneVertices.map(v => v.y));
  // const minX = Math.min(...inPlaneVertices.map(v => v.x));
  // const minY = Math.min(...inPlaneVertices.map(v => v.y));
  // const bbVertices = [
  //   new Vector3(maxX, maxY, inPlaneVertices[0].z),
  //   new Vector3(maxX, minY, inPlaneVertices[0].z),
  //   new Vector3(minX, minY, inPlaneVertices[0].z),
  //   new Vector3(minX, maxY, inPlaneVertices[0].z),
  // ];

  /**
   * Convex hull with rotating calipers (fancy!)
   */
  var solver = new RotatingCalipers(inPlaneVertices.map(v => [v.x, v.y]));
  var bbVertices = solver
    .minAreaEnclosingRectangle()
    .vertices.map(v => new Vector3(...v, inPlaneVertices[0].z));

  /**
   * Rotate bounding box points back to original plane
   */
  const rotatedBB = [];
  bbVertices.forEach(v => {
    rotatedBB.push(v.clone().applyQuaternion(rotationQuaternion.clone().inverse()));
  });
  return rotatedBB.map(vector => [vector.x, vector.y, vector.z]);
}

export { get3dCoplanarBoundingBox };
