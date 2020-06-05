import React from 'react';
import { assertDefined } from '../../../../utils';
import { archiveTreeSectionIsChapter, findArchiveTreeNode } from '../../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../../utils/idUtils';
import { OrderedSummaryHighlights } from '../../types';
import * as Styled from '../ShowMyHighlightsStyles';
import HighlightListElement from './HighlightListElement';

interface SectionHighlightsProps {
  highlightDataInSection: OrderedSummaryHighlights[0];
}

// tslint:disable-next-line: variable-name
export const SectionHighlights = ({ highlightDataInSection: {pages, location}}: SectionHighlightsProps) => {
  const pageIdIsSameAsSectionId = pages.every((highlights) => highlights.pageId === location.id);

  return (
    <React.Fragment>
      <Styled.HighlightsChapterWrapper>
        <Styled.HighlightsChapter data-testid='chapter-title' dangerouslySetInnerHTML={{ __html: location.title }} />
      </Styled.HighlightsChapterWrapper>
      {pages.map(({pageId, highlights}) => {
        const page = assertDefined(
          archiveTreeSectionIsChapter(location)
            ? findArchiveTreeNode(location, stripIdVersion(pageId))
            : location,
          `Page is undefined in SectionHighlights`
        );
        return <Styled.HighlightWrapper key={pageId}>
          {!pageIdIsSameAsSectionId && <Styled.HighlightSection data-testid='section-title'
            dangerouslySetInnerHTML={{ __html: page.title }}
          />}
          {highlights.map((item) => <HighlightListElement
            key={item.id}
            highlight={item}
            locationFilterId={location.id}
            pageId={pageId}
          />)}
        </Styled.HighlightWrapper>;
      })}
    </React.Fragment>
  );
};
