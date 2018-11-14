var fs = require('fs');

const cssFile = 'node_modules/cnx-recipes/styles/output/intro-business';

fs.readFile(`${cssFile}.css`, 'utf8', function(err, contents) {
  fs.writeFile(`${cssFile}.json`, JSON.stringify(contents), err => err);
});
