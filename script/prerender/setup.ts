/*
 * this stuff taken from:
 * https://github.com/cereallarceny/cra-ssr/blob/master/server/index.js
 *
 * and in general a bunch of ssr logic based on:
 * https://github.com/cereallarceny/cra-ssr
 *
 * cra-ssr is deprecated, but i think the only really bad thing is that
 * ignore-styles relies on deprecated nodejs behavior, we should
 * look into other ways do do that import wrangling.
 *
 */
import * as fs from 'fs';
import ignoreStyles, { DEFAULT_EXTENSIONS, noOp } from 'ignore-styles';
import mime from 'mime';
import * as path from 'path';

// We also want to ignore all image requests
// When running locally these will load from a standard import
// When running on the server, we want to load via their hashed version in the build folder
const extensions = ['.gif', '.jpeg', '.jpg', '.png', '.svg'];

// Override the default style ignorer, also modifying all image requests
ignoreStyles(DEFAULT_EXTENSIONS, (mod, filename) => {
  if (!extensions.find((f) => filename.endsWith(f))) {
    // If we find a style
    return noOp();
  } else {
    const bn = path.basename(filename).replace(/(\.\w{3})$/, '');
    const dir = '/static/media';
    // TODO - make this better
    const fileName = fs.readdirSync(path.resolve(__dirname, '../../build' + dir))
      .find((name) => name.indexOf(bn) !== -1);

    if (fileName) {
      // file exists in build folder, refrence it by url here
      mod.exports = `${process.env.PUBLIC_URL || ''}${dir}/${fileName}`;
    } else {
      // file doesn't exist in build folder, assume it is an inlined image
      // and inline it again here
      const fileContent = fs.readFileSync(filename);
      const mimetype = mime.getType(filename);
      mod.exports = `data:${mimetype || ''};base64,${Buffer.from(fileContent).toString('base64')}`;
    }
  }
});
