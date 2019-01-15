interface Config {
  REACT_APP_ARCHIVE_URL: string;
  REACT_APP_OS_WEB_API_URL: string;

  CODE_VERSION: string;
  RELEASE_ID: string;

  BOOKS: {
    [key: string]: {
      defaultVersion: string;
    };
  };

  PORT: number;
  DEBUG: boolean;
}

declare const config: Config;
export = config;
