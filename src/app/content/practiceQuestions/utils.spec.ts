import { book } from '../../../test/mocks/archiveLoader';
import { assertDefined } from '../../utils';
import { findArchiveTreeNodeById } from '../utils/archiveTreeUtils';
import { stripIdVersion } from '../utils/idUtils';
import { PracticeQuestionsSummary } from './types';
import {
  getNextPageWithPracticeQuestions,
  getPracticeQuestionsLocationFilters,
  pageHasPracticeQuestions,
} from './utils';

describe('pageHasPracticeQuestions', () => {
  it('returns true', () => {
    expect(pageHasPracticeQuestions('pageId', { countsPerSource: { pageId: 2, other: 0 } })).toEqual(true);
  });

  it('returns false', () => {
    expect(pageHasPracticeQuestions('asdasd', { countsPerSource: { pageId: 2, other: 0 } })).toEqual(false);
  });
});

describe('getPracticeQuestionsLocationFilters', () => {
  it('returns empty map if book or summary is not truthy', () => {
    expect(getPracticeQuestionsLocationFilters(null, book)).toEqual(new Map());
    expect(getPracticeQuestionsLocationFilters({ countsPerSource: {} }, undefined)).toEqual(new Map());
  });

  it('returns location filters for practice questions', () => {
    const linkedPage1 = assertDefined(findArchiveTreeNodeById(book.tree, 'testbook1-testpage2-uuid'), 'error');
    const linkedPage2 = assertDefined(findArchiveTreeNodeById(book.tree, 'testbook1-testpage11-uuid'), 'error');
    const linkedPage3 = assertDefined(findArchiveTreeNodeById(book.tree, 'testbook1-testpage8-uuid'), 'error');
    const linkedPage4 = assertDefined(findArchiveTreeNodeById(book.tree, 'testbook1-testpage3-uuid'), 'error');
    const summary: PracticeQuestionsSummary = {
      countsPerSource: {
        [stripIdVersion(linkedPage1.id)]: 2,
        [stripIdVersion(linkedPage2.id)]: 2,
        [stripIdVersion(linkedPage3.id)]: 3,
        [stripIdVersion(linkedPage4.id)]: 1,
      },
    };

    const output = new Map([
      ['testbook1-testchapter10', { section: linkedPage1.parent, children: [linkedPage1] }],
      ['testbook1-testchapter1-uuid', { section: linkedPage2.parent, children: [linkedPage2, linkedPage3] }],
      ['testbook1-testchapter2-uuid', { section: linkedPage4.parent, children: [linkedPage4] }],
    ]);

    expect(getPracticeQuestionsLocationFilters(summary, book)).toEqual(output);
  });
});

describe('getNextPageWithPracticeQuestions', () => {
  it('noops for no book', () => {
    expect(getNextPageWithPracticeQuestions('asd', new Map(), undefined)).toEqual(undefined);
  });

  it('noops if node can\'t be found in the book', () => {
    expect(getNextPageWithPracticeQuestions('asd', new Map(), book)).toEqual(undefined);
  });

  it('finds next section with practice questions or undefined if there are no more sections', () => {
    const linkedPage1 = assertDefined(findArchiveTreeNodeById(book.tree, 'testbook1-testpage2-uuid'), 'error');
    const linkedPage3 = assertDefined(findArchiveTreeNodeById(book.tree, 'testbook1-testpage8-uuid'), 'error');
    const linkedPage4 = assertDefined(findArchiveTreeNodeById(book.tree, 'testbook1-testpage3-uuid'), 'error');
    const summary: PracticeQuestionsSummary = {
      countsPerSource: {
        [stripIdVersion(linkedPage1.id)]: 2,
        [stripIdVersion(linkedPage3.id)]: 3,
        [stripIdVersion(linkedPage4.id)]: 1,
      },
    };
    const locationFilters = getPracticeQuestionsLocationFilters(summary, book);

    expect(getNextPageWithPracticeQuestions(linkedPage1.id, locationFilters, book)).toEqual(linkedPage3);
    expect(getNextPageWithPracticeQuestions(linkedPage3.id, locationFilters, book)).toEqual(linkedPage4);
    expect(getNextPageWithPracticeQuestions(linkedPage4.id, locationFilters, book)).toEqual(undefined);
  });
});
