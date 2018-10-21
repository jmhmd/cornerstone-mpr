import { Vector3, Line3 } from 'three';

function constructVolumeBoundingBox([x, y, z]: Array<number>): {
  aabb: Array<Array<number>>;
  vertices: Array<Vector3>;
  edges: Array<Line3>;
} {
  const aabb: Array<Array<number>> = [
    // lower box boundary
    [
      0, // x
      0, // y
      0, // z
    ],
    // upper box boundary
    [
      x, // x
      y, // y
      z, // z
    ],
  ];

  const vertices: Array<Vector3> = [
    new Vector3(aabb[0][0], aabb[0][1], aabb[0][2]),
    new Vector3(aabb[1][0], aabb[0][1], aabb[0][2]),
    new Vector3(aabb[1][0], aabb[1][1], aabb[0][2]),
    new Vector3(aabb[0][0], aabb[1][1], aabb[0][2]),
    new Vector3(aabb[0][0], aabb[0][1], aabb[1][2]),
    new Vector3(aabb[1][0], aabb[0][1], aabb[1][2]),
    new Vector3(aabb[1][0], aabb[1][1], aabb[1][2]),
    new Vector3(aabb[0][0], aabb[1][1], aabb[1][2]),
  ];
  const edges: Array<Line3> = [
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

  return {
    aabb,
    vertices,
    edges,
  };
}

export { constructVolumeBoundingBox };
