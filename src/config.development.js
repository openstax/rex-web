const books = require('./config.books');

module.exports = {
  RELEASE_ID: 'development',
  CODE_VERSION: 'development',
  DEPLOYED_ENV: 'development',

  ACCOUNTS_URL: process.env.ACCOUNTS_URL || 'https://accounts-dev.openstax.org',
  OS_WEB_URL: process.env.OS_WEB_URL || 'https://cms-dev.openstax.org',

  SKIP_OS_WEB_PROXY: process.env.SKIP_OS_WEB_PROXY !== undefined,
  FIXTURES: false,
  DEBUG: true,

  BOOKS: [
    /* Calculus vol 1 */ '8b89d172-2927-466f-8661-01abc7ccdba4',
    /* Calculus vol 2 */ '1d39a348-071f-4537-85b6-c98912458c3c',
    /* Calculus vol 3 */ 'a31cd793-2162-4e9e-acb5-6e6bbd76a5fa',
    /* College Algebra */ '9b08c294-057f-4201-9f48-5d6ad992740d',
    /* Algebra and Trigonometry */ '13ac107a-f15f-49d2-97e8-60ab2e3b519c',
    /* Am Gov 2e */ '9d8df601-4f12-4ac1-8224-b450bf739e5f',
    /* Business statistics */ 'b56bb9e9-5eb8-48ef-9939-88b1b12ce22f',
    /* Intro statistics */ '30189442-6998-4686-ac05-ed152b91b9de',
    /* Principles of Accounting Vol 1 */ '9ab4ba6d-1e48-486d-a2de-38ae1617ca84',
    /* Principles of Accounting Vol 2 */ '920d1c8a-606c-4888-bfd4-d1ee27ce1795',
    /* US History */ 'a7ba2fb8-8925-4987-b182-5f4429d48daa',
  ].reduce((devBooks, uuid) => {
    devBooks[uuid] = books[uuid];
    return devBooks;
  }, {}),

  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
};
