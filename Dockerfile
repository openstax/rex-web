# this dockerfile is not for production, its for QA and CI
FROM debian:buster as CI

RUN apt-get update && apt-get install -y \
  # CI utils
  git \
  procps \
  # / CI utils
  # CLI utils
  curl \
  jq \
  # / CLI utils
  # deps for shellcheck
  xz-utils \
  # / deps for shellcheck
  # deps for aws
  unzip \
  # / deps for aws
  && rm -rf /var/lib/apt/lists/*

# AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
  unzip awscliv2.zip && \
  ./aws/install && \
  rm -rf awscliv2.zip aws

# ShellCheck (apt version is very old)
# includes crazy hack around some linking issue from https://github.com/koalaman/shellcheck/issues/1053#issuecomment-357816927
RUN curl -Ls https://github.com/koalaman/shellcheck/releases/download/stable/shellcheck-stable.linux.x86_64.tar.xz | tar -Jxf - --strip-components=1 -C $HOME shellcheck-stable/shellcheck && \
  touch /tmp/libc.so.6 && \
  echo "LD_LIBRARY_PATH=/tmp $HOME/shellcheck \"\$@\"" > /usr/bin/shellcheck && \
  chmod a+x /usr/bin/shellcheck

# node
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
