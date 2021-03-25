module.exports = {
  testEnvironment: "jsdom",
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json"
  ],
  setupFilesAfterEnv: [
    "<rootDir>/src/test/setup.ts"
  ],
  setupFiles: [
    "react-app-polyfill/jsdom"
  ],
  testRegex: "(\\.|/)(screenshot|browser|prerender)?spec\\.tsx?$",
  transform: {
    "^.+\\.tsx?$": "<rootDir>/node_modules/react-scripts/config/jest/babelTransform.js",
    "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "<rootDir>/node_modules/react-scripts/config/jest/fileTransform.js"
  },
  collectCoverageFrom: [
    "src/{app,helpers,gateways}/**/*.{ts,tsx}"
  ],
  coverageReporters: [
    "text-summary",
    "html",
    "lcovonly"
  ]
}
