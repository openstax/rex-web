let config = {};
if (process.env.NODE_ENV === 'test' || process.env.REACT_APP_ENV === 'test') {
  config = {
    RELEASE_ID: 'test',
    CODE_VERSION: 'test',

    REACT_APP_BOOKS: {'testbook1-uuid':{'defaultVersion':'1.0'}},

    FIXTURES: true,

    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 62873,
    DEBUG: process.env.PUPPETEER_DEBUG === 'true',
    PUPPETEER_DEBUG: process.env.PUPPETEER_DEBUG === 'true',

    /*
     * 'live' for yarn start (webpack-dev-server)
     * 'built' for yarn server (pre-rendered html with node server)
     */
    SERVER_MODE: process.env.SERVER_MODE || 'live'
  };
} else {
  config = {
    RELEASE_ID: 'development',
    CODE_VERSION: 'development',
    
    REACT_APP_BOOKS: {'031da8d3-b525-429c-80cf-6c8ed997733a':{'defaultVersion':'14.4'}},

    FIXTURES: false,
    DEBUG: true,

    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
  }
}

module.exports = config;
