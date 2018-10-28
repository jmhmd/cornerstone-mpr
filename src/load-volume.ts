const cornerstone = require('cornerstone-core');
// const cornerstoneTools = require('cornerstone-tools');
const ndarray = require('ndarray');

function getImagePositionPatient(dataset: any) {
  return [
    dataset.floatString('x00200032', 0),
    dataset.floatString('x00200032', 1),
    dataset.floatString('x00200032', 2),
  ];
}

function loadVolume(stack: any, images: Array<any>) {
  const { imageIds }: { imageIds: Array<string> } = stack;

  // get whatever is loaded
  // const requestedImages: Array<any> = Object.values(cornerstone.imageCache.cachedImages).filter(
  //   (image: any) => imageIds.includes(image.imageId)
  // );
  // const loadedImages = requestedImages.filter((image: any) => image.loaded);
  // console.log(loadedImages.length, imageIds.length);
  // if (loadedImages.length === 0 || loadedImages.length !== imageIds.length) {
  //   return {
  //     loaded: loadedImages.length,
  //     requested: requestedImages.length,
  //     loadComplete: false,
  //   };
  // }

  const loadedImages = images;

  loadedImages.forEach(
    (image: any) => (image.imagePositionPatient = getImagePositionPatient(image.data))
  );

  // sort by position
  loadedImages.sort((a: any, b: any) => {
    return a.imagePositionPatient[2] - b.imagePositionPatient[2];
  });

  const numSlices = imageIds.length;

  const firstImage = loadedImages[0];
  // const zPositions = loadedImages.map(i => i.imagePositionPatient[2]);
  // const imageSizeInBytes = firstImage.sizeInBytes;

  const xPixelWidth = firstImage.columnPixelSpacing;
  const yPixelWidth = firstImage.rowPixelSpacing;
  const zPixelWidth = firstImage.data.floatString('x00180050'); // Slice Thickness
  const minPixelDimension = Math.min(xPixelWidth, yPixelWidth, zPixelWidth);

  console.log('pixel spacing:', xPixelWidth, yPixelWidth, zPixelWidth);

  console.time('buildvol');
  const volumeArrays: Array<Array<number>> = loadedImages.map((image: any) => {
    // if (image.loaded) {
      return image.getPixelData();
    // }
    // return new Uint16Array(imageSizeInBytes);
  });
  const volumeLength: number = volumeArrays.reduce((p, c) => p + c.length, 0);
  const volumeDataArray: Int16Array = new Int16Array(volumeLength);

  let offset = 0;
  for (let i = 0; i < volumeArrays.length; i++) {
    volumeDataArray.set(volumeArrays[i], offset);
    offset += volumeArrays[i].length;
  }

  const volumeArray = ndarray(volumeDataArray, [
    volumeArrays.length,
    firstImage.rows,
    firstImage.columns,
  ]);
  const columns = volumeArray.shape[2];
  const rows = volumeArray.shape[1];

  const gridMapDimensions = [
    Math.ceil((columns * xPixelWidth) / minPixelDimension),
    Math.ceil((rows * yPixelWidth) / minPixelDimension),
    Math.ceil((numSlices * zPixelWidth) / minPixelDimension),
  ];

  // document.dispatchEvent(new CustomEvent('volume-loaded', { detail: { shape: volume.shape } }));

  console.timeEnd('buildvol');

  console.log(volumeArray);

  return {
    volumeArray,
    columns,
    rows,
    numSlices,
    gridMapDimensions,
    xPixelWidth,
    yPixelWidth,
    zPixelWidth,
    minPixelDimension,
    loaded: loadedImages.length,
    // requested: requestedImages.length,
    // loadComplete: imageIds.length === loadedImages.length,
    loadComplete: true,
    firstImage,
  };
}

export { loadVolume };
