import React from 'react';
import renderer from 'react-test-renderer';
import { routes } from '..';
import createTestStore from '../../../test/createTestStore';
import { book } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import TestContainer from '../../../test/TestContainer';
import { AppState, Store } from '../../types';
import { receiveBook } from '../actions';
import { LinkedArchiveTreeSection } from '../types';
import { formatBookData } from '../utils';
import { findArchiveTreeNodeById } from '../utils/archiveTreeUtils';
import * as contentManipulation from '../utils/contentManipulation';
import ContentExcerpt from './ContentExcerpt';

describe('ContentExcerpt', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  const mockSection = findArchiveTreeNodeById(book.tree, 'testbook1-testpage1-uuid') as LinkedArchiveTreeSection;

  const render = (sourcePage: string | LinkedArchiveTreeSection, content: string) => renderer.create(
    <TestContainer store={store}>
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
      .mockReturnValue('/book/book1/page/testbook1-testpage1-uuid');

    const addTargetBlankToLinksMock = jest.spyOn(contentManipulation, 'addTargetBlankToLinks')
      .mockReturnValueOnce(htmlWithTargetBlank);

    const rebaseRelativeContentLinksMock = jest.spyOn(contentManipulation, 'rebaseRelativeContentLinks')
      .mockReturnValueOnce('<a href="/book/book1/page/testbook1-testpage1-uuid#hello" target="_blank"></a>');

    render(mockSection, originalHtml);

    expect(getUrlSpy).toHaveBeenCalled();
    expect(addTargetBlankToLinksMock).toHaveBeenCalledWith(originalHtml);
    expect(rebaseRelativeContentLinksMock)
      .toHaveBeenCalledWith(htmlWithTargetBlank, '/book/book1/page/testbook1-testpage1-uuid');
    getUrlSpy.mockRestore();
  });

  it('keeps links in the current portal but not resources', () => {
    store = createTestStore({
      navigation: { match: { params: { portalName: 'my-portal' } } },
    } as unknown as AppState);
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));

    const component = render(mockSection, '<a href="./other-page"></a><img src="../resources/image.jpg">');
    const html = component.root.findAll((node) => Boolean(node.props.dangerouslySetInnerHTML))[0]
      .props.dangerouslySetInnerHTML.__html;

    expect(html).toContain('href="/apps/rex/portal/my-portal/books/');
    expect(html).not.toContain('src="/apps/rex/portal/');
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
