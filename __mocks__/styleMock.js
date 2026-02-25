/**
 * Mock for CSS imports in Jest tests
 *
 * This mock allows Jest to import CSS files without errors.
 * When a CSS file is imported in a test, this empty object is returned.
 *
 * This is used for plain CSS imports like:
 *   import './Component.css';
 *
 * For more details, see:
 * https://jestjs.io/docs/webpack#handling-static-assets
 */

module.exports = {};
