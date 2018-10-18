import { getSlabCoordinates } from "./get-slab-coordinates";

const { getPlane } = require('./bresenham');

function get2DPixelsFromMap(volume: any, sliceMap: Array<Array<Array<number>>>) {
  const { xPixelWidth, yPixelWidth, zPixelWidth, minPixelDimension, volumeArray } = volume;
  let pixels = [];
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
      pixels.push(slabPixel);
    }
  }
  return pixels;
}

async function getImage(volume: any, opts: any) {
  const { planeNormal, planeNormalOrigin } = opts;
  const {
    gridMapDimensions,
    rows,
    columns,
    numSlices,
    minPixelDimension,
    volumeArray,
  } = volume.data;

  const sliceBoundingBoxCoordinates = getSlabCoordinates(planeNormal, planeNormalOrigin, gridMapDimensions);

  /**
   * Use 3D grid where 1 unit = smallest pixel spacing
   */
  const sliceMap = getPlane(...sliceBoundingBoxCoordinates);
  // let sliceMap: Array<Array<Array<number>>>;
  // const [mapColumns, mapRows, mapSlices] = gridMapDimensions;

  // if (oAxis === 'coronal') {
  //   const unitsPerSlice = gridMapDimensions[1] / rows;
  //   const mapSlice = sliceIndex * unitsPerSlice;
  //   sliceMap = getPlane(
  //     [0, mapSlice, mapSlices - 1],
  //     [mapColumns - 1, mapSlice, mapSlices - 1],
  //     [0, mapSlice, 0],
  //     [mapColumns - 1, mapSlice, 0]
  //   );
  // } else if (oAxis === 'sagittal') {
  //   const unitsPerSlice = gridMapDimensions[0] / columns;
  //   const mapSlice = sliceIndex * unitsPerSlice;
  //   sliceMap = getPlane(
  //     [mapSlice, mapRows - 1, mapSlices - 1],
  //     [mapSlice, 0, mapSlices - 1],
  //     [mapSlice, mapRows - 1, 0],
  //     [mapSlice, 0, 0]
  //   );
  // } else if (oAxis === 'oblique') {
  //   const unitsPerSlice = gridMapDimensions[0] / columns;
  //   const mapSlice = sliceIndex * unitsPerSlice;
  //   sliceMap = getPlane(
  //     [0, 0, 190],
  //     [0, mapRows - 1, 2],
  //     [mapColumns - 1, 0, 190],
  //     [mapColumns - 1, mapRows - 1, 2]
  //   );
  // } else {
  //   // axial
  //   const unitsPerSlice = gridMapDimensions[2] / numSlices;
  //   const mapSlice = sliceIndex * unitsPerSlice;
  //   sliceMap = getPlane(
  //     [0, 0, mapSlice],
  //     [mapColumns - 1, 0, mapSlice],
  //     [0, mapRows - 1, mapSlice],
  //     [mapColumns - 1, mapRows - 1, mapSlice]
  //   );
  // }

  const pixels = get2DPixelsFromMap(volume.data, sliceMap);

  const pixelData = Int16Array.from(pixels);
  const image = {
    pixelData,
    image: Object.assign(volume.data.firstImage, {
      imageId: Date.now(), // cache bust
      rowPixelSpacing: minPixelDimension,
      columnPixelSpacing: minPixelDimension,
      rows: sliceMap.length,
      columns: sliceMap[0].length,
      height: sliceMap.length,
      width: sliceMap[0].length,
      getPixelData() {
        return pixelData;
      },
    }),
    volumeShape: volumeArray.shape,
  };
  return image;
}

export { getImage };
