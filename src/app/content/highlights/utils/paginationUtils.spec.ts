import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { treeWithUnits } from '../../../../test/trees';
import { findArchiveTreeNode } from '../../utils/archiveTreeUtils';
import {
  filterCountsPerSourceByColorFilter,
  filterCountsPerSourceByLocationFilter,
  getNextPageSources
} from './paginationUtils';

describe('getNextPageSources', () => {
  it('gets one page id if it has enough records left to fill a response', () => {
    expect(getNextPageSources({
      page1: {[HighlightColorEnum.Green]: 10},
      page2: {[HighlightColorEnum.Pink]: 10},
    }, treeWithUnits, 10)).toEqual(['page1']);
  });

  it('fails over to next page if more records are needed', () => {
    expect(getNextPageSources({
      page1: {[HighlightColorEnum.Green]: 5},
      page2: {[HighlightColorEnum.Pink]: 10},
    }, treeWithUnits, 10)).toEqual(['page1', 'page2']);
  });

  it('skips pages with no highlights', () => {
    expect(getNextPageSources({
      page1: {[HighlightColorEnum.Green]: 0},
      page2: {[HighlightColorEnum.Pink]: 10},
    }, treeWithUnits, 10)).toEqual(['page2']);
  });
});

describe('filterCountsPerSourceByLocationFilter', () => {
  it('filters by chapters', () => {
    expect(filterCountsPerSourceByLocationFilter(
      new Map([['chapter1', findArchiveTreeNode(treeWithUnits, 'chapter1')!]]),
      {
        page1: {[HighlightColorEnum.Green]: 2},
        preface: {[HighlightColorEnum.Pink]: 3},
      }
    )).toEqual(
      {
        page1: {[HighlightColorEnum.Green]: 2},
      }
    );
  });

  it('filters by pages outside chapter', () => {
    expect(filterCountsPerSourceByLocationFilter(
      new Map([
        ['chapter1', findArchiveTreeNode(treeWithUnits, 'chapter1')!],
        ['preface', findArchiveTreeNode(treeWithUnits, 'preface')!]]
      ),
      {
        page1: {[HighlightColorEnum.Green]: 2},
        preface: {[HighlightColorEnum.Pink]: 3},
      }
    )).toEqual(
      {
        page1: {[HighlightColorEnum.Green]: 2},
        preface: {[HighlightColorEnum.Pink]: 3},
      }
    );
  });
});

describe('filterCountsPerSourceByColorFilter', () => {
  it('filters by colors', () => {
    expect(filterCountsPerSourceByColorFilter(
      [HighlightColorEnum.Green],
      {
        page1: {[HighlightColorEnum.Green]: 2},
        preface: {[HighlightColorEnum.Pink]: 3},
      }
    )).toEqual(
      {
        page1: {[HighlightColorEnum.Green]: 2},
      }
    );
  });
});
