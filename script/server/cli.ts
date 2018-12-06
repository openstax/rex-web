// tslint:disable:no-console
import { argv } from 'yargs';
import server from '.';

const port = parseInt(process.env.PORT || '', 10)

if (!process.env.PORT || Number.isNaN(port)) {
  console.error(`WEBSERVER: PORT environment variable is not set or is not a number.`);
  process.exit(1);
}

server({port, ...argv})
  .then(({port}) => console.log(`WEBSERVER: running on port: ${port}`))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
;
