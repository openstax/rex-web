import flow from 'lodash/fp/flow';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { bodyCopyRegularStyle } from '../../components/Typography';
import { assertDefined } from '../../utils';
import { book } from '../selectors';
import { LinkedArchiveTreeSection } from '../types';
import { findArchiveTreeNodeById } from '../utils/archiveTreeUtils';
import {
  addTargetBlankToLinks,
  rebaseRelativeContentLinks,
  resolveRelativeResources,
} from '../utils/contentManipulation';
import { getBookPageUrlAndParams } from '../utils/urlUtils';

interface Props {
  content: string;
  className: string;
  source: string | LinkedArchiveTreeSection;
}

// tslint:disable-next-line:variable-name
const ContentExcerpt = styled((props: Props) => {
  const {
    content,
    className,
    source,
    ...excerptProps
  } = props;

  const currentBook = assertDefined(useSelector(book), 'book not loaded');
  const sourcePage = typeof source === 'string'
    ? assertDefined(findArchiveTreeNodeById(currentBook.tree, source), 'page not found in book')
    : source;

  const excerptSource = getBookPageUrlAndParams(
    currentBook,
    sourcePage
  );

  const fixedContent = React.useMemo(() => flow(
    addTargetBlankToLinks,
    (newContent) => rebaseRelativeContentLinks(newContent, excerptSource.url),
    (newContent) => resolveRelativeResources(newContent, excerptSource.url)
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
