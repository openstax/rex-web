import createPracticeQuestionsLoader from './createPracticeQuestionsLoader';

import mockData from '../../data/practice/summary/cce64fde-f448-43b8-ae88-27705cceb0da.json';

describe('createPracticeQuestionsLoader', () => {
  it('returns json if it exists', async() => {
    const loader = createPracticeQuestionsLoader();

    expect(await loader.getPracticeQuestionsBookSummary('cce64fde-f448-43b8-ae88-27705cceb0da')).toEqual(mockData);
  });

  it('returns undefined if there is no json for passed id', async() => {
    const loader = createPracticeQuestionsLoader();

    expect(await loader.getPracticeQuestionsBookSummary('this-does-not-exists')).toEqual(undefined);
  });
});
