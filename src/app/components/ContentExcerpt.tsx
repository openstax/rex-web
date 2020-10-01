import { Highlight } from '@openstax/highlighter/dist/api';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { book } from '../content/selectors';
import { BookWithOSWebData } from '../content/types';
import addTargetBlankToLinks from '../content/utils/addTargetBlankToLinks';
import { findArchiveTreeNodeById } from '../content/utils/archiveTreeUtils';
import { getBookPageUrlAndParams } from '../content/utils/urlUtils';
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
  highlight?: Highlight;
  content: string;
  className: string;
}

// tslint:disable-next-line:variable-name
const ContentExcerpt = (props: Props) => {
  const currentBook = useSelector(book)!;

  const page = findArchiveTreeNodeById((currentBook as BookWithOSWebData).tree, props.highlight!.sourceId);
  const getUrl = getBookPageUrlAndParams(currentBook, page!).url;

  const fixedContent = React.useMemo(
    () => addTargetBlankToLinks(props.content, getUrl),
    [props.content]);

  return <HighlightContent
    className={props.className}
    data-highlight-id={props.highlight!.id}
    dangerouslySetInnerHTML={{ __html: fixedContent }}
  />;
};

export default ContentExcerpt;
