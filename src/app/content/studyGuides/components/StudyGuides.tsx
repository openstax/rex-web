import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { typesetMath } from '../../../../helpers/mathjax';
import Loader from '../../../components/Loader';
import { useServices } from '../../../context/Services';
import theme from '../../../theme';
import { assertWindow } from '../../../utils';
import allImagesLoaded from '../../components/utils/allImagesLoaded';
// Temporary import from /highlights directory until we make all this logic reusable and move it to content/
import * as Styled from '../../highlights/components/ShowMyHighlightsStyles';
import { SectionHighlights } from '../../highlights/components/SummaryPopup/SectionHighlights';
import { HighlightsChapterWrapper, HighlightSection } from '../../highlights/components/SummaryPopup/styles';
import * as selectors from '../selectors';

// Why these styles are not applied?
// tslint:disable-next-line: variable-name
const StyledSectionHighlights = styled(SectionHighlights)`
  ${HighlightsChapterWrapper} {
    ${theme.breakpoints.mobile`
      max-width: 90%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
  }
  ${HighlightSection} {
    ${theme.breakpoints.mobile`
    padding-left: 2rem;
  `}
  }
`;

// tslint:disable-next-line: variable-name
const StudyGuides = () => {
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
        return <StyledSectionHighlights
          key={highlightData.location.id}
          highlightDataInSection={highlightData}
          forStudyGuides={true}
        />;
      })}
    </Styled.Highlights>}
  </React.Fragment>;
};

export default StudyGuides;
