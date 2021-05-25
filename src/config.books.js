module.exports = process.env.REACT_APP_ENV === 'test'
    ? { 'testbook1-uuid': { 'defaultVersion': '1.0' } }
    : require('./config.books.json');
