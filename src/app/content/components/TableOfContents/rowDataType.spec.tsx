/**
 * These assertions run against the REAL react-aria-components Tree, deliberately.
 *
 * index.spec.tsx mocks Tree/TreeItem/TreeItemContent, so it can only show which
 * component a prop was handed to - not whether that component puts it in the
 * document. That is how this bug survived: data-type was passed to TreeItemContent,
 * a collection leaf component that renders its children and no element of its own,
 * so the attribute never reached the DOM. The mock rendered TreeItemContent as a
 * div and reported the attribute present anyway.
 *
 * Only an unmocked render can tell the difference, so this file does not mock.
 */
import React from 'react';
import { Element } from '@openstax/types/lib.dom';
import ConnectedTableOfContents from '.';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../../test/reactutils';
import TestContainer from '../../../../test/TestContainer';
import { AppState } from '../../../types';
import { initialState } from '../../reducer';
import { formatBookData } from '../../utils';

const book = formatBookData(archiveBook, mockCmsBook);

describe('TableOfContents rows in the real DOM', () => {
  const renderToc = () => {
    const state = { content: { ...initialState, book, page } } as any as AppState;
    const { root, unmount } = renderToDom(
      <TestContainer store={createTestStore(state)}>
        <ConnectedTableOfContents />
      </TestContainer>
    );

    return { rows: Array.from(root.querySelectorAll('[role="row"]')) as Element[], unmount };
  };

  it('puts data-type on every row, leaf pages included', () => {
    const { rows, unmount } = renderToc();

    expect(rows.length).toBeGreaterThan(0);
    expect(rows.filter((row) => !row.getAttribute('data-type'))).toEqual([]);

    const leafRow = rows.find((row) => row.getAttribute('data-type') === 'page');
    expect(leafRow).toBeDefined();
    // the row itself carries it - the e2e locators match [role=row][data-type=...]
    expect(leafRow!.querySelector('a.toc-content-link')).not.toBeNull();

    unmount();
  });

  it('puts data-type on expandable rows', () => {
    const { rows, unmount } = renderToc();

    const expandableRow = rows.find((row) => row.hasAttribute('data-has-child-items'));

    expect(expandableRow).toBeDefined();
    expect(expandableRow!.getAttribute('data-type')).toBe('chapter');

    unmount();
  });
});
