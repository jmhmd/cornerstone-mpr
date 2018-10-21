const { Plane, Vector3, Line3 } = require('three');

let cutPlane = new Plane();

function getViewPlane(volume, planeOrigin, planeNormal) {
  cutPlane.setFromNormalAndCoplanarPoint(planeNormal, planeNormalOrigin);

  const edges;
  const vertices;
  const intersections;

  console.log('plane', cutPlane);
  intersections = [];
  vertices = [
    new Vector3(aabb[0][0], aabb[0][1], aabb[0][2]),
    new Vector3(aabb[1][0], aabb[0][1], aabb[0][2]),
    new Vector3(aabb[1][0], aabb[1][1], aabb[0][2]),
    new Vector3(aabb[0][0], aabb[1][1], aabb[0][2]),
    new Vector3(aabb[0][0], aabb[0][1], aabb[1][2]),
    new Vector3(aabb[1][0], aabb[0][1], aabb[1][2]),
    new Vector3(aabb[1][0], aabb[1][1], aabb[1][2]),
    new Vector3(aabb[0][0], aabb[1][1], aabb[1][2]),
  ];
  edges = [
    new Line3(vertices[0], vertices[1]),
    new Line3(vertices[1], vertices[2]),
    new Line3(vertices[2], vertices[3]),
    new Line3(vertices[3], vertices[0]),
    new Line3(vertices[4], vertices[5]),
    new Line3(vertices[5], vertices[6]),
    new Line3(vertices[6], vertices[7]),
    new Line3(vertices[7], vertices[4]),
    new Line3(vertices[0], vertices[4]),
    new Line3(vertices[1], vertices[5]),
    new Line3(vertices[2], vertices[6]),
    new Line3(vertices[3], vertices[7]),
  ];
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const intersection = cutPlane.intersectLine(edge, new Vector3());
    if (intersection) {
      const exists = intersections.find(i => i.equals(intersection));
      if (!exists) {
        console.log('intersected', i);
        intersections.push(intersection);
      }
    }
  }

  console.log('intersections:', intersections);
}
