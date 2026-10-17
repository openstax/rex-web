# rex-playwright
Automated testing for Rex

If you have cloned this project already then you can skip this, otherwise you'll need to clone this repo using Git.

# Run the tests
---

*Testing requires access to [git](https://git-scm.com/downloads), [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).*

### Clone the test repo

`git clone https://github.com/openstax/rex-web.git`

`cd rex-web/playwright`

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

Run against a specific Accounts or Website URL

`ACCOUNTS_BASE_URL=https://accounts-temp-instance.openstax.org npm run test`

`WEB_BASE_URL=https://temp-instance.openstax.org npm run test`

---

# TypeScript Playwright suite (run manually)

The CI workflow `.github/workflows/playwright.yml` runs only the Python suite (`pytest ... e2e`).
Nothing in CI runs the TypeScript specs in `tests/rex-test/` (`rex.behaviorspec.ts`,
`tabbing.behaviorspec.ts`), so run them yourself when you change what they cover. For example, run
`tabbing.behaviorspec.ts` after changing highlight card focus handling.

Run a single spec in one browser against staging:

`npx playwright test tests/rex-test/tabbing.behaviorspec.ts --project="Desktop Chrome"`

Point it at another environment with `URL`. Use this to try a change before it reaches staging:

* A local dev server (`yarn start` in the repo root, which serves HTTPS with a self-signed
  certificate): `URL=<the https URL yarn start prints> npx playwright test ...`
* A review app for a pull request: `URL=https://<review-app>.herokuapp.com npx playwright test ...`

The specs sign up a throwaway `restmail.net` account, so the environment needs accounts and
highlights, as every full REX environment has. They run in the Chromium, Firefox and WebKit projects
in `playwright.config.ts`. Specs that depend on desktop-only controls skip the mobile projects.
