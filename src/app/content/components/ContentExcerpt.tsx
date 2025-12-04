import flow from 'lodash/fp/flow';
import React, { HTMLAttributes } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import DynamicContentStyles from '../../components/DynamicContentStyles';
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

interface Props extends HTMLAttributes<HTMLDivElement> {
  content: string;
  className?: string;
  source: string | LinkedArchiveTreeSection;
  forwardedRef?: React.Ref<HTMLElement>;
  disableDynamicContentStyles?: boolean;
}

// tslint:disable-next-line:variable-name
const ContentExcerpt = (props: Props) => {
  const {
    content,
    className,
    source,
    forwardedRef,
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

  return <DynamicContentStyles
    book={currentBook}
    ref={forwardedRef}
    dangerouslySetInnerHTML={{ __html: fixedContent }}
    className={`content-excerpt ${className}`}
    {...excerptProps}
  />;
};

export default styled(React.forwardRef<HTMLElement, Props>(
  (props, ref) => <ContentExcerpt {...props} forwardedRef={ref} />)
)`
  ${bodyCopyRegularStyle}
  overflow: auto;
  padding: 0.8rem 0;

  * {
    overflow: initial;
  }
`;
