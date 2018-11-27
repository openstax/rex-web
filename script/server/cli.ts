// tslint:disable:no-console
import { argv } from 'yargs';
import server from '.';

server({port: parseInt(process.env.PORT || '', 10), ...argv})
  .then(({port}) => console.log(`running on port: ${port}`))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
;
