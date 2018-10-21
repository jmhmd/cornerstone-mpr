import { Vector3 } from 'three';
import { toVector3 } from './convert-to-three-object';

function movePoint(
  original: Vector3 | Array<number>,
  direction: Vector3 | Array<number>,
  distance: number
): Vector3 {
  const originalVec: Vector3 = toVector3(original);
  const directionVec: Vector3 = toVector3(direction);
  const newPos = new Vector3();
  return newPos.addVectors(originalVec, directionVec.normalize().multiplyScalar(distance));
}

export { movePoint };
