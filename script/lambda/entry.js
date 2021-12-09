const requireBabelConfig = require('../../src/babel-config');

requireBabelConfig(['.ts', '.tsx']);

exports.render_book_page_to_s3 = require('./render-book-page-to-s3').handler

exports.handler = async function() {
  console.error("specify your lambda handler");
};
