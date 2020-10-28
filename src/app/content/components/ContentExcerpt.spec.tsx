import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { routes } from '..';
import createTestStore from '../../../test/createTestStore';
import { book } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import MessageProvider from '../../MessageProvider';
import { Store } from '../../types';
import { receiveBook } from '../actions';
import { formatBookData } from '../utils';
import * as contentManipulation from '../utils/contentManipulation';
import ContentExcerpt from './ContentExcerpt';

describe('ContentExcerpt', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  const render = (sourcePage: string, content: string) => renderer.create(<Provider store={store}>
    <MessageProvider>
      <ContentExcerpt
        content={content}
        sourcePageId={sourcePage}
        className='class1'
      />
    </MessageProvider>
  </Provider>);

  it('fixes urls in content using addTargetBlank and fixRelative', () => {
    const originalHtml = '<a href="#hello"></a>';
    const htmlWithTargetBlank = '<a href="#hello" target="_blank"></a>';
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));

    const getUrlSpy = jest.spyOn(routes.content, 'getUrl')
      .mockReturnValueOnce('/book/book1/page/testbook1-testpage1-uuid');

    const addTargetBlankToLinksMock = jest.spyOn(contentManipulation, 'addTargetBlankToLinks')
      .mockReturnValueOnce(htmlWithTargetBlank);

    const fixRelativeURLsMock = jest.spyOn(contentManipulation, 'fixRelativeURLs').mockReturnValueOnce(
      '<a href="/book/book1/page/testbook1-testpage1-uuid#hello" target="_blank"></a>'
    );

    render('testbook1-testpage1-uuid', originalHtml);

    expect(getUrlSpy).toHaveBeenCalled();
    expect(addTargetBlankToLinksMock).toHaveBeenCalledWith(originalHtml);
    expect(fixRelativeURLsMock)
      .toHaveBeenCalledWith(htmlWithTargetBlank, '/book/book1/page/testbook1-testpage1-uuid');
  });

  it('throws error when book is not loaded', () => {
    expect(() => {
      render('testbook1-testpage1-uuid', '<a href="#hello"></a>');
    }).toThrowError(new Error('book not loaded'));
  });

  it('throws error when page is not loaded', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));

    expect(() => {
      render('page1', '<a href="#hello"></a>');
    }).toThrowError(new Error('page not found in book'));
  });
});
