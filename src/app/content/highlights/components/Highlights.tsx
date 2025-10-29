import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import myHighlightsEmptyImage from '../../../../assets/MHpage-empty-logged-in.png';
import { typesetMath } from '../../../../helpers/mathjax';
import htmlMessage from '../../../components/htmlMessage';
import Loader from '../../../components/Loader';
import { useServices } from '../../../context/Services';
import { assertWindow } from '../../../utils';
import SectionHighlights, { HighlightWrapper } from '../../components/SectionHighlights';
import allImagesLoaded from '../../components/utils/allImagesLoaded';
import HighlightsWrapper from '../../styles/HighlightsWrapper';
import LoaderWrapper from '../../styles/LoaderWrapper';
import * as selectors from '../selectors';
import * as HStyled from './HighlightStyles';
import HighlightListElement from './SummaryPopup/HighlightListElement';
import { StyledHiddenLiveRegion } from './HighlightStyles';

// tslint:disable-next-line: variable-name
export const NoHighlightsTip = htmlMessage(
  'i18n:toolbar:highlights:popup:heading:no-highlights-tip',
  (props) => <span {...props} />
);

// tslint:disable-next-line: variable-name
const VisuallyHiddenLiveRegion = ({ message }: { message: string }) => (
  <StyledHiddenLiveRegion aria-live='polite'>
    {message}
  </StyledHiddenLiveRegion>
);

// tslint:disable-next-line: variable-name
const Highlights = ({ className }: { className: string }) => {
  const orderedHighlights = useSelector(selectors.orderedSummaryHighlights);
  const isLoading = useSelector(selectors.summaryIsLoading);
  const totalCountsPerPage = useSelector(selectors.totalCountsPerPage);
  const container = React.useRef<HTMLElement>(null);
  const services = useServices();
  const intl = useIntl();
  const [announceMsg, setAnnounceMsg] = React.useState('');

  React.useLayoutEffect(() => {
    if (container.current) {
      services.promiseCollector.add(allImagesLoaded(container.current));
      services.promiseCollector.add(typesetMath(container.current, assertWindow()));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedHighlights]);

  React.useEffect(() => {
    if (
      !isLoading &&
      (!totalCountsPerPage || Object.keys(totalCountsPerPage).length === 0)
    ) {
      setAnnounceMsg(intl.formatMessage({ id: 'i18n:toolbar:highlights:popup:body:no-highlights-in-book' }));
    } else if (!isLoading && orderedHighlights && orderedHighlights.length === 0) {
      setAnnounceMsg(intl.formatMessage({ id: 'i18n:toolbar:highlights:popup:heading:no-highlights' }));
    } else {
      setAnnounceMsg('');
    }
  }, [isLoading, orderedHighlights, totalCountsPerPage, intl]);

  if (
    !isLoading
    && (!totalCountsPerPage || Object.keys(totalCountsPerPage).length === 0)
  ) {
    return <HighlightsWrapper ref={container}>
      <VisuallyHiddenLiveRegion message={announceMsg} />
      <HStyled.GeneralLeftText>
        <FormattedMessage id='i18n:toolbar:highlights:popup:body:no-highlights-in-book'>
          {(msg) => msg}
        </FormattedMessage>
      </HStyled.GeneralLeftText>
      <HStyled.MyHighlightsWrapper>
        <HStyled.GeneralText>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:add-highlight'>
            {(msg) => msg}
          </FormattedMessage>
        </HStyled.GeneralText>
        <HStyled.GeneralTextWrapper>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:use-this-page'>
            {(msg) => msg}
          </FormattedMessage>
        </HStyled.GeneralTextWrapper>
        <HStyled.MyHighlightsImage src={myHighlightsEmptyImage} />
      </HStyled.MyHighlightsWrapper>
    </HighlightsWrapper>;
  }

  if (!isLoading && orderedHighlights && orderedHighlights.length === 0) {
    return <HighlightsWrapper ref={container}>
      <VisuallyHiddenLiveRegion message={announceMsg} />
      <HStyled.GeneralCenterText>
        <FormattedMessage id='i18n:toolbar:highlights:popup:heading:no-highlights'>
          {(msg) => msg}
        </FormattedMessage>
        <NoHighlightsTip />
      </HStyled.GeneralCenterText>
    </HighlightsWrapper>;
  }

  return <React.Fragment>
    <VisuallyHiddenLiveRegion message={announceMsg} />
    {isLoading ? <LoaderWrapper><Loader large /></LoaderWrapper> : null}
    {orderedHighlights && <HighlightsWrapper ref={container} className={className} aria-live='polite'>
      {orderedHighlights.map((highlightData) => {
        return <SectionHighlights
          key={highlightData.location.id}
          highlightDataInSection={highlightData}
          highlightRenderer={(highlight, pageId) => (
            <HighlightListElement
              key={highlight.id}
              highlight={highlight}
              locationFilterId={highlightData.location.id}
              pageId={pageId}
            />
          )}
        />;
      })}
    </HighlightsWrapper>}
  </React.Fragment>;
};

export default styled(Highlights)`
  @media print {
    ${HighlightWrapper} {
      margin: 0;
    }
  }
`;
