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
  gcc \
  git \
  jq \
  make \
  py-pip \
  python \
  python3 \
  wget && \
  pip install awscli --upgrade && \
  apk --purge del py-pip

