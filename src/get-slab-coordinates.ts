import { Vector3, Plane, Line3 } from 'three';
import { get3dCoplanarBoundingBox } from './get-3d-coplanar-bounding-box';
import { constructVolumeBoundingBox } from './construct-volume-bounding-box';
import { toVector3 } from './convert-to-three-object';

function getSlabCoordinates(
  planeNormal: Array<number> | Vector3 = [0, 0, 1], // axial
  planeNormalOrigin: Array<number> | Vector3, // 3d point [x, y, z]
  volumeDimensions: Array<number> = [0, 0, 0] // x, y, z dimensions
) {
  const planeNormalVec: Vector3 = toVector3(planeNormal);
  if (!planeNormalOrigin) {
    planeNormalOrigin = new Vector3(volumeDimensions[0] / 2, volumeDimensions[1] / 2, 0); // center of axial plane
  }
  const planeNormalOriginVec: Vector3 = toVector3(planeNormalOrigin);
  const cutPlane: Plane = new Plane().setFromNormalAndCoplanarPoint(
    planeNormalVec,
    planeNormalOriginVec
  );
  const { edges }: { edges: Array<Line3> } = constructVolumeBoundingBox(volumeDimensions);
  const intersections: Array<any> = [];

  for (let i = 0; i < edges.length; i++) {
    const edge: Line3 = edges[i];
    const intersection: Vector3 = cutPlane.intersectLine(edge, new Vector3());
    if (intersection) {
      const exists = intersections.find(i => i.equals(intersection));
      if (!exists) {
        // console.log('intersected', i);
        intersections.push(intersection);
      }
    }
  }

  return get3dCoplanarBoundingBox(intersections, planeNormalVec.clone());
}

export { getSlabCoordinates };
