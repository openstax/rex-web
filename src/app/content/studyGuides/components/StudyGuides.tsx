import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { typesetMath } from '../../../../helpers/mathjax';
import Loader from '../../../components/Loader';
import { useServices } from '../../../context/Services';
import theme from '../../../theme';
import { assertWindow } from '../../../utils';
import SectionHighlights, {
  HighlightsChapterWrapper,
  HighlightSection,
  HighlightWrapper
} from '../../components/SectionHighlights';
import allImagesLoaded from '../../components/utils/allImagesLoaded';
import HighlightsWrapper from '../../styles/HighlightsWrapper';
import LoaderWrapper from '../../styles/LoaderWrapper';
import * as selectors from '../selectors';
import StudyGuidesListElement from './StudyGuidesListElement';
import StudyGuidesPrintButton from './StudyGuidesPrintButton';

// tslint:disable-next-line: variable-name
const StudyGuides = ({ className }: { className: string }) => {
  const orderedStudyGuides = useSelector(selectors.orderedSummaryStudyGuides);
  const isLoading = useSelector(selectors.summaryIsLoading);
  const container = React.useRef<HTMLElement>(null);
  const services = useServices();

  React.useLayoutEffect(() => {
    if (container.current) {
      services.promiseCollector.add(allImagesLoaded(container.current));
      services.promiseCollector.add(typesetMath(container.current, assertWindow()));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps, ignore promiseCollector
  }, [orderedStudyGuides]);

  return <div className={className}>
    <StudyGuidesPrintButton />
    {isLoading ? <LoaderWrapper><Loader large /></LoaderWrapper> : null}
    {orderedStudyGuides && <HighlightsWrapper ref={container}>
      {orderedStudyGuides.map((highlightData) => {
        return <SectionHighlights
          key={highlightData.location.id}
          highlightDataInSection={highlightData}
          highlightRenderer={(highlight) => (
            <StudyGuidesListElement
              key={highlight.id}
              highlight={highlight}
            />
          )}
        />;
      })}
    </HighlightsWrapper>}
  </div>;
};

export default styled(StudyGuides)`
  ${HighlightsChapterWrapper} {
    ${theme.breakpoints.mobile`
      max-width: 90%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}

    @media print {
      padding-left: 0;
    }
  }

  ${HighlightWrapper} {
    @media print {
      margin-left: 0;
    }
  }

  ${HighlightSection} {
    ${theme.breakpoints.mobile`
      padding-left: 2rem;
    `}

    @media print {
      background: ${theme.color.neutral.darkest}
    }
  }

  display: contents;
`;
