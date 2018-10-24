import * as THREE from 'three';
import { get3dCoplanarBoundingBox } from './get-3d-coplanar-bounding-box';
import { constructVolumeBoundingBox } from './construct-volume-bounding-box';
import { getPlaneBoxIntersections } from './get-slab-coordinates';
import { toVector3 } from './convert-to-three-object';

const canvas = document.getElementById('wireframe');

const renderer = new THREE.WebGLRenderer({ canvas });
const _width = 512;
const _height = 512;
const camera = new THREE.PerspectiveCamera(
  600, //field of view
  _width / _height, //aspect ratio width/height
  1, //near
  900 //far
);
camera.position.z = 700;
camera.position.y = -50;
camera.position.x = 250;
camera.lookAt(new THREE.Vector3(_width/2, _height/2, 0));
renderer.setSize(_width, _height);
document.body.appendChild(renderer.domElement);

function drawPointBox(scene, points, color = 0xffffff) {
  points.forEach((vertex, i) => {
    const geometry = new THREE.Geometry();
    for (let i = 0; i < points.length; i++) {
      geometry.vertices.push(vertex);
      geometry.vertices.push(points[i]);
      const material = new THREE.LineBasicMaterial({ color, linewidth: 5 });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    }
  });
}

function draw(boxDimensions, planeNormal, planeOrigin) {

  const cutPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
    planeNormal,
    planeOrigin
  );
  const { edges, vertices } = constructVolumeBoundingBox(boxDimensions);
  const intersections = getPlaneBoxIntersections(edges, cutPlane);
  const boundingBox = get3dCoplanarBoundingBox(intersections, planeNormal.clone());

  /* To display anything, need a scene, a camera, and renderer */
  const scene = new THREE.Scene();

  // origin
  let geometry = new THREE.Geometry();
  let material;
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
  drawPointBox(scene, boundingBox.map(toVector3), 0x00ffff);

  // plane normal
  const arrow = new THREE.ArrowHelper(planeNormal, planeOrigin, 300);
  scene.add(arrow);

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

export { draw };
