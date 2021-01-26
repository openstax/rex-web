import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
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

// tslint:disable-next-line: variable-name
const NoHighlightsTip = htmlMessage(
  'i18n:toolbar:highlights:popup:heading:no-highlights-tip',
  (props) => <span {...props} />
);

// tslint:disable-next-line: variable-name
const Highlights = ({ className }: { className: string }) => {
  const orderedHighlights = useSelector(selectors.orderedSummaryHighlights);
  const isLoading = useSelector(selectors.summaryIsLoading);
  const totalCountsPerPage = useSelector(selectors.totalCountsPerPage);
  const container = React.useRef<HTMLElement>(null);
  const services = useServices();

  React.useLayoutEffect(() => {
    if (container.current) {
      services.promiseCollector.add(allImagesLoaded(container.current));
      services.promiseCollector.add(typesetMath(container.current, assertWindow()));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedHighlights]);

  if (
    !isLoading
    && (!totalCountsPerPage || Object.keys(totalCountsPerPage).length === 0)
  ) {
    return <HighlightsWrapper ref={container}>
      <HStyled.GeneralLeftText>
        <FormattedMessage id='i18n:toolbar:highlights:popup:body:no-highlights-in-book'>
          {(msg: Element | string) => msg}
        </FormattedMessage>
      </HStyled.GeneralLeftText>
      <HStyled.MyHighlightsWrapper>
        <HStyled.GeneralText>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:add-highlight'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </HStyled.GeneralText>
        <HStyled.GeneralTextWrapper>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:use-this-page'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </HStyled.GeneralTextWrapper>
        <HStyled.MyHighlightsImage src={myHighlightsEmptyImage} />
      </HStyled.MyHighlightsWrapper>
    </HighlightsWrapper>;
  }

  if (!isLoading && orderedHighlights && orderedHighlights.length === 0) {
    return <HighlightsWrapper ref={container}>
      <HStyled.GeneralCenterText>
        <FormattedMessage id='i18n:toolbar:highlights:popup:heading:no-highlights'>
          {(msg: Element | string) => msg}
        </FormattedMessage>
        <NoHighlightsTip />
      </HStyled.GeneralCenterText>
    </HighlightsWrapper>;
  }

  return <React.Fragment>
    {isLoading ? <LoaderWrapper><Loader large /></LoaderWrapper> : null}
    {orderedHighlights && <HighlightsWrapper ref={container} className={className}>
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
