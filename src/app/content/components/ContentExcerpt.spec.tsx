import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { routes } from '..';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import TestContainer from '../../../test/TestContainer';
import * as Services from '../../context/Services';
import MessageProvider from '../../MessageProvider';
import { Store } from '../../types';
import { receiveBook } from '../actions';
import { LinkedArchiveTreeSection } from '../types';
import { formatBookData } from '../utils';
import { findArchiveTreeNodeById } from '../utils/archiveTreeUtils';
import * as contentManipulation from '../utils/contentManipulation';
import ContentExcerpt from './ContentExcerpt';

describe('ContentExcerpt', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();
  });

  const mockSection = findArchiveTreeNodeById(book.tree, 'testbook1-testpage1-uuid') as LinkedArchiveTreeSection;

  const render = (sourcePage: string | LinkedArchiveTreeSection, content: string) => renderer.create(
    <TestContainer>
      <ContentExcerpt
        content={content}
        source={sourcePage}
        className='class1'
      />
    </TestContainer>
  );

  it('fixes urls in content using addTargetBlank and resolveRelative', () => {
    const originalHtml = '<a href="#hello"></a>';
    const htmlWithTargetBlank = '<a href="#hello" target="_blank"></a>';
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));

    const getUrlSpy = jest.spyOn(routes.content, 'getUrl')
      .mockReturnValueOnce('/book/book1/page/testbook1-testpage1-uuid');

    const addTargetBlankToLinksMock = jest.spyOn(contentManipulation, 'addTargetBlankToLinks')
      .mockReturnValueOnce(htmlWithTargetBlank);

    const rebaseRelativeContentLinksMock = jest.spyOn(contentManipulation, 'rebaseRelativeContentLinks')
      .mockReturnValueOnce('<a href="/book/book1/page/testbook1-testpage1-uuid#hello" target="_blank"></a>');

    render(mockSection, originalHtml);

    expect(getUrlSpy).toHaveBeenCalled();
    expect(addTargetBlankToLinksMock).toHaveBeenCalledWith(originalHtml);
    expect(rebaseRelativeContentLinksMock)
      .toHaveBeenCalledWith(htmlWithTargetBlank, '/book/book1/page/testbook1-testpage1-uuid');
  });

  it('throws error when book is not loaded', () => {
    expect(() => {
      render(mockSection, '<a href="#hello"></a>');
    }).toThrowError(new Error('book not loaded'));
  });

  it('throws error when page is not loaded', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));

    expect(() => {
      render('page1', '<a href="#hello"></a>');
    }).toThrowError(new Error('page not found in book'));
  });
});
