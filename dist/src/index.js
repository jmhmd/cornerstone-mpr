// import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
// import * as cornerstone from 'cornerstone-core';
const cornerstone = require('cornerstone-core');
const cornerstoneWADOImageLoader = require('cornerstone-wado-image-loader');
import loadImage from './image-loader';
const dicomParser = require('dicom-parser');
// const fs = require('fs');
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
var config = {
    webWorkerPath: 'node_modules/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderWebWorker.js',
    taskConfiguration: {
        decodeTask: {
            codecsPath: '../dist/cornerstoneWADOImageLoaderCodecs.js',
        },
    },
};
cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
console.log(cornerstoneWADOImageLoader);
const imageId = 'viewLoader://volume-1';
const element = document.getElementById('viewport');
let axis = 'axial';
let shape;
let slice = 0;
document.addEventListener('volume-loaded', (e) => {
    ({ shape } = e.detail);
    updateSliceRange();
});
function updateSliceRange() {
    const slider = document.getElementById('slice');
    if (axis === 'axial') {
        slider.max = shape[0].toString();
    }
    else if (axis === 'coronal') {
        slider.max = shape[1].toString();
    }
    else if (axis === 'sagittal') {
        slider.max = shape[2].toString();
    }
}
function updateAxis() {
    axis = document.querySelector('input[name="axis"]:checked').value;
    updateSliceRange();
    updateViewport();
}
function updateSlice() {
    slice = parseInt(document.getElementById('slice').value, 10) - 1;
    updateViewport();
    document.getElementById('slice-number').innerHTML = (slice + 1).toString();
}
const axisRadios = document.getElementsByName('axis');
for (let i = 0; i < axisRadios.length; i++) {
    axisRadios[i].addEventListener('change', updateAxis);
}
document.getElementById('slice').addEventListener('input', updateSlice);
function main() {
    cornerstone.registerImageLoader('viewLoader', loadImage);
    // image enable the element
    cornerstone.enable(element);
    // load the image and display it
    cornerstone.loadImage(imageId, {
        plane: 'axial',
        slice: 0,
    }).then(function (image) {
        console.log(image);
        cornerstone.displayImage(element, image);
    });
}
main();
function updateViewport() {
    cornerstone.loadImage(imageId, {
        axis,
        slice,
    }).then(function (image) {
        console.log(image);
        cornerstone.displayImage(element, image);
    });
}
console.log(updateViewport);
//# sourceMappingURL=index.js.map