const { bresenham3D } = require('./bresenham');
const boxDim = [100, 100, 100];
/**
 * top-left = 0, 0, 0 bottom right = 99, 99, 99
 */
// (top-left, top-right, bottom-left, bottom-right)
// coronal plane, middle:
// const plane = [[0, 50, 0], [99, 50, 0], [0, 50, 99], [99, 50, 99]];
// oblique plane:
const plane = [[0, 0, 0], [99, 99, 0], [0, 0, 99], [99, 99, 99]];
function main() {
    console.time('slice');
    const topRay = bresenham3D(plane[0], plane[1]);
    const bottomRay = bresenham3D(plane[2], plane[3]);
    if (topRay.length !== bottomRay.length)
        throw new Error('Plane not quadrilateral');
    let columns = [];
    for (let i = 0; i < topRay.length; i++) {
        const startPoint = topRay[i];
        const endPoint = bottomRay[i];
        columns.push(bresenham3D(startPoint, endPoint));
    }
    console.timeEnd('slice');
    console.log(columns.length);
}
main();
//# sourceMappingURL=boxtest.js.map