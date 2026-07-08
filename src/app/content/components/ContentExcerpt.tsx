import flow from 'lodash/fp/flow';
import React, { HTMLAttributes } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import DynamicContentStyles from '../../components/DynamicContentStyles';
import { linkColor, linkHover } from '../../components/Typography/Links.constants';
import theme from '../../theme';
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
import './ContentExcerpt.css';

interface Props extends HTMLAttributes<HTMLDivElement> {
  content: string;
  className?: string;
  source: string | LinkedArchiveTreeSection;
  disableDynamicContentStyles?: boolean;
}

/**
 * ContentExcerpt component - Displays content excerpts with proper link handling
 *
 * Migrated from styled-components to plain CSS.
 */
const ContentExcerpt = React.forwardRef<HTMLElement, Props>(
  function ContentExcerpt(props, ref) {
    const {
      content,
      className,
      source,
      style,
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
      ref={ref}
      dangerouslySetInnerHTML={{ __html: fixedContent }}
      className={classNames('content-excerpt', className)}
      style={{
        '--text-color': theme.color.text.default,
        '--link-color': linkColor,
        '--link-hover': linkHover,
        ...style,
      } as React.CSSProperties}
      {...excerptProps}
    />;
  }
);

export default ContentExcerpt;
