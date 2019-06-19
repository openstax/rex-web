/*
 * This file is written in JS so the unused configs are optimized out of the built file.
 *
 * `react-scripts start` hardcodes NODE_ENV='development' but we run it in
 * testing for browser tests.
 *
 * `react-scripts build` hardcodes NODE_ENV='production' but we run it in
 * testing for prerender tests.
 *
 * because of this react-scripts NODE_ENV kerfuffle, we ignore it and use
 * REACT_APP_ENV instead. because we ignore NODE_ENV, we cannot rely on
 * the dotenv files that react-scripts loads automatically. instead we use
 * these javascript config files for committed configurations.
 */

let config = {
  APP_ENV: process.env.REACT_APP_ENV,
  ACCOUNTS_URL: process.env.ACCOUNTS_URL || 'https://accounts.openstax.org',
  ARCHIVE_URL: process.env.ARCHIVE_URL || 'https://archive.cnx.org',
  OS_WEB_URL: process.env.OS_WEB_URL || 'https://openstax.org',
  SEARCH_URL: process.env.SEARCH_URL || 'https://openstax.org',
  REACT_APP_ACCOUNTS_URL: '/accounts',
  REACT_APP_ARCHIVE_URL: '/contents',
  REACT_APP_OS_WEB_API_URL: '/apps/cms/api',
  REACT_APP_SEARCH_URL: '/open-search/api/v0',
  BOOKS: process.env.REACT_APP_BOOKS || {
    /* American Government 2e */ '9d8df601-4f12-4ac1-8224-b450bf739e5f':{defaultVersion:'5.1'},
    /* Anatomy & Physiology */ '14fb4ad7-39a1-4eee-ab6e-3ef2482e3e22':{defaultVersion:'15.1'},
    /* Astronomy */ '2e737be8-ea65-48c3-aa0a-9f35b4c6a966':{defaultVersion:'20.1'},
    /* Biology 2e */ '8d50a0af-948b-4204-a71d-4826cba765b8':{defaultVersion:'15.3'},
    /* Business Ethics */ '914ac66e-e1ec-486d-8a9c-97b0f7a99774':{defaultVersion:'4.1'},
    /* Chemistry 2e */ '7fccc9cf-9b71-44f6-800b-f9457fd64335':{defaultVersion:'6.1'},
    /* Chemistry: Atoms First 2e */ 'd9b85ee6-c57f-4861-8208-5ddf261e9c5f':{defaultVersion: '5.2'},
    /* College Physics */ '031da8d3-b525-429c-80cf-6c8ed997733a':{defaultVersion:'14.4'},
    /* Intermediate Algebra */ '02776133-d49d-49cb-bfaa-67c7f61b25a1':{defaultVersion:'6.1'},
    /* Introduction to Business */ '4e09771f-a8aa-40ce-9063-aa58cc24e77f':{defaultVersion:'8.5'},
    /* Introduction to Sociology 2e */ '02040312-72c8-441e-a685-20e9333f3e1d':{defaultVersion: '12.6'},
    /* Introductory Statistics */ '30189442-6998-4686-ac05-ed152b91b9de':{defaultVersion:'23.28'},
    /* Microbiology */ 'e42bd376-624b-4c0f-972f-e0c57998e765':{defaultVersion: '7.1'},
    /* Prealgebra */'caa57dab-41c7-455e-bd6f-f443cda5519c':{defaultVersion:'18.1'},
    /* Precalculus */ // 'fd53eae1-fa23-47c7-bb1b-972349835c3c':{defaultVersion:'10.3'}, // Broken because contains link to external content.
    /* Principles of Accounting, Volume 1 */ // '9ab4ba6d-1e48-486d-a2de-38ae1617ca84':{defaultVersion:'4.25'}, // Broken because contains link to external content.
    /* Principles of Economics 2e */'bc498e1f-efe9-43a0-8dea-d3569ad09a82':{defaultVersion:'7.1'},
    /* Psychology */ '4abf04bf-93a0-45c3-9cbc-2cefd46e68cc':{defaultVersion:'10.16'},
    /* U.S. History */ 'a7ba2fb8-8925-4987-b182-5f4429d48daa':{defaultVersion: '9.4'},
  },
};

if (process.env.REACT_APP_ENV === 'production') {
  Object.assign(config, require('./config.production.js'));
} else if (process.env.REACT_APP_ENV === 'test') {
  Object.assign(config, require('./config.test.js'));
} else {
  Object.assign(config, require('./config.development.js'));
}

module.exports = config;
