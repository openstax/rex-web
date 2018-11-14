const server = require('.');
const argv = require('yargs').argv

server(argv).then(({port}) => console.log(`running on port: ${port}`));
