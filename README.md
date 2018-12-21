## Development Setup

install [nvm](https://github.com/creationix/nvm#installation)

```bash
# use the right version of node
nvm install

# install yarn, skip if you have it already
npm install -g yarn

# install dependencies
yarn

# start (browser will open automatically)
yarn start
```

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

Run `PORT=8000 yarn start` to change the webserver port.


### `yarn start:static`

Builds the app, builds prerendered content, and then serves it at [http://localhost:3000](http://localhost:3000) .

Run `PORT=8000 yarn start:static` to change the webserver port.

Run `REACT_APP_ENV=development yarn start:static` to build the books (defined in [config.development.js](./src/config.development.js)) and serve them.

To prerender the test fixture book and serve it, run `REACT_APP_ENV=test yarn start:static`.

### `yarn test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>

### Using Docker

install [docker](https://docs.docker.com/install/)

build the image

```bash
docker build -t openstax/books-web .
```

run commands
```bash

# starts server
docker run -t openstax/books-web yarn server

# runs tests
docker run -t openstax/books-web yarn test
```

### Environment Variables

- `PUPPETEER_DEBUG=true yarn test` : Opens the browser with dev tools. This allows you to add `debugger` statements into the test _and_ into the browser code that is evaluated.
