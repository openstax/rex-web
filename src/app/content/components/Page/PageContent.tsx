import { HTMLDivElement } from '@openstax/types/lib.dom';
import Color from 'color';
import React from 'react';
import classNames from 'classnames';
import MainContent from '../../../components/MainContent';
import theme from '../../../theme';
import { highlightStyles } from '../../constants';
import {
  highlightBlockPadding,
  highlightIndicatorSize,
  highlightIndicatorSizeForBlock,
} from '../../highlights/constants';
import './PageContent.css';

// Re-export contentTextStyle for backward compatibility
export { contentTextStyle } from './PageContent.legacy';

interface PageContentProps extends React.ComponentProps<typeof MainContent> {
  className?: string;
}

// Generate dynamic highlight CSS based on highlightStyles array
const highlightCSS = highlightStyles.map((style) => {
  const isDark = Color(style.focused).isDark();
  const textColor = isDark ? theme.color.text.white : '';

  return `
    .highlight.${style.label} {
      background-color: ${style.passive};
    }

    .highlight.${style.label}.block {
      display: block;
    }

    .highlight.${style.label}.block:after {
      position: absolute;
      z-index: -1;
      content: "";
      display: block;
      top: -1rem;
      bottom: -1rem;
      left: -1rem;
      right: -1rem;
      background-color: ${style.passive};
    }

    .highlight.${style.label}.block.first.has-note:before {
      position: absolute;
      top: -${highlightBlockPadding}rem;
      left: -${highlightBlockPadding}rem;
      content: "";
      width: 0;
      height: 0;
      opacity: 0.8;
      border-left: ${highlightIndicatorSizeForBlock}em solid ${style.focused};
      border-bottom: ${highlightIndicatorSizeForBlock}em solid transparent;
    }

    .highlight.${style.label}.first.text.has-note:after {
      position: absolute;
      top: 0;
      left: 0;
      content: "";
      width: 0;
      height: 0;
      opacity: 0.8;
      border-left: ${highlightIndicatorSize}em solid ${style.focused};
      border-top: ${highlightIndicatorSize}em solid transparent;
      transform: rotate(90deg);
    }

    @media screen {
      .highlight.${style.label}[aria-current] {
        background-color: ${style.focused};
        border-bottom: 0.2rem solid ${style.focusBorder};
        padding: 0.2rem 0 0;
        ${textColor ? `color: ${textColor};` : ''}
      }

      .highlight.${style.label}[aria-current].block:after {
        background-color: ${style.focused};
      }

      .highlight.${style.label}[aria-current].first.text.has-note:after {
        display: none;
      }
    }
  `;
}).join('\n');

/**
 * PageContent component - Main content area for book pages
 *
 * Migrated from styled-components to plain CSS. The highlight styles are generated
 * dynamically based on highlightStyles array from constants.ts and injected via
 * an inline <style> tag to avoid code duplication.
 *
 * Note: Wrapped with React.forwardRef to support ref forwarding to MainContent
 */
const PageContent = React.forwardRef<HTMLDivElement, PageContentProps>(
  function PageContent({ className, children, ...props }, ref) {

    return (
      <>
        {/* Inject dynamic highlight styles */}
        <style dangerouslySetInnerHTML={{ __html: highlightCSS }} />

        <MainContent
          ref={ref}
          className={classNames('page-content', className)}
          style={{
            '--page-padding-desktop': theme.padding.page.desktop,
            '--page-padding-mobile': theme.padding.page.mobile,
          } as React.CSSProperties}
          {...props}
        >
          {children}
        </MainContent>
      </>
    );
  }
);

export default PageContent;
