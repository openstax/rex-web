'use strict';

const { Gatherer } = require('lighthouse');

module.exports = class UniqueIds extends Gatherer {
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

    // Find duplicates for debugging
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    const uniqueDuplicates = [...new Set(duplicates)];

    // Log duplicates to console for debugging
    if (!areUnique) {
      console.log('*** Duplicate IDs found:', uniqueDuplicates);
      console.log('*** All IDs:', ids.sort());
    }

    return {
      rawValue: ids,
      score: Number(areUnique),
      details: areUnique ? undefined : {
        type: 'table',
        headings: [{ key: 'id', itemType: 'text', text: 'Duplicate ID' }],
        items: uniqueDuplicates.map(id => ({ id }))
      }
    };
  }

  // Gatherer function
  async afterPass({ driver }) {
    const fn = () => {
      const elementsWithId = document.querySelectorAll('[id]');
      return [...elementsWithId]
        .map(el => el.getAttribute('id'))
        // empty ids are not valid, but some GTM scripts are adding them
        // that should be looked into and this should be removed
        .filter(id => !!id)
      ;
    };
    return driver.evaluateAsync(`((${fn.toString()}) ())`);
  }
}
