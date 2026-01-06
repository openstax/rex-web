import React from 'react';
import styled, { css } from 'styled-components/macro';
import { h4Style, labelStyle } from '../../components/Typography';
import theme from '../../theme';
import { assertDefined } from '../../utils';
import { HighlightData, OrderedSummaryHighlights } from '../highlights/types';
import {
  desktopHorizontalMargin,
  desktopVerticalMargin,
  mobileMarginSides,
  mobilePaddingSides,
} from '../styles/PopupConstants';
import { popupBodyPadding, popupPadding } from '../styles/PopupStyles';
import {
  archiveTreeSectionIsAnswerKey,
  archiveTreeSectionIsChapter,
  findArchiveTreeNodeById,
} from '../utils/archiveTreeUtils';
import { stripIdVersion } from '../utils/idUtils';

export const HighlightsChapterWrapper = styled.div`
  display: flex;
  align-items: center;
  min-height: 5.6rem;
  padding: 0 ${popupPadding}rem;
  ${theme.breakpoints.mobile(css`
    padding: 0 ${mobilePaddingSides}rem;
  `)}
`;

const HighlightsChapter = styled.h2`
  ${h4Style}
  font-weight: bold;
  display: flex;
  align-items: baseline;
  width: 100%;

  .os-number {
    overflow: visible;
  }

  @media print {
    padding: 0;
    background: white;
  }

  > .os-text {
    white-space: break-spaces;
  }
`;

export const HighlightWrapper = styled.div`
  margin: ${desktopVerticalMargin}rem ${desktopHorizontalMargin}rem;
  border: solid 0.1rem ${theme.color.neutral.darkest};
  ${theme.breakpoints.mobile(css`
    margin: 0 0 ${mobileMarginSides * 2}rem 0;
  `)}
  overflow: visible;

  @media print {
    border-width: 0;
  }
`;

export const HighlightSection = styled.h3`
  ${labelStyle}
  padding: 0 ${popupBodyPadding}rem 0 ${popupPadding}rem;
  background: ${theme.color.neutral.darkest};
  height: 3.2rem;
  display: flex;
  align-items: center;
  font-weight: bold;

  > .os-number,
  > .os-divider,
  > .os-text {
    overflow: hidden;
  }

  > .os-number,
  > .os-divider {
    flex-shrink: 0;
  }

  > .os-text {
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  @media print {
    break-after: avoid;
    break-inside: avoid;
    background: white;
  }
`;

interface SectionHighlightsProps {
  highlightDataInSection: OrderedSummaryHighlights[0];
  highlightRenderer: (highlight: HighlightData, pageId: string) => JSX.Element;
}

const SectionHighlights = (
  { highlightDataInSection: {pages, location}, highlightRenderer }: SectionHighlightsProps
) => {
  const pageIdIsSameAsSectionId = pages.every((highlights) => highlights.pageId === location.id);

  return (
    <React.Fragment>
      <HighlightsChapterWrapper>
        <HighlightsChapter data-testid='chapter-title' dangerouslySetInnerHTML={{ __html: location.title }} />
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
