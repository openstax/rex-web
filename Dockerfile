# this dockerfile is not for production, its for QA and CI
FROM alpine:3

# nvm and node
# hackery from https://github.com/nvm-sh/nvm/issues/1102#issuecomment-591560924
RUN touch $HOME/.profile && apk add libstdc++ curl bash && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.1/install.sh | bash && \
    echo 'export NVM_NODEJS_ORG_MIRROR=https://unofficial-builds.nodejs.org/download/release;' >> $HOME/.profile && \
    echo 'nvm_get_arch() { nvm_echo "x64-musl"; }' >> $HOME/.profile && \
    NVM_DIR="$HOME/.nvm" && source $HOME/.nvm/nvm.sh && source $HOME/.profile

COPY .nvmrc /root/.
RUN source ~/.profile && cd && nvm install

# so bash will source npm and node
RUN ln -s /root/.profile /root/.bashrc
# so ash will source npm and node
ENV ENV="/root/.profile"

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
