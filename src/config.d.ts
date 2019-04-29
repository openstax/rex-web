interface Config {
  APP_ENV: 'development' | 'test' | 'production';
  REACT_APP_ARCHIVE_URL: string;
  REACT_APP_OS_WEB_API_URL: string;

  CODE_VERSION: string;
  RELEASE_ID: string;

  BOOKS: {
    [key: string]: {
      defaultVersion: string;
      bookStyleName: string | undefined;
    };
  };

  PORT: number;
  DEBUG: boolean;
}

declare const config: Config;
export = config;
