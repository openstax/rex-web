// tslint:disable:no-console
import { argv } from 'yargs';
import { Options, startServer } from '.';

startServer(argv as Options)
  .then(({port: actualPort}) => console.log(`WEBSERVER: running on port: ${actualPort}`))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
;
