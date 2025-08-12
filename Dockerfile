# this dockerfile is not for production, its for QA and CI
FROM debian:bullseye AS utils

# general utils
RUN apt-get update && apt-get install -y \
  curl \
  git \
  jq \
  locales \
  procps \
  unzip \
  && rm -rf /var/lib/apt/lists/*

# using an UTF-8 locale is required for the aws cli
# to successfully list S3 objects with unicode characters
# setup from https://stackoverflow.com/a/28406007
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
  unzip awscliv2.zip && \
  ./aws/install && \
  rm -rf awscliv2.zip aws

# node
# this is really excessively complicated logic just so the .nvmrc can be
# the source of truth about our supported node version
COPY .nvmrc /root/.
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash && \
  NVM_DIR="$HOME/.nvm" && . $HOME/.nvm/nvm.sh && \
  cd && nvm install && \
  npm install -g yarn && \
  mv $(dirname $(dirname $(which node))) /usr/local/node && \
  rm -r "$NVM_DIR"

ENV PATH /usr/local/node/bin:$PATH

FROM utils AS ci

# shellcheck (apt version is very old)
# includes crazy hack around some linking issue from https://github.com/koalaman/shellcheck/issues/1053#issuecomment-357816927
run apt-get update && apt-get install -y \
  xz-utils && \
  rm -rf /var/lib/apt/lists/* && \
  curl -Ls https://github.com/koalaman/shellcheck/releases/download/stable/shellcheck-stable.linux.x86_64.tar.xz | tar -Jxf - --strip-components=1 -C $HOME shellcheck-stable/shellcheck && \
  touch /tmp/libc.so.6 && \
  echo "LD_LIBRARY_PATH=/tmp $HOME/shellcheck \"\$@\"" > /usr/bin/shellcheck && \
  chmod a+x /usr/bin/shellcheck

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
  libgbm1 \
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
  wget \
  xdg-utils \
  && rm -rf /var/lib/apt/lists/*

FROM utils AS release

# Docker trickery so we can reuse the yarn install layer until package.json or yarn.lock change
COPY package.json yarn.lock /code/
WORKDIR /code
RUN yarn install --network-timeout 60000

COPY . /code

ARG BOOKS
ENV BOOKS=${BOOKS}

ARG IMAGE_TAG
ENV IMAGE_TAG=${IMAGE_TAG}

ARG PUBLIC_URL
ENV PUBLIC_URL=${PUBLIC_URL}

ARG REACT_APP_CODE_VERSION
ENV REACT_APP_CODE_VERSION=${REACT_APP_CODE_VERSION}

ARG REACT_APP_RELEASE_ID
ENV REACT_APP_RELEASE_ID=${REACT_APP_RELEASE_ID}

ARG REACT_APP_ENV
ENV REACT_APP_ENV=${REACT_APP_ENV}

RUN yarn build:clean
