import React from 'react';
import theme from '../../theme';
import { assertDefined } from '../../utils';
import { HighlightData, OrderedSummaryHighlights } from '../highlights/types';
import {
  desktopHorizontalMargin,
  desktopVerticalMargin,
  mobileMarginSides,
  mobilePaddingSides,
  popupBodyPadding,
  popupPadding,
} from '../styles/PopupConstants';
import {
  archiveTreeSectionIsAnswerKey,
  archiveTreeSectionIsChapter,
  findArchiveTreeNodeById,
} from '../utils/archiveTreeUtils';
import { stripIdVersion } from '../utils/idUtils';
import './SectionHighlights.css';

/**
 * HighlightsChapterWrapper component
 * Migrated from styled-components to plain CSS
 */
export function HighlightsChapterWrapper({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className="highlights-chapter-wrapper"
      style={{
        '--popup-padding': `${popupPadding}rem`,
        '--mobile-padding-sides': `${mobilePaddingSides}rem`,
        ...style,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * HighlightWrapper component
 * Migrated from styled-components to plain CSS
 */
export function HighlightWrapper({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className="highlight-wrapper"
      style={{
        '--desktop-vertical-margin': `${desktopVerticalMargin}rem`,
        '--desktop-horizontal-margin': `${desktopHorizontalMargin}rem`,
        '--mobile-margin-sides': `${mobileMarginSides}rem`,
        '--neutral-darkest': theme.color.neutral.darkest,
        ...style,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * HighlightSection component
 * Migrated from styled-components to plain CSS
 */
export function HighlightSection({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      {...props}
      className="highlight-section"
      style={{
        '--text-color': theme.color.text.default,
        '--popup-body-padding': `${popupBodyPadding}rem`,
        '--popup-padding': `${popupPadding}rem`,
        '--neutral-darkest': theme.color.neutral.darkest,
        ...style,
      } as React.CSSProperties}
    >
      {children}
    </h3>
  );
}

interface SectionHighlightsProps {
  highlightDataInSection: OrderedSummaryHighlights[0];
  highlightRenderer: (highlight: HighlightData, pageId: string) => JSX.Element;
}

/**
 * SectionHighlights component
 * Migrated from styled-components to plain CSS
 */
const SectionHighlights = (
  { highlightDataInSection: {pages, location}, highlightRenderer }: SectionHighlightsProps
) => {
  const pageIdIsSameAsSectionId = pages.every((highlights) => highlights.pageId === location.id);

  return (
    <React.Fragment>
      <HighlightsChapterWrapper>
        <h2
          className="highlights-chapter"
          data-testid='chapter-title'
          dangerouslySetInnerHTML={{ __html: location.title }}
          style={{
            '--text-color': theme.color.text.default,
          } as React.CSSProperties}
        />
      </HighlightsChapterWrapper>
      {pages.map(({pageId, highlights}) => {
        const page = assertDefined(
          (archiveTreeSectionIsChapter(location) || archiveTreeSectionIsAnswerKey(location))
            ? findArchiveTreeNodeById(location, stripIdVersion(pageId))
            : location,
          `Page is undefined in SectionHighlights`
        );
        return <HighlightWrapper key={pageId}>
          {!pageIdIsSameAsSectionId && <HighlightSection data-testid='section-title'
            dangerouslySetInnerHTML={{ __html: page.title }}
          />}
          {highlights.map((highlight) => highlightRenderer(highlight, pageId))}
        </HighlightWrapper>;
      })}
    </React.Fragment>
  );
};

export default SectionHighlights;
