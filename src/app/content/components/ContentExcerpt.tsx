import flow from 'lodash/fp/flow';
import React, { HTMLAttributes, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { bodyCopyRegularStyle } from '../../components/Typography';
import { useServices } from '../../context/Services';
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
  const services = useServices();
  const [excerptSourceUrl, setExcerptSourceUrl] = React.useState('');
  const currentBook = assertDefined(useSelector(book), 'book not loaded');
  const sourcePage = typeof source === 'string'
    ? assertDefined(findArchiveTreeNodeById(currentBook.tree, source), 'page not found in book')
    : source;

  useEffect(() => {
    const setBookPageUrlAndParams = async() => {
      const { url } = await getBookPageUrlAndParams(
        currentBook,
        sourcePage,
        services.bookConfigLoader
      );
      setExcerptSourceUrl(url);
    };
    setBookPageUrlAndParams();
  });

  const fixedContent = React.useMemo(() => flow(
    addTargetBlankToLinks,
    (newContent) => rebaseRelativeContentLinks(newContent, excerptSourceUrl),
    (newContent) => resolveRelativeResources(newContent, excerptSourceUrl)
  )(props.content), [props.content, excerptSourceUrl]);

  return <div
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

  * {
    overflow: initial;
  }
`;
