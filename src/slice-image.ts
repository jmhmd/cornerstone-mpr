const ndarray = require('ndarray');
const cornerstone = require('cornerstone-core');
const show = require('ndarray-show');

let volume: any;
let imageObj: any;
let numSlices: number = 29;

async function getData(opts: any) {
  if (!volume) {
    console.time('load');
    const imageIds: Array<string> = [];
    for (let i = 1; i < numSlices; i++) {
      const filename = i < 10 ? `0${i}.dcm` : `${i}.dcm`;
      imageIds.push(`wadouri:http://localhost:8080/images/ax-lung/${filename}`);
    }
    const images: Array<any> = await Promise.all(imageIds.map(cornerstone.loadImage));

    imageObj = images[0];
    const sliceThickness: number = Math.floor(imageObj.data.floatString('x00180050')) || 1;
    numSlices = numSlices * sliceThickness;

    console.log(images[0]);
    console.timeEnd('load');

    console.time('buildvol');
    const volumeArrays: Array<Array<number>> = images.map(image => image.getPixelData());
    const volumeLength: number = volumeArrays.reduce((p, c) => p + c.length, 0);
    const volumeDataArray: Int16Array = new Int16Array(volumeLength * sliceThickness);

    let offset = 0;
    for (let i = 0; i < volumeArrays.length; i++) {
      for (let j = 0; j < sliceThickness; j++) {
        volumeDataArray.set(volumeArrays[i], offset);
        offset += volumeArrays[i].length;
      }
    }

    volume = ndarray(volumeDataArray, [numSlices, imageObj.rows, imageObj.columns]);

    document.dispatchEvent(new CustomEvent('volume-loaded', { detail: { shape: volume.shape } }));

    console.timeEnd('buildvol');
  }

  console.time('slice');

  const sliceIndex = opts.slice || 0;

  let slice;
  if (opts.axis === 'coronal') {
    slice = volume.pick(null, sliceIndex, null);
  } else if (opts.axis === 'sagittal') {
    slice = volume.pick(null, null, sliceIndex);
  } else {
    // axial
    slice = volume.pick(sliceIndex, null, null);
  }

  const pixels = [];
  for (var row = 0; row < slice.shape[0]; row++) {
    for (var col = 0; col < slice.shape[1]; col++) {
      pixels.push(slice.get(row, col));
    }
  }

  console.timeEnd('slice');
  console.log(slice);

  return {
    pixelData: Int16Array.from(pixels),
    min: imageObj.minPixelValue,
    max: imageObj.maxPixelValue,
    rows: slice.shape[0],
    columns: slice.shape[1],
    image: Object.assign(imageObj, {
      imageId: Date.now(), // cache bust
    }),
    volumeShape: volume.shape,
  };
}

export default getData;
