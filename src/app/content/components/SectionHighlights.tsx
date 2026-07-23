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
 */
export function HighlightsChapterWrapper({
  children,
  style,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={['highlights-chapter-wrapper', className].filter(Boolean).join(' ')}
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
 */
function HighlightWrapper({
  children,
  style,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={['highlight-wrapper', className].filter(Boolean).join(' ')}
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
 * HighlightSection component - exported only for test reference
 */
export function HighlightSection({
  children,
  style,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      {...props}
      className={['highlight-section', className].filter(Boolean).join(' ')}
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
