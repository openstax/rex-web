import { book } from '../../../test/mocks/archiveLoader';
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
    const page1 = (book as any).tree.contents[1].contents[0].contents[0]; // testbook1-testpage2-uuid
    const linkedPage1 = findArchiveTreeNodeById(book.tree, 'testbook1-testpage2-uuid');
    const page2 = (book as any).tree.contents[1].contents[1]; // testbook1-testpage11-uuid
    const linkedPage2 = findArchiveTreeNodeById(book.tree, 'testbook1-testpage11-uuid');
    const page3 = (book as any).tree.contents[1].contents[2]; // testbook1-testpage8-uuid
    const linkedPage3 = findArchiveTreeNodeById(book.tree, 'testbook1-testpage8-uuid');
    const page4 = (book as any).tree.contents[2].contents[0]; // testbook1-testpage3-uuid
    const linkedPage4 = findArchiveTreeNodeById(book.tree, 'testbook1-testpage3-uuid');
    const summary: PracticeQuestionsSummary = {
      countsPerSource: {
        [stripIdVersion(page1.id)]: 2,
        [stripIdVersion(page2.id)]: 2,
        [stripIdVersion(page3.id)]: 3,
        [stripIdVersion(page4.id)]: 1,
      },
    };

    const output = new Map([
      ['testbook1-testchapter10', [linkedPage1]],
      ['testbook1-testchapter1-uuid', [linkedPage2, linkedPage3]],
      ['testbook1-testchapter2-uuid', [linkedPage4]],
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
    const page1 = (book as any).tree.contents[1].contents[0].contents[0]; // testbook1-testpage2-uuid
    const page3 = (book as any).tree.contents[1].contents[2]; // testbook1-testpage8-uuid
    const linkedPage3 = findArchiveTreeNodeById(book.tree, 'testbook1-testpage8-uuid');
    const page4 = (book as any).tree.contents[2].contents[0]; // testbook1-testpage3-uuid
    const linkedPage4 = findArchiveTreeNodeById(book.tree, 'testbook1-testpage3-uuid');
    const summary: PracticeQuestionsSummary = {
      countsPerSource: {
        [stripIdVersion(page1.id)]: 2,
        [stripIdVersion(page3.id)]: 3,
        [stripIdVersion(page4.id)]: 1,
      },
    };
    const locationFilters = getPracticeQuestionsLocationFilters(summary, book);

    expect(getNextPageWithPracticeQuestions(page1.id, locationFilters, book)).toEqual(linkedPage3);
    expect(getNextPageWithPracticeQuestions(page3.id, locationFilters, book)).toEqual(linkedPage4);
    expect(getNextPageWithPracticeQuestions(page4.id, locationFilters, book)).toEqual(undefined);
  });
});
