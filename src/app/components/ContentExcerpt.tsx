import { Highlight } from '@openstax/highlighter/dist/api';
import { HTMLAnchorElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { content } from '../content/routes';
import { book } from '../content/selectors';
import { BookWithOSWebData } from '../content/types';
import { fromRelativeUrl, getUrlParamForPageId } from '../content/utils/urlUtils';
import { bodyCopyRegularStyle } from './Typography';

// tslint:disable-next-line:variable-name
export const HighlightContent = styled.div`
  ${bodyCopyRegularStyle}
  overflow: auto;

  * {
    overflow: initial;
  }
`;

interface Props {
  highlight: Highlight;
  content: any;
  className: string;
}

// tslint:disable-next-line:variable-name
const ContentExcerpt = (props: Props) => {
  const currentBook = useSelector(book);

  if (!currentBook) {
    return null;
  }

  const absolutePath = content.getUrl({
    book: {
      slug: (currentBook as BookWithOSWebData).slug,
    },
    page: getUrlParamForPageId(currentBook, props.highlight.sourceId),
  });

  const parser = new DOMParser();
  const domNode = parser.parseFromString(props.content, 'text/html');
  domNode.querySelectorAll('a').forEach(
    (a: HTMLAnchorElement) => {
      const currentHref = a.getAttribute('href') || '';
      return a.setAttribute('href', fromRelativeUrl(currentHref, absolutePath));
    }
  );

  return <HighlightContent
    className={props.className}
    data-highlight-id={props.highlight.id}
    dangerouslySetInnerHTML={{ __html: domNode.body.innerHTML }}
  />;
};

export default ContentExcerpt;
