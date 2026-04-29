import Color from 'color';
import React from 'react';
import classNames from 'classnames';
import { HTMLDivElement } from '@openstax/types/lib.dom';
import MainContent from '../../../components/MainContent';
import theme from '../../../theme';
import { TextResizerValue } from '../../constants';
import { State } from '../../types';
import { highlightStyles } from '../../constants';
import {
  highlightBlockPadding,
  highlightIndicatorSize,
  highlightIndicatorSizeForBlock,
} from '../../highlights/constants';
import { contentTextWidth } from '../constants';
import './PageContent.css';

interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  book?: State['book'];
  className?: string;
  dangerouslySetInnerHTML?: { __html: string; };
  style?: React.CSSProperties;
  textSize?: TextResizerValue;
}

// Generate dynamic highlight styles once at module level
const dynamicHighlightStyles = highlightStyles.map((highlightStyle) => {
  const isDark = Color(highlightStyle.focused).isDark();

  return `
    .page-content .highlight.${highlightStyle.label} {
      background-color: ${highlightStyle.passive};
    }

    .page-content .highlight.${highlightStyle.label}.block {
      display: block;
    }

    .page-content .highlight.${highlightStyle.label}.block:after {
      position: absolute;
      z-index: -1;
      content: "";
      display: block;
      top: -1rem;
      bottom: -1rem;
      left: -1rem;
      right: -1rem;
      background-color: ${highlightStyle.passive};
    }

    .page-content .highlight.${highlightStyle.label}.block.first.has-note:before {
      position: absolute;
      top: -${highlightBlockPadding}rem;
      left: -${highlightBlockPadding}rem;
      content: "";
      width: 0;
      height: 0;
      opacity: 0.8;
      border-left: ${highlightIndicatorSizeForBlock}em solid ${highlightStyle.focused};
      border-bottom: ${highlightIndicatorSizeForBlock}em solid transparent;
    }

    .page-content .highlight.${highlightStyle.label}.first.text.has-note:after {
      position: absolute;
      top: 0;
      left: 0;
      content: "";
      width: 0;
      height: 0;
      opacity: 0.8;
      border-left: ${highlightIndicatorSize}em solid ${highlightStyle.focused};
      border-top: ${highlightIndicatorSize}em solid transparent;
      transform: rotate(90deg);
    }

    @media screen {
      .page-content .highlight.${highlightStyle.label}[aria-current] {
        background-color: ${highlightStyle.focused};
        border-bottom: 0.2rem solid ${highlightStyle.focusBorder};
        padding: 0.2rem 0 0;
        ${isDark ? `color: ${theme.color.text.white};` : ''}
      }

      .page-content .highlight.${highlightStyle.label}[aria-current].block:after {
        background-color: ${highlightStyle.focused};
      }

      .page-content .highlight.${highlightStyle.label}[aria-current].first.text.has-note:after {
        display: none;
      }
    }
  `;
}).join('\n');

// Track if styles have been injected globally to avoid duplicates
let stylesInjected = false;

// Inject dynamic highlight styles once globally
function injectHighlightStyles() {
  if (typeof document !== 'undefined' && !stylesInjected) {
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-page-content-highlights', '');
    styleElement.textContent = dynamicHighlightStyles;
    document.head.appendChild(styleElement);
    stylesInjected = true;
  }
}

/**
 * PageContent component - Main content container for book pages
 *
 * Migrated from styled-components to plain CSS.
 * Dynamic highlight styles are generated as inline <style> tag.
 */
const PageContent = React.forwardRef<HTMLDivElement, React.PropsWithChildren<PageContentProps>>(
  ({ book, className, dangerouslySetInnerHTML, textSize, style, children, ...props }, ref) => {
    // Inject highlight styles once globally on first mount
    React.useEffect(() => {
      injectHighlightStyles();
    }, []);

    // Only add 'page-content' if not already present to avoid duplication
    const hasPageContentClass = className?.includes('page-content');
    const finalClassName = hasPageContentClass ? className : classNames('page-content', className);

    return (
      <MainContent
        {...props}
        ref={ref}
        book={book}
        dangerouslySetInnerHTML={dangerouslySetInnerHTML}
        textSize={textSize}
        className={finalClassName}
        style={{
          '--content-text-width': `${contentTextWidth}rem`,
          '--page-margin-top-desktop': `${theme.padding.page.desktop}rem`,
          '--page-margin-top-mobile': `${theme.padding.page.mobile}rem`,
          ...style,
        } as React.CSSProperties}
      >
        {children}
      </MainContent>
    );
  }
);

export default PageContent;
