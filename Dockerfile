# this dockerfile is not for production, its for QA and CI
FROM node:10.15-alpine as puppeteer

# from https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#running-on-alpine
RUN apk add \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

FROM puppeteer as CI

RUN apk add \
  bash \
  curl \
  git \
  jq \
  wget

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
ARG REACT_APP_BOOKS

ENV PUBLIC_URL=$PUBLIC_URL
ENV REACT_APP_CODE_VERSION=$REACT_APP_CODE_VERSION
ENV REACT_APP_RELEASE_ID=$REACT_APP_RELEASE_ID
ENV REACT_APP_BOOKS=$REACT_APP_BOOKS

ENV REACT_APP_ENV=production

RUN yarn run build
