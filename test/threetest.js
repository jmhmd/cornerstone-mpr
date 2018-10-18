const { Plane, Vector3, Line3, Matrix4, Math: Math3, Box3Helper } = THREE;
const ch = require('convex-hull');
const RotatingCalipers = require('rotating-calipers');

function get2dRotationQuaternion(normal, destNormal = new Vector3(0, 0, 1)) {
  /**
   * Do math I don't understand:
   *
   * https://stackoverflow.com/questions/6264664/transform-3d-points-to-2d
   * and
   * https://stackoverflow.com/questions/19211815/rotating-arbitrary-plane-to-be-z-axis-aligned?rq=1
   */
  const axis = normal
    .clone()
    .normalize()
    .cross(destNormal)
    .normalize();
  const angle = Math.acos(
    normal
      .clone()
      .normalize()
      .dot(destNormal)
  );
  const quat = new THREE.Quaternion().setFromAxisAngle(axis, angle);
  return quat;
}

function getBoundingBox(vertices, normal) {
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
  return rotatedBB;
}

const boundBox = [512, 512, 192];
const aabb = [
  // lower box boundary
  [
    0, // x
    0, // y
    0, // z
  ],
  // upper box boundary
  [
    boundBox[0], // x
    boundBox[1], // y
    boundBox[2], // z
  ],
];

// let planeNormal = new Vector3(0.2, 0.3, 0.2);
let planeNormal = new Vector3(0, 0, 1); // axial orientation
let planeNormalOrigin = new Vector3(100, 100, 100);
let cutPlane = new Plane().setFromNormalAndCoplanarPoint(planeNormal, planeNormalOrigin);

let edges;
let vertices;
let intersections;
let intBB;
let viewPlane;
const canvas = document.getElementById('viewport');

function calculate() {
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

function drawPointBox(scene, points, color = 0xffffff) {
  points.forEach((vertex, i) => {
    const geometry = new THREE.Geometry();
    for (let i = 0; i < points.length; i++) {
      geometry.vertices.push(vertex);
      geometry.vertices.push(points[i]);
      material = new THREE.LineBasicMaterial({ color, linewidth: 5 });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    }
  });
}

var renderer = new THREE.WebGLRenderer({ canvas });
var _width = 800;
var _height = 800;
var camera = new THREE.PerspectiveCamera(
  600, //field of view
  _width / _height, //aspect ratio width/height
  1, //near
  1000 //far
);
camera.position.z = _width;
camera.position.y = -250;
camera.position.x = 250;
camera.lookAt(new Vector3(0, 0, 0));
function draw() {
  /* To display anything, need a scene, a camera, and renderer */
  var scene = new THREE.Scene();

  renderer.setSize(_width, _height);
  document.body.appendChild(renderer.domElement);

  // origin
  let geometry = new THREE.Geometry();
  geometry.vertices.push(vertices[0]);
  material = new THREE.PointsMaterial({ color: 0xffffff, size: 5 });
  scene.add(new THREE.Points(geometry, material));

  edges.forEach(edge => {
    const geometry = new THREE.Geometry();
    geometry.vertices.push(edge.start);
    geometry.vertices.push(edge.end);
    material = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 5 });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
  });

  drawPointBox(scene, intersections);

  // bounding box
  const rect = getBoundingBox(intersections, planeNormal.clone());
  drawPointBox(scene, rect, 0x00ffff);

  // axes

  // x-axis
  geometry = new THREE.Geometry();
  geometry.vertices.push(vertices[0]);
  geometry.vertices.push(vertices[1]);
  material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 10 });
  scene.add(new THREE.Line(geometry, material));

  // y-axis
  geometry = new THREE.Geometry();
  geometry.vertices.push(vertices[0]);
  geometry.vertices.push(vertices[3]);
  material = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 10 });
  scene.add(new THREE.Line(geometry, material));

  // z-axis
  geometry = new THREE.Geometry();
  geometry.vertices.push(vertices[0]);
  geometry.vertices.push(vertices[4]);
  material = new THREE.LineBasicMaterial({ color: 0x0099ff, linewidth: 10 });
  scene.add(new THREE.Line(geometry, material));

  var render = function() {
    renderer.render(scene, camera);
  };

  var animate = function() {
    requestAnimationFrame(animate);
    render();
  };

  animate();
}

calculate();
draw();

function movePoint(original, direction, distance) {
  var newPos = new THREE.Vector3();
  return newPos.addVectors(original, direction.normalize().multiplyScalar(distance));
}

document.getElementById('planex').addEventListener('input', e => {
  const val = parseFloat(e.target.value, 10);
  cutPlane.setComponents(val, cutPlane.normal.y, cutPlane.normal.z, cutPlane.constant);
  calculate();
  draw();
});
document.getElementById('planey').addEventListener('input', e => {
  const val = parseFloat(e.target.value, 10);
  cutPlane.setComponents(cutPlane.normal.x, val, cutPlane.normal.z, cutPlane.constant);
  calculate();
  draw();
});
document.getElementById('planez').addEventListener('input', e => {
  const val = parseFloat(e.target.value, 10);
  cutPlane.setComponents(cutPlane.normal.x, cutPlane.normal.y, val, cutPlane.constant);
  calculate();
  draw();
});
document.getElementById('const').addEventListener('click', e => {
  const val = Math3.degToRad(10);
  planeNormal.applyMatrix4(new Matrix4().makeRotationY(val));

  cutPlane = new Plane().setFromNormalAndCoplanarPoint(planeNormal, planeNormalOrigin);

  calculate();
  draw();
});

document.getElementById('translate').addEventListener('click', e => {
  const val = Math3.degToRad(10);
  planeNormalOrigin = movePoint(planeNormalOrigin, planeNormal, 10);

  cutPlane = new Plane().setFromNormalAndCoplanarPoint(planeNormal, planeNormalOrigin);

  calculate();
  draw();
});

document.getElementById('camera').addEventListener('click', e => {
  const val = Math3.degToRad(20);
  camera.rotation.z += val;
  draw();
});
