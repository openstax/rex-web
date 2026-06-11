import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { typesetMath } from '../../../../helpers/mathjax';
import htmlMessage from '../../../components/htmlMessage';
import Loader from '../../../components/Loader';
import { useServices } from '../../../context/Services';
import theme from '../../../theme';
import { assertWindow } from '../../../utils';
import SectionHighlights from '../../components/SectionHighlights';
import allImagesLoaded from '../../components/utils/allImagesLoaded';
import { GeneralCenterText } from '../../highlights/components/HighlightStyles';
import HighlightsWrapper from '../../styles/HighlightsWrapper';
import LoaderWrapper from '../../styles/LoaderWrapper';
import * as selectors from '../selectors';
import StudyGuidesListElement from './StudyGuidesListElement';
import './StudyGuides.css';

export const NoStudyGuidesTip = htmlMessage(
  'i18n:studyguides:popup:no-highlights-tip',
  (props) => <span {...props} />
);

const StudyGuides = () => {
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

  return <div
    className="study-guides-wrapper"
    style={{
      '--section-bg': theme.color.neutral.darkest,
    } as React.CSSProperties}
  >
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

export default StudyGuides;
