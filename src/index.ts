const cornerstone = require('cornerstone-core');
// const cornerstoneTools = require('cornerstone-tools');
const cornerstoneWADOImageLoader = require('cornerstone-wado-image-loader');
const cornerstoneTools = require('cornerstone-tools');
const { loadImage, addVolume } = require('./mpr-image-loader');
const dicomParser = require('dicom-parser');
const studies = require('../images/studies.json');

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
}
const element = document.getElementById('viewport');
let axis = 'axial';
let shape: Array<number>;
let slice: number = 0;

function updateSliceRange() {
  const slider = (<HTMLInputElement>document.getElementById('slice'));
  if (axis === 'axial') {
    slider.max = shape[0].toString();
  } else if (axis === 'coronal') {
    slider.max = shape[1].toString();
  } else if (axis === 'sagittal') {
    slider.max = shape[2].toString();
  }
}

function updateAxis() {
  // axis = (<HTMLInputElement>document.querySelector('input[name="axis"]:checked')).value;
  // updateSliceRange();
  // updateViewport();
}

function updateSlice() {
  slice = parseInt((<HTMLInputElement>document.getElementById('slice')).value, 10) - 1;
  updateViewport([0, 0, 1], [0, 0, slice]);
  document.getElementById('slice-number').innerHTML = (slice + 1).toString();
}

const axisRadios = document.getElementsByName('axis');
for (let i = 0; i < axisRadios.length; i++) {
  axisRadios[i].addEventListener('change', updateAxis);
}
document.getElementById('slice').addEventListener('input', updateSlice);


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
  cornerstone.loadImage(volumeId, {
    planeNormal: [0, 0, 1],
    planeNormalOrigin: [100, 100, 0],
  }).then(function(imageData: any) {
    // console.log(imageData);
    shape = imageData.volumeShape;
    cornerstone.displayImage(element, imageData.image);
  });
}

main();

function updateViewport(planeNormal: Array<number>, planeNormalOrigin: Array<number>) {
  console.time('slicetotal');
  cornerstone.loadImage(volumeId, {
    planeNormal,
    planeNormalOrigin,
  }).then(function(imageData: any) {
    console.timeEnd('slicetotal');
    cornerstone.displayImage(element, imageData.image);
  });
}

document.addEventListener('volume-loaded', (e: CustomEvent) => {
  ({ shape } = e.detail);
  updateSliceRange();
});
