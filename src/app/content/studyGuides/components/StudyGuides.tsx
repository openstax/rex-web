import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useSelector } from 'react-redux';
import { typesetMath } from '../../../../helpers/mathjax';
import Loader from '../../../components/Loader';
import { useServices } from '../../../context/Services';
import { assertDefined, assertWindow } from '../../../utils';
import allImagesLoaded from '../../components/utils/allImagesLoaded';
import * as Styled from '../../highlights/components/ShowMyHighlightsStyles';
import HighlightListElement from '../../highlights/components/SummaryPopup/HighlightListElement';
import { archiveTreeSectionIsChapter, findArchiveTreeNode } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import * as selectors from '../selectors';
import { OrderedSummaryHighlights } from '../types';

// tslint:disable-next-line: variable-name
const Highlights = () => {
  const orderedHighlights = useSelector(selectors.orderedStudyGuidesHighlights);
  const isLoading = useSelector(selectors.studyGuidesIsLoading);
  const container = React.useRef<HTMLElement>(null);
  const services = useServices();

  React.useLayoutEffect(() => {
    if (container.current) {
      services.promiseCollector.add(allImagesLoaded(container.current));
      services.promiseCollector.add(typesetMath(container.current, assertWindow()));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps, ignore promiseCollector
  }, [orderedHighlights]);

  return <React.Fragment>
    {isLoading ? <Styled.LoaderWrapper><Loader large /></Styled.LoaderWrapper> : null}
    {orderedHighlights && <Styled.Highlights ref={container}>
      {orderedHighlights.map((highlightData) => {
        return <SectionHighlights
          key={highlightData.location.id}
          highlightDataInSection={highlightData}
        />;
      })}
    </Styled.Highlights>}
  </React.Fragment>;
};

export default Highlights;

interface SectionHighlightsProps {
  highlightDataInSection: OrderedSummaryHighlights[0];
}

// tslint:disable-next-line: variable-name
export const SectionHighlights = ({ highlightDataInSection: {pages, location}}: SectionHighlightsProps) => {
  const pageIdIsSameAsSectionId = pages.every((highlights) => highlights.pageId === location.id);

  return (
    <React.Fragment>
      <Styled.HighlightsChapterWrapper>
        <Styled.HighlightsChapter data-testid='sg-chapter-title' dangerouslySetInnerHTML={{ __html: location.title }} />
      </Styled.HighlightsChapterWrapper>
      {pages.map(({pageId, highlights}) => {
        const page = assertDefined(
          archiveTreeSectionIsChapter(location)
            ? findArchiveTreeNode(location, stripIdVersion(pageId))
            : location,
          `Page is undefined in SectionHighlights`
        );
        return <Styled.HighlightWrapper key={pageId}>
          {!pageIdIsSameAsSectionId && <Styled.HighlightSection data-testid='sg-section-title'
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
