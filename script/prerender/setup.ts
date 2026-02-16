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
    const fileRegex = path.basename(filename).replace(/\.(\w{3})$/, `\\.\\w{8}\\.$1`);
    const dir = '/static/media';
    const fileNames = fs.readdirSync(path.resolve(__dirname, '../../build' + dir))
      .filter((name) => name.match(new RegExp(fileRegex)));

    /*
     * CRA configures these media files be output with the [hash] token, which is a content
     * hash mixed in with a build id, so they're busted on every build. it may be better to
     * override the config to use [contenthash], but thats not really straightforward even using
     * craco, so we're hacking it here by ignoring the hash. the hack will work as long as we don't
     * have any assets with the same name (that would normally be differentated by the hash), so we
     * bail if that is the case.
     * */
    if (fileNames.length > 1) {
      throw new Error(`more than one file matching ${fileRegex} found in build, can't differentiate them, failing`);
    } else if (fileNames.length > 0) {
      // file exists in build folder, refrence it by url here
      mod.exports = `${process.env.PUBLIC_URL || ''}${dir}/${fileNames[0]}`;
    } else {
      // file doesn't exist in build folder, assume it is an inlined image
      // and inline it again here
      const fileContent = fs.readFileSync(filename);
      // @ts-expect-error getType does not exist on mime
      const mimetype = mime.getType(filename);
      mod.exports = `data:${mimetype || ''};base64,${Buffer.from(fileContent).toString('base64')}`;
    }
  }
});
