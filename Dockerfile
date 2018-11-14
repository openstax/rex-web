FROM node:10.9-alpine

COPY . /code
WORKDIR /code

RUN yarn install
RUN yarn run build

EXPOSE 8000

ENTRYPOINT ["yarn", "run"]
CMD ["server"]
