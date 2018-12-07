// tslint:disable:no-console
import { argv } from 'yargs';
import server from '.';

const port = parseInt(process.env.PORT || '0', 10);

server({port, ...argv})
  .then(({port: actualPort}) => console.log(`WEBSERVER: running on port: ${actualPort}`))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
;
