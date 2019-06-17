# this dockerfile is not for production, its for QA and CI
FROM node:10.15-jessie as puppeteer

# debian deps from https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch
RUN apt-get update && apt-get install -y \
  ca-certificates \
  fonts-liberation \
  gconf-service \
  libappindicator1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  shellcheck \
  wget \
  xdg-utils \
  && rm -rf /var/lib/apt/lists/*

FROM puppeteer as slim

WORKDIR /code

COPY package.json yarn.lock ./
COPY ./script ./script
COPY ./src/config*js ./src/

RUN yarn install

COPY . .

EXPOSE 8000

CMD ["yarn", "run", "server"]

FROM slim as built

ARG PUBLIC_URL
ARG REACT_APP_CODE_VERSION
ARG REACT_APP_RELEASE_ID
ARG REACT_APP_BOOKS="{\"031da8d3-b525-429c-80cf-6c8ed997733a\":{\"defaultVersion\":\"14.4\"},\"8d50a0af-948b-4204-a71d-4826cba765b8\":{\"defaultVersion\":\"15.3\"},\"30189442-6998-4686-ac05-ed152b91b9de\":{\"defaultVersion\":\"23.28\"},\"02776133-d49d-49cb-bfaa-67c7f61b25a1\":{\"defaultVersion\":\"6.1\"},\"7fccc9cf-9b71-44f6-800b-f9457fd64335\":{\"defaultVersion\":\"6.1\"},\"14fb4ad7-39a1-4eee-ab6e-3ef2482e3e22\":{\"defaultVersion\":\"15.1\"},\"2e737be8-ea65-48c3-aa0a-9f35b4c6a966\":{\"defaultVersion\":\"20.1\"},\"4abf04bf-93a0-45c3-9cbc-2cefd46e68cc\":{\"defaultVersion\":\"10.16\"},\"4e09771f-a8aa-40ce-9063-aa58cc24e77f\":{\"defaultVersion\":\"8.5\"},\"bc498e1f-efe9-43a0-8dea-d3569ad09a82\":{\"defaultVersion\":\"7.1\"},\"caa57dab-41c7-455e-bd6f-f443cda5519c\":{\"defaultVersion\":\"18.1\"},\"914ac66e-e1ec-486d-8a9c-97b0f7a99774\":{\"defaultVersion\":\"4.1\"},\"9d8df601-4f12-4ac1-8224-b450bf739e5f\":{\"defaultVersion\":\"5.1\"}}"

ENV PUBLIC_URL=$PUBLIC_URL
ENV REACT_APP_CODE_VERSION=$REACT_APP_CODE_VERSION
ENV REACT_APP_RELEASE_ID=$REACT_APP_RELEASE_ID
ENV REACT_APP_BOOKS=$REACT_APP_BOOKS

ENV REACT_APP_ENV=production

RUN yarn run build
