FROM node:10.9-alpine as slim

COPY . /code
WORKDIR /code

RUN yarn install
RUN yarn run build

EXPOSE 8000

ENTRYPOINT ["yarn", "run"]
CMD ["server"]

FROM slim as CI

ENV PUPPETEER_CHROME_PATH="/usr/bin/chromium-browser"
ENV CI="true"

RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge \
      nss@edge
