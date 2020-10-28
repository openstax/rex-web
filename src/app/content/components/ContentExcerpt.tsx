import flow from 'lodash/fp/flow';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { bodyCopyRegularStyle } from '../../components/Typography';
import { assertDefined } from '../../utils';
import { book } from '../selectors';
import { findArchiveTreeNodeById } from '../utils/archiveTreeUtils';
import { addTargetBlankToLinks, fixRelativeURLs } from '../utils/contentManipulation';
import { getBookPageUrlAndParams } from '../utils/urlUtils';

interface Props {
  content: string;
  className: string;
  sourcePageId: string;
}

// tslint:disable-next-line:variable-name
const ContentExcerpt = styled((props: Props) => {
  const {
    content,
    className,
    sourcePageId,
    ...excerptProps
  } = props;

  const currentBook = assertDefined(useSelector(book), 'book not loaded');
  const sourcePage = assertDefined(findArchiveTreeNodeById(currentBook.tree, sourcePageId), 'page not found in book');

  const excerptSource = getBookPageUrlAndParams(
    currentBook,
    sourcePage
  );

  const fixedContent = React.useMemo(() => flow(
    addTargetBlankToLinks,
    (newContent) => fixRelativeURLs(newContent, excerptSource.url)
  )(props.content), [props.content, excerptSource.url]);

  return <div
    dangerouslySetInnerHTML={{ __html: fixedContent }}
    className={`content-excerpt ${className}`}
    {...excerptProps}
  />;
})`
  ${bodyCopyRegularStyle}
  overflow: auto;

  * {
    overflow: initial;
  }
`;

export default ContentExcerpt;
