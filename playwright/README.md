# rex-playwright
Automated testing for Rex

If you have cloned this project already then you can skip this, otherwise you'll need to clone this repo using Git.

# Run the tests
---

*Testing requires access to [git](https://git-scm.com/downloads), [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), and (for simple testing) [Docker](https://docs.docker.com/engine/install/).*

### Clone the test repo

`git clone https://github.com/gregfitch/oslabs-test`

`cd oslabs-test`

### Install dependencies

`npx playwright install-deps` (*may be skipped if running Chromium and/or Firefox on Linux; required for Webkit*)

### Check the code and verify the Dev environment is up

`npm run coverage` (*may be skipped*)

### Run the tests

`npm run test`

---

# Command line options

Run against another instance set (expected options: `dev`, `qa`, `staging`, `prod`)

`INSTANCE=qa npm run test`

Run against a specific Accounts, Kinetic, or Website URL

`ACCOUNTS_BASE_URL=https://accounts-temp-instance.openstax.org npm run test`

`KINETIC_BASE_URL=https://temp-instance.kinetic.openstax.org npm run test`

`WEB_BASE_URL=https://temp-instance.openstax.org npm run test`

# Docker

The tests may also be run through Docker (*note: by default it runs things through the Dev instance*)

`docker build . -t <tag_name>`

`docker run --rm <tag_name>`
