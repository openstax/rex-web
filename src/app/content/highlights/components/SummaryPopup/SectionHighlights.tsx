import React from 'react';
import { assertDefined } from '../../../../utils';
import { archiveTreeSectionIsChapter, findArchiveTreeNode } from '../../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../../utils/idUtils';
import { OrderedSummaryHighlights } from '../../types';
import HighlightListElement from './HighlightListElement';
import StudyGuidesListElement from './StudyGuidesListElement';
import { HighlightsChapter, HighlightsChapterWrapper, HighlightSection, HighlightWrapper } from './styles';

interface SectionHighlightsProps {
  highlightDataInSection: OrderedSummaryHighlights[0];
  forStudyGuides?: boolean;
}

// tslint:disable-next-line: variable-name
export const SectionHighlights = (
  { highlightDataInSection: {pages, location}, forStudyGuides = false }: SectionHighlightsProps
) => {
  const pageIdIsSameAsSectionId = pages.every((highlights) => highlights.pageId === location.id);

  return (
    <React.Fragment>
      <HighlightsChapterWrapper>
        <HighlightsChapter data-testid='chapter-title' dangerouslySetInnerHTML={{ __html: location.title }} />
      </HighlightsChapterWrapper>
      {pages.map(({pageId, highlights}) => {
        const page = assertDefined(
          archiveTreeSectionIsChapter(location)
            ? findArchiveTreeNode(location, stripIdVersion(pageId))
            : location,
          `Page is undefined in SectionHighlights`
        );
        return <HighlightWrapper key={pageId}>
          {!pageIdIsSameAsSectionId && <HighlightSection data-testid='section-title'
            dangerouslySetInnerHTML={{ __html: page.title }}
          />}
          {highlights.map((item) => {
            if (forStudyGuides) {
              return <StudyGuidesListElement
                key={item.id}
                highlight={item}
              />;
            } else {
              return <HighlightListElement
                key={item.id}
                highlight={item}
                locationFilterId={location.id}
                pageId={pageId}
              />;
            }
          })}
        </HighlightWrapper>;
      })}
    </React.Fragment>
  );
};
