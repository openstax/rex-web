import React from 'react';
import htmlMessage from '../../../components/htmlMessage';
import { StyledHiddenLiveRegion } from './HighlightStyles';
import HighlightsWrapper from '../../styles/HighlightsWrapper';
import * as HStyled from './HighlightStyles';
import { FormattedMessage, useIntl } from 'react-intl';
import myHighlightsEmptyImage from '../../../../assets/MHpage-empty-logged-in.png';
import SectionHighlights from '../../components/SectionHighlights';
import HighlightListElement from './SummaryPopup/HighlightListElement';
import { OrderedSummaryHighlights } from '../types';

export const NoHighlightsTip = htmlMessage(
  'i18n:toolbar:highlights:popup:heading:no-highlights-tip',
  (props) => <span {...props} />
);

export const VisuallyHiddenLiveRegion = ({ id }: { id: string }) => {
  const [liveMsg, setLiveMsg] = React.useState('');
  const intl = useIntl();

  // Required to force an "re-render" of aria-live with a dynamic msg
  React.useEffect(() => {
    setLiveMsg('');
    const timer = setTimeout(() => setLiveMsg(intl.formatMessage({ id })), 100);
    return () => clearTimeout(timer);
  }, [id, intl]);

  return (
    <StyledHiddenLiveRegion aria-live='polite'>
      {liveMsg}
    </StyledHiddenLiveRegion>
  );
};

export const NoHighlightsInBook = ({ container }: { container: React.RefObject<HTMLElement> }) => (
  <HighlightsWrapper ref={container}>
    <VisuallyHiddenLiveRegion id='i18n:toolbar:highlights:popup:body:no-highlights-in-book' />
    <HStyled.GeneralLeftText>
      <FormattedMessage id='i18n:toolbar:highlights:popup:body:no-highlights-in-book' />
    </HStyled.GeneralLeftText>
    <HStyled.MyHighlightsWrapper>
      <HStyled.GeneralText>
        <FormattedMessage id='i18n:toolbar:highlights:popup:body:add-highlight' />
      </HStyled.GeneralText>
      <HStyled.GeneralTextWrapper>
        <FormattedMessage id='i18n:toolbar:highlights:popup:body:use-this-page' />
      </HStyled.GeneralTextWrapper>
      <HStyled.MyHighlightsImage src={myHighlightsEmptyImage} />
    </HStyled.MyHighlightsWrapper>
  </HighlightsWrapper>
);

export const NoHighlightsAvailable = ({ container }: { container: React.RefObject<HTMLElement> }) => (
  <HighlightsWrapper ref={container}>
    <VisuallyHiddenLiveRegion id='i18n:toolbar:highlights:popup:heading:no-highlights' />
    <HStyled.GeneralCenterText>
      <FormattedMessage id='i18n:toolbar:highlights:popup:heading:no-highlights' />
      <NoHighlightsTip />
    </HStyled.GeneralCenterText>
  </HighlightsWrapper>
);

export const HighlightsList = (
  {
    container,
    orderedHighlights,
  }: {
    container: React.RefObject<HTMLElement>,
    orderedHighlights: OrderedSummaryHighlights | null,
  }
) => (
  <HighlightsWrapper ref={container}>
    {orderedHighlights?.map((highlightData) => (
      <SectionHighlights
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
      />
    ))}
  </HighlightsWrapper>
);