import { get2dRotationQuaternion } from './get-2d-rotation-quaternion';
import { Vector3 } from 'three';
import { calcOMBB } from './rotating-calipers';

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

  // /**
  //  * Construct simple axis-aligned bounding box in 2d
  //  */
  // const maxX = Math.max(...inPlaneVertices.map(v => v.x));
  // const maxY = Math.max(...inPlaneVertices.map(v => v.y));
  // const minX = Math.min(...inPlaneVertices.map(v => v.x));
  // const minY = Math.min(...inPlaneVertices.map(v => v.y));

  // /**
  //  * Apply common z-axis dimension
  //  */
  // bbVertices = [
  //   new Vector3(minX, minY, inPlaneVertices[0].z),
  //   new Vector3(maxX, minY, inPlaneVertices[0].z),
  //   new Vector3(minX, maxY, inPlaneVertices[0].z),
  //   new Vector3(maxX, maxY, inPlaneVertices[0].z),
  // ];

  /**
   * Rotating calipers algo
   */
  const ombb: Array<Array<number>> = calcOMBB(
    inPlaneVertices.map(v => [v.x, v.y])
  );

  // sort so most negative point is first in counter-clockwise order, as the rotating calipers
  // method of calculating the minimum bounding box rotates our box coordinates to find the best
  // fit. We have to undo this rotation somehow I think.
  const sums: Array<number> = ombb.map(p => p[0] + p[1]);
  const min: number = Math.min(...sums);
  const minIndex: number = sums.indexOf(min);
  const sortedPoints: Array<Array<number>> = [];
  for (let i = 0; i < ombb.length; i += 1) {
    let index = minIndex + i;
    if (index > ombb.length - 1) index = i - (ombb.length - minIndex);
    sortedPoints.push(ombb[index]);
  }
  bbVertices = sortedPoints.map((p: Array<number>) => new Vector3(p[0], p[1], inPlaneVertices[0].z));

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
