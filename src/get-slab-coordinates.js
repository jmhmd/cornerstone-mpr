const { Vector3 } = require('three');
const { get3dCoplanarBoundingBox } = require('./get-3d-coplanar-bounding-box');
const { constructVolumeBoundingBox } = require('./construct-volume-bounding-box');

function getSlabCoordinates(
  planeNormal = [0, 0, 1], // axial
  planeNormalOrigin, // 3d point [x, y, z]
  volumeDimensions = { x: 0, y: 0, z: 0 }
) {
  if (!planeNormal.isVector3) {
    planeNormal = new Vector3(...planeNormal);
  }
  if (!planeNormalOrigin) {
    planeNormalOrigin = new Vector3(volumeDimensions.x / 2, volumeDimensions.y / 2, 0); // center of axial plane
  } else if (!planeNormalOrigin.isVector3) {
    planeNormalOrigin = new Vector3(...planeNormalOrigin);
  }
  const cutPlane = new Plane().setFromNormalAndCoplanarPoint(planeNormal, planeNormalOrigin);
  const { edges } = constructVolumeBoundingBox(volumeDimensions);
  const intersections = [];

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const intersection = cutPlane.intersectLine(edge, new Vector3());
    if (intersection) {
      const exists = intersections.find(i => i.equals(intersection));
      if (!exists) {
        // console.log('intersected', i);
        intersections.push(intersection);
      }
    }
  }

  return get3dCoplanarBoundingBox(intersections, planeNormal.clone());
}

export { getSlabCoordinates };
