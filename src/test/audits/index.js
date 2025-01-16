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
    blockedUrlPatterns: [
      'googletagmanager.com',
      'pulseinsights.com',
    ],
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
