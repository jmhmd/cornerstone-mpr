import { get2dRotationQuaternion } from './get-2d-rotation-quaternion';
import { Vector3 } from 'three';
// const RotatingCalipers = require('rotating-calipers');

function get3dCoplanarBoundingBox(vertices: Array<Vector3>, normal: Vector3): Array<Array<number>> {
  /**
   * Get rotation quaternion that will transform points to be coplanar to an axis (z)
   */
  const rotationQuaternion = get2dRotationQuaternion(normal, new Vector3(0, 0, 1));
  const inPlaneVertices: Array<Vector3> = [];
  let bbVertices: Array<Vector3>;

  /**
   * Rotate given 3d coplanar vertices to z-plane
   */
  vertices.forEach(i => {
    inPlaneVertices.push(i.clone().applyQuaternion(rotationQuaternion));
  });

  /**
   * Construct simple axis-aligned bounding box in 2d
   */
  const maxX = Math.max(...inPlaneVertices.map(v => v.x));
  const maxY = Math.max(...inPlaneVertices.map(v => v.y));
  const minX = Math.min(...inPlaneVertices.map(v => v.x));
  const minY = Math.min(...inPlaneVertices.map(v => v.y));

  /**
   * Apply common z-axis dimension
   */
  bbVertices = [
    new Vector3(minX, minY, inPlaneVertices[0].z),
    new Vector3(maxX, minY, inPlaneVertices[0].z),
    new Vector3(minX, maxY, inPlaneVertices[0].z),
    new Vector3(maxX, maxY, inPlaneVertices[0].z),
  ];

  /**
   * Convex hull with rotating calipers (fancy!)
   */
  // var solver = new RotatingCalipers(inPlaneVertices.map(v => [v.x, v.y]));
  // solver.convexHull();
  // var bbVertices = solver
  //   .minAreaEnclosingRectangle()
  //   .vertices.map(v => new Vector3(...v, inPlaneVertices[0].z));

  /**
   * Rotate bounding box points back to original plane
   */
  const rotatedBB: Array<Vector3> = [];
  bbVertices.forEach(v => {
    rotatedBB.push(v.clone().applyQuaternion(rotationQuaternion.clone().inverse()));
  });
  return rotatedBB.map(vector => [vector.x, vector.y, vector.z]);
}

export { get3dCoplanarBoundingBox };
