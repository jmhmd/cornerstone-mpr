const { Box3, Plane, Vector3, Line3 } = require('three');
const boundBox = new Box3(new Vector3(0, 0, 0), new Vector3(20, 20, 20));
const imageData = new Int16Array(8000);
let color = 0;
let offset = 0;
for (let i = 0; i < 20; i++) {
    if (i % 2 === 0)
        color = 255;
    for (let index = 0; index < 400; index++) {
        imageData.set([color], offset);
        offset += 1;
    }
}
const cutPlane = new Plane(new Vector3(1, 1, 0), 0);
const startPoint = new Vector3(0, 0, 0);
const startPlanePoint = new Vector3();
cutPlane.projectPoint(startPoint, startPlanePoint);
console.log(startPlanePoint);
// const vtkImageReslice = require('vtk.js/Sources/Imaging/Core/ImageReslice');
// const vtkImageData = require('vtk.js/Sources/Common/DataModel/ImageData');
// const imageReslice = vtkImageReslice.newInstance();
// imageReslice.setInputData(imageData);
// imageReslice.setOutputDimensionality(2);
// const axes = mat4.create();
// mat4.rotateX(axes, axes, 45 * Math.PI / 180);
// imageReslice.setResliceAxes(axes);
// imageReslice.setOutputScalarType('Uint16Array');
// imageReslice.setScalarScale(65535 / 255);
// const obliqueSlice = imageReslice.getOutputData();
//# sourceMappingURL=threetest.js.map