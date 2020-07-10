# this dockerfile is not for production, its for QA and CI
FROM alpine:3

# node
# hackery from https://github.com/nvm-sh/nvm/issues/1102#issuecomment-591560924
COPY .nvmrc /root/.
RUN touch $HOME/.profile && apk add libstdc++ curl bash && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.1/install.sh | bash && \
    echo 'export NVM_NODEJS_ORG_MIRROR=https://unofficial-builds.nodejs.org/download/release;' >> $HOME/.profile && \
    echo 'nvm_get_arch() { nvm_echo "x64-musl"; }' >> $HOME/.profile && \
    NVM_DIR="$HOME/.nvm" && source $HOME/.nvm/nvm.sh && source $HOME/.profile && \
    cd && nvm install && \
    ln -s $(dirname $(which node)) /usr/local/node-bin

ENV PATH /usr/local/node-bin:$PATH

# fix Error: could not get uid/gid https://stackoverflow.com/a/52196681
RUN npm config set unsafe-perm true && \
  npm install -g yarn && \
  npm config set unsafe-perm false

# puppeteer
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

# general CLI utilities
RUN apk add \
  bash \
  curl \
  git \
  jq \
  py-pip \
  python3 \
  wget && \
  pip install awscli --upgrade && \
  apk --purge del py-pip

# make and friends, needed for pytest suite
RUN apk add \
  gcc \
  libffi-dev \
  make \
  musl-dev \
  openssl-dev \
  python3-dev
