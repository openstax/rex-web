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
  rebaseRelativeResources,
} from '../utils/contentManipulation';
import { getBookPageUrlAndParams } from '../utils/urlUtils';

// tslint:disable-next-line: variable-name
const StyledContentExcerpt = styled.div`
  ${bodyCopyRegularStyle}
  overflow: auto;

  * {
    overflow: initial;
  }
`;

interface Props {
  content: string;
  className?: string;
  source: string | LinkedArchiveTreeSection;
  forwardedRef?: React.Ref<HTMLElement>;
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
    (newContent) => rebaseRelativeResources(newContent, excerptSource.url)
  )(props.content), [props.content, excerptSource.url]);

  return <StyledContentExcerpt
    ref={forwardedRef}
    dangerouslySetInnerHTML={{ __html: fixedContent }}
    className={`content-excerpt ${className}`}
    {...excerptProps}
  />;
};

export default React.forwardRef<
  HTMLElement,
  Omit<React.ComponentProps<typeof ContentExcerpt>, 'forwardedRef'>
>((props, ref) => (
  <ContentExcerpt {...props} forwardedRef={ref} />
));
