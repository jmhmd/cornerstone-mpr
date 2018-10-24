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

async function getImage(volume: any, opts: any) {
  const { planeNormal, planeNormalOrigin } = opts;
  const { gridMapDimensions, minPixelDimension, volumeArray } = volume.data;

  draw(gridMapDimensions, toVector3(planeNormal), toVector3(planeNormalOrigin));

  // console.time('get-slab-coordinates');

  const sliceBoundingBoxCoordinates = getSlabCoordinates(
    planeNormal,
    planeNormalOrigin,
    gridMapDimensions
  );

  // console.timeEnd('get-slab-coordinates');

  /**
   * Use 3D grid where 1 unit = smallest pixel spacing
   */
  console.time('get-plane');

  const sliceMap = getPlane(
    sliceBoundingBoxCoordinates[0], // typescript won't let me use spread operator here
    sliceBoundingBoxCoordinates[1],
    sliceBoundingBoxCoordinates[2],
    sliceBoundingBoxCoordinates[3]
  );

  console.timeEnd('get-plane');

  console.time('get-pixels');

  const pixels = get2DPixelsFromMap(volume.data, sliceMap);

  console.timeEnd('get-pixels');

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
