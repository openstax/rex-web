const SingleH1 = require('./SingleH1');
const UniqueIds = require('./UniqueIds');

const ALL_AUDITS = [ SingleH1, UniqueIds, ];

module.exports = {
  // Run custom tests along with all the default Lighthouse tests.
  extends: 'lighthouse:default',

  // Add gatherer to the default Lighthouse load ('pass') of the page.
  passes: [{
    passName: 'defaultPass',
    gatherers: ALL_AUDITS.map(a => { return { implementation: a } }),
  }],

  // Add custom audit to the list of audits 'lighthouse:default' will run.
  audits: ALL_AUDITS.map(a => { return { implementation: a } }),

  settings: {
    // osano.js breaks this in a weird way, it causes the audit to return null
    // which null sout the whole best-practices category score. updating lighthouse
    // might allow us to block loading osano.js by pre-setting the page handle as
    // shown in this example https://github.com/GoogleChrome/lighthouse/tree/main/docs/recipes/auth
    // the version of lighthouse we currently use doesn't allow access to the page
    // handle so we don't have access to request blocking
    skipAudits: [
      'errors-in-console',
      'geolocation-on-start',
      'notification-on-start',
      'deprecations',
    ],
  },

  // Create a new 'Custom Accessibility' section in the default report for our results.
  categories: {
    customAccessibility: {
      title: 'Custom Accessibility',
      description: 'Custom Accessibility tests',
      auditRefs: ALL_AUDITS.map(a => { return { weight: 1, id: a.meta.id } }),
    },
  },
};
