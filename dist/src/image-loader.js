import getData from './slice-image';
// Loads an image given an imageId
function loadImage(imageId, opts) {
    return {
        promise: getData(opts).then((imageData) => {
            // const imageData: any = await getData();
            const width = imageData.columns;
            const height = imageData.rows;
            const pixelData = imageData.pixelData;
            function getPixelData() {
                return pixelData;
            }
            const image = {
                // imageId: imageId,
                getPixelData: getPixelData,
                rows: height,
                columns: width,
                height: height,
                width: width,
                sizeInBytes: width * height * 2,
                volumeShape: imageData.volumeShape,
            };
            return Object.assign(imageData.image, image);
        }),
    };
}
export default loadImage;
//# sourceMappingURL=image-loader.js.map