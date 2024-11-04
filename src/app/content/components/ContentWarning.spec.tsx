import React from 'react';
import { renderToDom } from '../../../test/reactutils';
import ContentWarning from './ContentWarning';
import { act } from 'react-dom/test-utils';
import ReactTestUtils from 'react-dom/test-utils';
import { book as archiveBook } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { formatBookData } from '../utils';

const dummyBook = {
  ...formatBookData(archiveBook, mockCmsBook),
  content_warning_text: 'some warning text',
};

describe('ContentWarning', () => {
  it('renders warning modal', async() => {
    renderToDom(<ContentWarning book={dummyBook} />);

    const root = document?.body;
    const b = root?.querySelector('button');

    expect(b).toBeTruthy();
    // Exercises the when-focus-is-already-in-the-modal branch
    b!.focus();
    act(() => ReactTestUtils.Simulate.click(b!));
    expect(root?.querySelector('button')).toBeFalsy();
  });
});
