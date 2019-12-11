import { treeWithUnits } from '../../../../test/trees';
import { filterCountsPerSourceByChapters, getNextPageSources } from './paginationUtils';

describe('getNextPageSources', () => {
  it('gets one page id if it has enough records left to fill a response', () => {
    expect(getNextPageSources({
      page1: 10,
      page2: 10,
    }, treeWithUnits, 10)).toEqual(['page1']);
  });

  it('fails over to next page if more records are needed', () => {
    expect(getNextPageSources({
      page1: 5,
      page2: 10,
    }, treeWithUnits, 10)).toEqual(['page1', 'page2']);
  });

  it('skips pages with no highlights', () => {
    expect(getNextPageSources({
      page1: 0,
      page2: 10,
    }, treeWithUnits, 10)).toEqual(['page2']);
  });
});

describe('filterCountsPerSourceByChapters', () => {
  it('filters by chapters', () => {
    expect(filterCountsPerSourceByChapters(
      ['chapter1'],
      treeWithUnits,
      {page1: 2, preface: 3}
    )).toEqual(
      {page1: 2}
    );
  });

  it('filters by pages outside chapter', () => {
    expect(filterCountsPerSourceByChapters(
      ['chapter1', 'preface'],
      treeWithUnits,
      {page1: 2, preface: 3}
    )).toEqual(
      {page1: 2, preface: 3}
    );
  });
});
