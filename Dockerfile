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

RUN apk update && apk upgrade && apk add --no-cache \
      chromium \
      nss
