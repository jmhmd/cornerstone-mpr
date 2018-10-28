const { getImage } = require('./volume');
const { loadVolume } = require('./load-volume');
const cornerstone = require('cornerstone-core');
const pMap = require('p-map');

const volumeCache: any = {};

function addVolume(volumeId: string, stack: any) {
  const { imageIds }: { imageIds: Array<string> } = stack;
  const volume = {
    stack,
    volumeId,
    data: {},
  };
  volumeCache[volumeId] = volume;

  // load all images
  pMap(imageIds, cornerstone.loadImage, { concurrency: 2 })
    .then((images: any) => {
      volume.data = loadVolume(stack, images);
      console.log(`loaded ${images.length} images`);
      cornerstone.events.dispatchEvent({
        type: `cornerstonemprvolumeready`,
        data: {
          volumeId,
        },
      });
    })
    .catch((err: any) => {
      throw err;
    });

  // function onImageCached(e: any) {
  //   const eventData = e.detail;
  //   const { imageId } = eventData.image;
  //   if (volume.stack.imageIds.includes(imageId)) {
  //     volume.data = loadVolume(stack);
  //   }
  //   if (volume.data.loadComplete) {
  //     cornerstone.events.removeEventListener(`cornerstoneimagecachechanged`, onImageCached);
  //   }
  //   if (volume.data.loadComplete)
  //     cornerstone.events.dispatchEvent({
  //       type: `cornerstonemprvolumeready`,
  //       data: {
  //         volumeId,
  //       },
  //     });
  // }

  // each time an image is loaded, update the volume
  // cornerstone.events.addEventListener(`cornerstoneimagecachechanged`, onImageCached);

  return volume;
}

// Loads an image given an imageId
function loadImage(volumeId: string, opts: any) {
  const volume = volumeCache[volumeId];
  if (!volume) {
    throw new Error('No volume available with that ID. Please add the volume from a stack first.');
  }
  return {
    promise: new Promise((resolve, reject) => {
      if (volume.data.loadComplete) {
        getImage(volume, opts).then((imageData: any) => {
          // const imageData: any = await getData();
          // const pixelData = imageData.pixelData;

          // function getPixelData() {
          //   return imageData.pixelData;
          // }

          // const image = {
          //   getPixelData: getPixelData,
          // };
          // return Object.assign(imageData.image, image);

          return resolve(imageData);
        });
      } else {
        // wait for all images to load
        cornerstone.events.addEventListener(`cornerstonemprvolumeready`, (e: any) => {
          console.log('volume ready');
          if (e.data.volumeId === volumeId) {
            if (!volume.data.loadComplete) return false;
            getImage(volume, opts).then((imageData: any) => {
              return resolve(imageData);
            });
            cornerstone.events.removeEventListener(`cornerstonemprvolumeready`);
          }
        });
      }
    }),
  };
}

export { addVolume, loadImage };
