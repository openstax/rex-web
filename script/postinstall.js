var fs = require('fs');

const cssFile = 'node_modules/cnx-recipes/styles/output/intro-business';

fs.readFile(`${cssFile}-rex-web.css`, 'utf8', function(err, contents) {
  if (err) {
    throw new Error(`BUG: Could not read "${cssFile}". Message: "${err.message}"`)
  }
  fs.writeFile(`${cssFile}.json`, JSON.stringify(contents), (err) => {
    if (err) {
      throw new Error(`BUG: Could not write "${cssFile}". Message: "${err.message}"`)
    }
  });
});
