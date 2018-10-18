// import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
// import * as cornerstone from 'cornerstone-core';
var cornerstone = require('cornerstone-core');
// const cornerstoneTools = require('cornerstone-tools');
var cornerstoneWADOImageLoader = require('cornerstone-wado-image-loader');
var cornerstoneTools = require('cornerstone-tools');
var _a = require('./mpr-image-loader'), loadImage = _a.loadImage, addVolume = _a.addVolume;
var dicomParser = require('dicom-parser');
var studies = require('../images/studies.json');
// const fs = require('fs');
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneTools.external.cornerstone = cornerstone;
var config = {
    webWorkerPath: 'node_modules/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderWebWorker.js',
    taskConfiguration: {
        decodeTask: {
            codecsPath: '../dist/cornerstoneWADOImageLoaderCodecs.js'
        }
    }
};
cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
console.log('wadoimageloader:', cornerstoneWADOImageLoader);
console.log('cornerstone:', cornerstone);
console.log('cornerstoneTools:', cornerstoneTools);
var volumeId = 'mprLoader:t1-brain';
var imageIds = studies['t1-brain'];
var stack = {
    volumeId: volumeId,
    currentImageIdIndex: 0,
    imageIds: imageIds
};
var element = document.getElementById('viewport');
var axis = 'axial';
var shape;
var slice = 0;
function updateSliceRange() {
    var slider = document.getElementById('slice');
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
var axisRadios = document.getElementsByName('axis');
for (var i = 0; i < axisRadios.length; i++) {
    axisRadios[i].addEventListener('change', updateAxis);
}
document.getElementById('slice').addEventListener('input', updateSlice);
function main() {
    cornerstone.registerImageLoader('mprLoader', loadImage);
    // image enable the element
    cornerstone.enable(element);
    cornerstoneTools.mouseInput.enable(element);
    cornerstoneTools.mouseWheelInput.enable(element);
    cornerstoneTools.addStackStateManager(element, ['stack']);
    cornerstoneTools.addToolState(element, 'stack', stack);
    cornerstoneTools.stackPrefetch.enable(element);
    addVolume('mprLoader:t1-brain', stack);
    // load the image and display it
    cornerstone.loadImage(volumeId, {
        stack: stack,
        plane: 'axial',
        slice: 0
    }).then(function (image) {
        console.log(image);
        cornerstone.displayImage(element, image);
    });
}
main();
function updateViewport() {
    cornerstone.loadImage(volumeId, {
        axis: axis,
        slice: slice
    }).then(function (image) {
        console.log(image);
        cornerstone.displayImage(element, image);
    });
}
document.addEventListener('volume-loaded', function (e) {
    (shape = e.detail.shape);
    updateSliceRange();
});
