# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/playwright:focal

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD ["npm", "run", "test"]