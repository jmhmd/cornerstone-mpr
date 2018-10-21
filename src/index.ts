const cornerstone = require('cornerstone-core');
// const cornerstoneTools = require('cornerstone-tools');
const cornerstoneWADOImageLoader = require('cornerstone-wado-image-loader');
const cornerstoneTools = require('cornerstone-tools');
const { loadImage, addVolume } = require('./mpr-image-loader');
const dicomParser = require('dicom-parser');
const studies = require('../images/studies.json');
import { movePoint } from './move-point-along-vector';
import { degToRad } from './deg-rad';

cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneTools.external.cornerstone = cornerstone;

var config = {
  webWorkerPath:
    'node_modules/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderWebWorker.js',
  taskConfiguration: {
    decodeTask: {
      codecsPath: '../dist/cornerstoneWADOImageLoaderCodecs.js',
    },
  },
};

cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
console.log('wadoimageloader:', cornerstoneWADOImageLoader);
console.log('cornerstone:', cornerstone);
console.log('cornerstoneTools:', cornerstoneTools);

const volumeId = 'mprLoader:t1-brain';
const imageIds = studies['t1-brain'];
const stack = {
  volumeId,
  currentImageIdIndex: 0,
  imageIds,
};
const element = document.getElementById('viewport');
let planeNormal: Array<number> = [0, 0, 1];
let planeNormalOrigin: Array<number> = [512 / 2, 512 / 2, 100];

// function updateSliceRange() {
//   const slider = (<HTMLInputElement>document.getElementById('slice'));
//   if (axis === 'axial') {
//     slider.max = shape[0].toString();
//   } else if (axis === 'coronal') {
//     slider.max = shape[1].toString();
//   } else if (axis === 'sagittal') {
//     slider.max = shape[2].toString();
//   }
// }

// function updateSlice() {
//   slice = parseInt((<HTMLInputElement>document.getElementById('slice')).value, 10) - 1;
//   updateViewport([0, 0, 1], [0, 0, slice]);
//   document.getElementById('slice-number').innerHTML = (slice + 1).toString();
// }
// document.getElementById('slice').addEventListener('input', updateSlice);

function translateSlice(direction: number) {
  const distance = 1;
  const newOrigin = movePoint(planeNormalOrigin, planeNormal, direction * distance);
  planeNormalOrigin = [newOrigin.x, newOrigin.y, newOrigin.z];
  updateViewport(planeNormal, planeNormalOrigin);
}
document.getElementById('move-pos').addEventListener('click', () => translateSlice(1));
document.getElementById('move-neg').addEventListener('click', () => translateSlice(-1));

function setAxis(axis: string, degrees: number) {
  const radians: number = degToRad(degrees);
  if (axis === 'x') {
    planeNormal[0] = radians;
  }
  if (axis === 'y') {
    planeNormal[1] = radians;
  }
  if (axis === 'z') {
    planeNormal[2] = radians;
  }
  updateViewport(planeNormal, planeNormalOrigin);
}
document.getElementById('x-axis').addEventListener('input', (e: Event) => {
  const degrees = parseInt((<HTMLInputElement>event.target).value, 10);
  setAxis('x', degrees);
  document.getElementById('x-axis-label').innerHTML = degrees.toString();
});
document.getElementById('y-axis').addEventListener('input', (e: Event) => {
  const degrees = parseInt((<HTMLInputElement>event.target).value, 10);
  setAxis('y', degrees);
  document.getElementById('y-axis-label').innerHTML = degrees.toString();
});
document.getElementById('z-axis').addEventListener('input', (e: Event) => {
  const degrees = parseInt((<HTMLInputElement>event.target).value, 10);
  setAxis('z', degrees);
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
    })
    .then(function(imageData: any) {
      // console.log(imageData);
      cornerstone.displayImage(element, imageData.image);
    });
}

main();

function updateViewport(planeNormal: Array<number>, planeNormalOrigin: Array<number>) {
  // console.time('slicetotal');
  cornerstone
    .loadImage(volumeId, {
      planeNormal,
      planeNormalOrigin,
    })
    .then(function(imageData: any) {
      // console.timeEnd('slicetotal');
      cornerstone.displayImage(element, imageData.image);
    });
}

// document.addEventListener('volume-loaded', (e: CustomEvent) => {
//   // updateSliceRange();
// });
