'use strict';

const { Gatherer } = require('lighthouse');

// This does not follow the recommended Lighthouse pattern of separating the Audit from the Gatherer.
// Instead, it combines both into 1 class to reduce copy/pasta.
class SingleH1 extends Gatherer {
  static get meta() {
    return {
      id: SingleH1.name,
      title: 'Contains exactly 1 <h1> element',
      failureTitle: 'Did not contain exactly 1 <h1> element',
      description: 'Used to ensure that each page contains exactly one <h1> element.',

      // The name of the custom gatherer class that provides input to this audit.
      requiredArtifacts: [SingleH1.name],
    };
  }

  static audit(artifacts) {
    const h1Count = artifacts[SingleH1.name];
    const isSingle = h1Count === 1;

    return {
      rawValue: h1Count,
      score: Number(isSingle), // Cast true/false to 1/0
    };
  }

  // Gatherer function
  async afterPass({ driver }) {
    return driver.evaluateAsync('document.querySelectorAll("h1").length');
  }
}

class UniqueIds extends Gatherer {
  static get meta() {
    return {
      id: UniqueIds.name,
      title: 'Element ids are unique',
      failureTitle: 'Duplicate or invalid id',
      description: 'Used to ensure that each id attribute is unique to the page.',

      // The name of the custom gatherer class that provides input to this audit.
      requiredArtifacts: [UniqueIds.name],
    };
  }

  static audit(artifacts) {
    const ids = artifacts[UniqueIds.name];
    const areUnique = ids.length === new Set(ids).size;
    return {
      rawValue: ids,
      score: Number(areUnique),
    };
  }

  // Gatherer function
  async afterPass({ driver }) {
    const fn = () => {
      const elementsWithId = document.querySelectorAll('[id]');
      return [...elementsWithId].map(el => el.getAttribute('id'))
    };
    return driver.evaluateAsync(`((${fn.toString()}) ())`);
  }
}


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

  // Create a new 'Custom Accessibility' section in the default report for our results.
  categories: {
    customAccessibility: {
      title: 'Custom Accessibility',
      description: 'Custom Accessibility tests',
      auditRefs: ALL_AUDITS.map(a => { return { weight: 1, id: a.meta.id } }),
    },
  },
};