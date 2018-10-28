import { getSlabCoordinates } from './get-slab-coordinates';
import { toVector3 } from './convert-to-three-object';
import { draw } from './wireframe';

import { getPlane } from './bresenham';

function get2DPixelsFromMap(volume: any, sliceMap: Array<Array<Array<number>>>) {
  const { xPixelWidth, yPixelWidth, zPixelWidth, minPixelDimension, volumeArray } = volume;
  const pixelLength = sliceMap.reduce((prev, row) => prev + row.length, 0);
  let pixels = new Int16Array(pixelLength);
  let offset = 0;
  for (let i = 0; i < sliceMap.length; i++) {
    const mapRow: Array<Array<number>> = sliceMap[i];
    for (let j = 0; j < mapRow.length; j++) {
      const mapVoxel: Array<number> = mapRow[j];
      const volumeXmm = mapVoxel[0] * minPixelDimension;
      const volumeVoxelX = Math.floor(volumeXmm / xPixelWidth); // maybe should be doing some averaging here?
      const volumeYmm = mapVoxel[1] * minPixelDimension;
      const volumeVoxelY = Math.floor(volumeYmm / yPixelWidth); // maybe should be doing some averaging here?
      const volumeZmm = mapVoxel[2] * minPixelDimension;
      const volumeVoxelZ = Math.floor(volumeZmm / zPixelWidth); // maybe should be doing some averaging here?
      const slabPixel = volumeArray.get(volumeVoxelZ, volumeVoxelX, volumeVoxelY);
      pixels.set([slabPixel], offset);
      offset += 1;
    }
  }
  return pixels;
}

function getPixelSlice(
  planeNormal: Array<number>,
  planeNormalOrigin: Array<number>,
  volume: any,
  dimensions: Array<number>
) {
  const { gridMapDimensions } = volume.data;
  console.time('get-slab-coordinates');

  const sliceBoundingBoxCoordinates = getSlabCoordinates(
    planeNormal,
    planeNormalOrigin,
    gridMapDimensions
  );

  console.timeEnd('get-slab-coordinates');

  /**
   * Use 3D grid where 1 unit = smallest pixel spacing
   */
  console.time('get-plane');

  // bounding box coordinates are counterclockwise? not sure exactly where this orientation is
  // determined.
  const sliceMap = getPlane(
    sliceBoundingBoxCoordinates[0],
    sliceBoundingBoxCoordinates[3],
    sliceBoundingBoxCoordinates[1],
    sliceBoundingBoxCoordinates[2]
  );

  console.timeEnd('get-plane');

  if (dimensions[0]) {
    const maxCols = dimensions[1];
    const maxRows = dimensions[0];
    sliceMap.forEach(row => {
      if (row.length > maxCols) {
        const numToRemove = row.length - maxCols;
        row.splice(row.length - numToRemove, numToRemove);
      }
    });
    if (sliceMap.length > maxRows) {
      const numToRemove = sliceMap.length - maxRows;
      sliceMap.splice(sliceMap.length - numToRemove, numToRemove);
    }
  }

  console.time('get-pixels');

  const pixels = get2DPixelsFromMap(volume.data, sliceMap);

  console.timeEnd('get-pixels');

  return { pixels, sliceMap };
}


async function getImage(volume: any, opts: any) {
  const { planeNormal, planeNormalOrigin } = opts;
  const { gridMapDimensions, minPixelDimension, volumeArray } = volume.data;
  let pixels: Int16Array;
  let sliceMap;

  if (opts.drawBox) {
    draw(gridMapDimensions, toVector3(planeNormal), toVector3(planeNormalOrigin));
  }

  ({ pixels, sliceMap } = getPixelSlice(planeNormal, planeNormalOrigin, volume, []));

  // console.time('construct-array');
  // const pixelData = Int16Array.from(pixels);
  // console.timeEnd('construct-array');
  const image = {
    pixels,
    image: Object.assign(volume.data.firstImage, {
      imageId: Date.now(), // cache bust
      rowPixelSpacing: minPixelDimension,
      columnPixelSpacing: minPixelDimension,
      rows: sliceMap.length,
      columns: sliceMap[0].length,
      height: sliceMap.length,
      width: sliceMap[0].length,
      getPixelData() {
        return pixels;
      },
    }),
    volumeShape: volumeArray.shape,
  };
  return image;
}

export { getImage };
