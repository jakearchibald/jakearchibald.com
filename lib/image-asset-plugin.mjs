import createAssetPlugin from './create-asset-plugin.mjs';
import imageSize from 'image-size';

export default createAssetPlugin('image-asset-plugin', 'img-url', {
  extraExports(fileBuffer) {
    const size = imageSize(fileBuffer);
    return [
      `export const width = ${size.width};`,
      `export const height = ${size.height};`,
    ].join('\n');
  },
});
