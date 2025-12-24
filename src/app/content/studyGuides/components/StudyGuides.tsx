import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { typesetMath } from '../../../../helpers/mathjax';
import htmlMessage from '../../../components/htmlMessage';
import Loader from '../../../components/Loader';
import { useServices } from '../../../context/Services';
import theme from '../../../theme';
import { assertWindow } from '../../../utils';
import SectionHighlights, {
  HighlightsChapterWrapper,
  HighlightSection,
  HighlightWrapper,
} from '../../components/SectionHighlights';
import allImagesLoaded from '../../components/utils/allImagesLoaded';
import { GeneralCenterText } from '../../highlights/components/HighlightStyles';
import HighlightsWrapper from '../../styles/HighlightsWrapper';
import LoaderWrapper from '../../styles/LoaderWrapper';
import * as selectors from '../selectors';
import StudyGuidesListElement from './StudyGuidesListElement';

export const NoStudyGuidesTip = htmlMessage(
  'i18n:studyguides:popup:no-highlights-tip',
  (props) => <span {...props} />
);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedStudyGuides]);

  return <div className={className}>
    {isLoading ? <LoaderWrapper><Loader large /></LoaderWrapper> : null}
    {(!isLoading && orderedStudyGuides && orderedStudyGuides.length === 0) ?
      <HighlightsWrapper ref={container}>
        <GeneralCenterText>
          <FormattedMessage id='i18n:studyguides:popup:no-highlights'>
            {(msg) => msg}
          </FormattedMessage>
          <NoStudyGuidesTip />
        </GeneralCenterText>
      </HighlightsWrapper>
    : orderedStudyGuides && <HighlightsWrapper ref={container}>
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
  }

  ${HighlightSection} {
    ${theme.breakpoints.mobile`
      padding-left: 2rem;
    `}
  }

  @media print {
    ${HighlightsChapterWrapper} {
      padding-left: 0;

      & + ${HighlightWrapper} {
        margin-top: 0;
      }
    }

    ${HighlightWrapper} {
      margin-left: 0;
    }

    ${HighlightSection} {
      background: ${theme.color.neutral.darkest};
    }
  }

  display: contents;
`;
