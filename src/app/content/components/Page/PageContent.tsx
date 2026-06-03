import Color from 'color';
import React from 'react';
import classNames from 'classnames';
import { HTMLDivElement } from '@openstax/types/lib.dom';
import MainContent from '../../../components/MainContent';
import theme from '../../../theme';
import { TextResizerValue } from '../../constants';
import { State } from '../../types';
import { highlightStyles } from '../../constants';
import { contentTextWidth } from '../constants';
import './PageContent.css';

interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  book?: State['book'];
  className?: string;
  dangerouslySetInnerHTML?: { __html: string; };
  style?: React.CSSProperties;
  textSize?: TextResizerValue;
}

/**
 * PageContent component - Main content container for book pages
 *
 * Migrated from styled-components to plain CSS.
 * Highlight color styles are now defined in PageContent.css using CSS variables.
 */
const PageContent = React.forwardRef<HTMLDivElement, React.PropsWithChildren<PageContentProps>>(
  ({ book, className, dangerouslySetInnerHTML, textSize, style, children, ...props }, ref) => {
    // Compute dynamic text colors for dark focused highlight backgrounds
    // This needs to be done in JavaScript, but the result is set as CSS variables
    const dynamicTextColorVars = React.useMemo(() => {
      const vars: Record<string, string> = {};
      highlightStyles.forEach((highlightStyle) => {
        const isDark = Color(highlightStyle.focused).isDark();
        if (isDark) {
          vars[`--highlight-${highlightStyle.label}-text`] = 'var(--color-text-white)';
        }
      });
      return vars;
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
          ...dynamicTextColorVars,
          ...style,
        } as React.CSSProperties}
      >
        {children}
      </MainContent>
    );
  }
);

export default PageContent;
