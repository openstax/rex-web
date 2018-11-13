FROM node:10.9-alpine

COPY . /code
WORKDIR /code
RUN yarn && yarn build

EXPOSE 8000

CMD yarn server
