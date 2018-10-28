const cornerstone = require('cornerstone-core');
// const cornerstoneTools = require('cornerstone-tools');
const cornerstoneWADOImageLoader = require('cornerstone-wado-image-loader');
const cornerstoneTools = require('cornerstone-tools');
const { loadImage, addVolume } = require('./mpr-image-loader');
const dicomParser = require('dicom-parser');
const studies = require('../images/studies.json');
import { movePoint } from './move-point-along-vector';
import { degToRad, radToDeg } from './deg-rad';
import { toVector3 } from './convert-to-three-object';
import { Vector3, Quaternion, Euler } from 'three';

cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneTools.external.cornerstone = cornerstone;

var config = {
  webWorkerPath:
    'lib/cornerstoneWADOImageLoaderWebWorker.js',
  taskConfiguration: {
    decodeTask: {
      codecsPath: 'cornerstoneWADOImageLoaderCodecs.js',
    },
  },
};

cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
console.log('wadoimageloader:', cornerstoneWADOImageLoader);
console.log('cornerstone:', cornerstone);
console.log('cornerstoneTools:', cornerstoneTools);

const volumeId = 'mprLoader:t1-brain';
const imageIds: Array<string> = studies['t1-brain'];
const imageRoot = location.origin + location.pathname;
imageIds.forEach(id => imageRoot + id);
const stack = {
  volumeId,
  currentImageIdIndex: 0,
  imageIds,
};
const element = document.getElementById('viewport');
let planeNormal: Array<number> = [
  Math.cos(degToRad(88)),
  Math.cos(degToRad(90)),
  Math.cos(degToRad(0)),
];
let planeNormalOrigin: Array<number> = [512 / 2, 512 / 2, 100];

function translateSlice(direction: number) {
  const distance = 1;
  const newOrigin = movePoint(planeNormalOrigin, planeNormal, direction * distance);
  planeNormalOrigin = [newOrigin.x, newOrigin.y, newOrigin.z];
  updateViewport(planeNormal, planeNormalOrigin);
}
document.getElementById('move-pos').addEventListener('click', () => translateSlice(1));
document.getElementById('move-neg').addEventListener('click', () => translateSlice(-1));

function setAxis([x, y, z]: [number, number, number]) {
  const deltaRotationQuaternion = new Quaternion().setFromEuler(
    new Euler(degToRad(y * 1), degToRad(x * 1), degToRad(z * 1), 'XYZ')
  );

  const planeNormalVec = toVector3(planeNormal);
  planeNormalVec.applyQuaternion(deltaRotationQuaternion);
  planeNormal = [planeNormalVec.x, planeNormalVec.y, planeNormalVec.z];
  updateViewport(planeNormal, planeNormalOrigin);
}
let currentDegrees = [radToDeg(planeNormal[0]), radToDeg(planeNormal[1]), radToDeg(planeNormal[2])];
document.getElementById('x-axis').addEventListener('input', (e: Event) => {
  const degrees = parseInt((<HTMLInputElement>e.target).value, 10);
  const degToMove = degrees - currentDegrees[0];
  setAxis([degToMove, 0, 0]);
  currentDegrees[0] = degrees;
  document.getElementById('x-axis-label').innerHTML = degrees.toString();
});
document.getElementById('y-axis').addEventListener('input', (e: Event) => {
  const degrees = parseInt((<HTMLInputElement>e.target).value, 10);
  const degToMove = degrees - currentDegrees[1];
  setAxis([0, degToMove, 0]);
  currentDegrees[1] = degrees;
  document.getElementById('y-axis-label').innerHTML = degrees.toString();
});
document.getElementById('z-axis').addEventListener('input', (e: Event) => {
  const degrees = parseInt((<HTMLInputElement>e.target).value, 10);
  const degToMove = degrees - currentDegrees[2];
  setAxis([0, 0, degToMove]);
  currentDegrees[2] = degrees;
  document.getElementById('z-axis-label').innerHTML = degrees.toString();
});

function main() {
  cornerstone.registerImageLoader('mprLoader', loadImage);
  addVolume('mprLoader:t1-brain', stack);
  // image enable the element
  cornerstone.enable(element);
  // cornerstoneTools.mouseInput.enable(element);
  // cornerstoneTools.mouseWheelInput.enable(element);
  cornerstoneTools.addStackStateManager(element, ['stack']);
  cornerstoneTools.addToolState(element, 'stack', stack);
  // cornerstoneTools.stackPrefetch.enable(element);

  // load the image and display it
  cornerstone
    .loadImage(volumeId, {
      planeNormal,
      planeNormalOrigin,
      drawBox: (<HTMLInputElement>document.getElementById('draw-box')).checked,
    })
    .then(function(imageData: any) {
      // console.log(imageData);
      cornerstone.displayImage(element, imageData.image);
    });
}

main();

function updateViewport(planeNormal: Array<number>, planeNormalOrigin: Array<number>) {
  console.time('slicetotal');
  cornerstone
    .loadImage(volumeId, {
      planeNormal,
      planeNormalOrigin,
      drawBox: (<HTMLInputElement>document.getElementById('draw-box')).checked,
    })
    .then(function(imageData: any) {
      console.timeEnd('slicetotal');
      cornerstone.displayImage(element, imageData.image);
    });
}

// setInterval(() => {
//   const newPlaneNormal: Vector3 = toVector3(planeNormal);
//   newPlaneNormal.applyAxisAngle(new Vector3(1, 0, 0), degToRad(10));
//   planeNormal = [newPlaneNormal.x, newPlaneNormal.y, newPlaneNormal.z];
//   updateViewport(planeNormal, planeNormalOrigin);
// }, 200);
