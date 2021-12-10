import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SQSHandler } from 'aws-lambda';
import Loadable from 'react-loadable';
import { content } from '../../src/app/content/routes';
import { Match } from '../../src/app/navigation/types';
import config from '../../src/config';
import createArchiveLoader from '../../src/gateways/createArchiveLoader';
import createBookConfigLoader from '../../src/gateways/createBookConfigLoader';
import createBuyPrintConfigLoader from '../../src/gateways/createBuyPrintConfigLoader';
import createHighlightClient from '../../src/gateways/createHighlightClient';
import createOSWebLoader from '../../src/gateways/createOSWebLoader';
import createPracticeQuestionsLoader from '../../src/gateways/createPracticeQuestionsLoader';
import createSearchClient from '../../src/gateways/createSearchClient';
import createUserLoader from '../../src/gateways/createUserLoader';
import { renderPages } from '../prerender/contentPages';

type Payload = Omit<Match<typeof content>, 'route'>;

const s3Client = new S3Client({
  region: process.env.BUCKET_REGION,
});

const saveS3Page = (prefix: string) => (url: string, html: string) => {
  const key = `${prefix}${url}`.replace(/^\/+/, '');

  // tslint:disable-next-line:no-console
  console.log('writing s3 file: ', key);

  return s3Client.send(new PutObjectCommand({
    Body: html,
    Bucket: process.env.BUCKET_NAME,
    CacheControl: 'max-age=0',
    ContentType: 'text/html',
    Key: key,
  }));
};

export const handler: SQSHandler = async(event, context) => {
  // tslint:disable-next-line:no-console
  console.log('recieved event: ', event);

  try {
    await Loadable.preloadAll();

    const archiveLoader = createArchiveLoader(config.REACT_APP_ARCHIVE_URL, {
      appPrefix: '',
      archivePrefix: config.ARCHIVE_URL,
    });
    const osWebLoader = createOSWebLoader(`${config.OS_WEB_URL}${config.REACT_APP_OS_WEB_API_URL}`);
    const userLoader = createUserLoader(`${config.ACCOUNTS_URL}${config.REACT_APP_ACCOUNTS_URL}`);
    const searchClient = createSearchClient(`${config.SEARCH_URL}${config.REACT_APP_SEARCH_URL}`);
    const highlightClient = createHighlightClient(`${config.HIGHLIGHTS_URL}${config.REACT_APP_HIGHLIGHTS_URL}`);
    const buyPrintConfigLoader = createBuyPrintConfigLoader(config.REACT_APP_BUY_PRINT_CONFIG_URL);
    const practiceQuestionsLoader = createPracticeQuestionsLoader();
    const bookConfigLoader = createBookConfigLoader();

    const services = {
      archiveLoader,
      bookConfigLoader,
      buyPrintConfigLoader,
      config,
      highlightClient,
      osWebLoader,
      practiceQuestionsLoader,
      searchClient,
      userLoader,
    };

    // tslint:disable-next-line:no-console
    console.log('processing records');
    const pages: Array<{route: Match<typeof content>, code: number}> = event.Records.map((record) => {
      const payload = JSON.parse(record.body) as Payload;
      // tslint:disable-next-line:no-console
      console.log('parsed payload: ', payload);
      return {route: {...payload, route: content}, code: 200};
    });

    // tslint:disable-next-line:no-console
    console.log('rendering pages');
    await renderPages(services, pages, saveS3Page(process.env.PUBLIC_URL));

    // tslint:disable-next-line:no-console
    console.log('hello');
    // tslint:disable-next-line:no-console
    console.log(event, context);
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.log('error in js', e);
    throw e;
  }
};
