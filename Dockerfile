# this dockerfile is not for production, its for QA and CI
FROM debian:jessie as CI

RUN apt-get update && apt-get install -y \
  # CI utils
  shellcheck \
  git \
  # / CI utils
  # CLI utils
  curl \
  jq \
  # / CLI utils
  # for selenium tests
  python3 \
  # / for selenium tests
  # for aws cli 
  python3-pip \
  python3-dev \
  # / for aws cli 
  && rm -rf /var/lib/apt/lists/*

# AWS CLI
RUN pip3 install awscli --upgrade

# node
#
# this is really excessively complicated logic just so the .nvmrc can be
# the source of truth about our supported node version
COPY .nvmrc /root/.
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash && \
  NVM_DIR="$HOME/.nvm" && . $HOME/.nvm/nvm.sh && \
  cd && nvm install && \
  npm install -g yarn && \
  ln -s $(dirname $(which node)) /usr/local/node-bin

ENV PATH /usr/local/node-bin:$PATH
  
FROM CI as CHROME

RUN apt-get update && apt-get install -y \
  # debian deps from https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch
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
