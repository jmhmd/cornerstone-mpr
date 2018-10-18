const ndarray = require('ndarray');
const cornerstone = require('cornerstone-core');
const { getPlane } = require('./bresenham');

let volumes: any = {};

let volume: any;
let columns: number;
let rows: number;
let numSlices: number = 192;
let imageObj: any;
let lastImageObj: any;
let xPixelWidth: number;
let yPixelWidth: number;
let zPixelWidth: number;
let minPixelDimension: number;
let gridMapDimensions: Array<number>;

async function loadVolume() {
  console.time('load');
  const imageIds: Array<string> = [];
  for (let i = 1; i < numSlices; i++) {
    // const filename = i < 10 ? `0${i}.dcm` : `${i}.dcm`;
    // imageIds.push(`wadouri:http://localhost:8080/images/ax-lung/${filename}`);
    const filename = i < 10 ? `00${i}.dcm` : i < 100 ? `0${i}.dcm` : `${i}.dcm`;
    imageIds.push(`wadouri:http://localhost:8080/images/t1-brain/${filename}`);
  }
  const images: Array<any> = await Promise.all(imageIds.map(cornerstone.loadImage));

  imageObj = images[0];
  lastImageObj = images[images.length - 1];
  // const sliceThickness: number = Math.floor(imageObj.data.floatString('x00180050')) || 1;
  const firstImagePositionPatient: Array<number> = [
    imageObj.data.floatString('x00200032', 0),
    imageObj.data.floatString('x00200032', 1),
    imageObj.data.floatString('x00200032', 2),
  ];
  const lastImagePositionPatient: Array<number> = [
    lastImageObj.data.floatString('x00200032', 0),
    lastImageObj.data.floatString('x00200032', 1),
    lastImageObj.data.floatString('x00200032', 2),
  ];
  xPixelWidth = imageObj.columnPixelSpacing;
  yPixelWidth = imageObj.rowPixelSpacing;
  zPixelWidth =
    Math.abs(lastImagePositionPatient[2] - firstImagePositionPatient[2]) / images.length;
  minPixelDimension = Math.min(xPixelWidth, yPixelWidth, zPixelWidth);

  console.log(images[0]);
  console.log('pixel spacing:', xPixelWidth, yPixelWidth, zPixelWidth);
  console.timeEnd('load');

  console.time('buildvol');
  const volumeArrays: Array<Array<number>> = images.map(image => image.getPixelData());
  const volumeLength: number = volumeArrays.reduce((p, c) => p + c.length, 0);
  const volumeDataArray: Int16Array = new Int16Array(volumeLength);

  let offset = 0;
  for (let i = 0; i < volumeArrays.length; i++) {
    volumeDataArray.set(volumeArrays[i], offset);
    offset += volumeArrays[i].length;
  }

  volume = ndarray(volumeDataArray, [volumeArrays.length, imageObj.rows, imageObj.columns]);
  columns = volume.shape[2];
  rows = volume.shape[1];

  gridMapDimensions = [
    Math.ceil((columns * xPixelWidth) / minPixelDimension),
    Math.ceil((rows * yPixelWidth) / minPixelDimension),
    Math.ceil((numSlices * zPixelWidth) / minPixelDimension),
  ];

  document.dispatchEvent(new CustomEvent('volume-loaded', { detail: { shape: volume.shape } }));

  console.timeEnd('buildvol');
}

function get2DPixelsFromMap(volume: any, sliceMap: Array<Array<Array<number>>>) {
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
      const slabPixel = volume.get(volumeVoxelZ, volumeVoxelX, volumeVoxelY);
      pixels.push(slabPixel);
    }
  }
  return pixels;
}

async function getData(opts: any) {
  const { slice: oSlice, axis: oAxis } = opts;

  if (!volume) {
    await loadVolume();
  }

  console.time('slice');

  const sliceIndex = oSlice || 0;

  /**
   * Use 3D grid where 1 unit = smallest pixel spacing
   */
  let sliceMap: Array<Array<Array<number>>>;
  const [mapColumns, mapRows, mapSlices] = gridMapDimensions;

  if (oAxis === 'coronal') {
    const unitsPerSlice = gridMapDimensions[1] / rows;
    const mapSlice = sliceIndex * unitsPerSlice;
    sliceMap = getPlane(
      [0, mapSlice, mapSlices - 1],
      [mapColumns - 1, mapSlice, mapSlices - 1],
      [0, mapSlice, 0],
      [mapColumns - 1, mapSlice, 0]
    );
  } else if (oAxis === 'sagittal') {
    const unitsPerSlice = gridMapDimensions[0] / columns;
    const mapSlice = sliceIndex * unitsPerSlice;
    sliceMap = getPlane(
      [mapSlice, mapRows - 1, mapSlices - 1],
      [mapSlice, 0, mapSlices - 1],
      [mapSlice, mapRows - 1, 0],
      [mapSlice, 0, 0]
    );
  } else if (oAxis === 'oblique') {
    const unitsPerSlice = gridMapDimensions[0] / columns;
    const mapSlice = sliceIndex * unitsPerSlice;
    sliceMap = getPlane(
      [0, 0, 190],
      [0, mapRows - 1, 2],
      [mapColumns - 1, 0, 190],
      [mapColumns - 1, mapRows - 1, 2]
    );
  } else {
    // axial
    const unitsPerSlice = gridMapDimensions[2] / numSlices;
    const mapSlice = sliceIndex * unitsPerSlice;
    sliceMap = getPlane(
      [0, 0, mapSlice],
      [mapColumns - 1, 0, mapSlice],
      [0, mapRows - 1, mapSlice],
      [mapColumns - 1, mapRows - 1, mapSlice]
    );
  }

  const pixels = get2DPixelsFromMap(volume, sliceMap);

  console.timeEnd('slice');

  const image = {
    pixelData: Int16Array.from(pixels),
    image: Object.assign(imageObj, {
      imageId: Date.now(), // cache bust
      rowPixelSpacing: minPixelDimension,
      columnPixelSpacing: minPixelDimension,
      rows: sliceMap.length,
      columns: sliceMap[0].length,
      height: sliceMap.length,
      width: sliceMap[0].length,
    }),
    volumeShape: volume.shape,
  };
  console.log(image);
  return image;
}

export default getData;
