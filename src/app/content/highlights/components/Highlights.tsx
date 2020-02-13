import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import myHighlightsEmptyImage from '../../../../assets/MHpage-empty-logged-in.png';
import htmlMessage from '../../../components/htmlMessage';
import Loader from '../../../components/Loader';
import { assertDefined } from '../../../utils';
import { archiveTreeSectionIsChapter, findArchiveTreeNode } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import * as selectors from '../selectors';
import { OrderedSummaryHighlights } from '../types';
import * as HStyled from './HighlightStyles';
import * as Styled from './ShowMyHighlightsStyles';
import HighlightListElement from './SummaryPopup/HighlightListElement';

// tslint:disable-next-line: variable-name
const NoHighlightsTip = htmlMessage(
  'i18n:toolbar:highlights:popup:heading:no-highlights-tip',
  (props) => <span {...props} />
);

// tslint:disable-next-line: variable-name
const Highlights = () => {
  const orderedHighlights = useSelector(selectors.orderedSummaryHighlights);
  const isLoading = useSelector(selectors.summaryIsLoading);
  const totalCountsPerPage = useSelector(selectors.totalCountsPerPage);

  if (
    !isLoading
    && (!totalCountsPerPage || Object.keys(totalCountsPerPage).length === 0)
  ) {
    return <Styled.Highlights>
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
    </Styled.Highlights>;
  }

  if (!isLoading && orderedHighlights && orderedHighlights.length === 0) {
    return <Styled.Highlights>
      <HStyled.GeneralCenterText>
        <FormattedMessage id='i18n:toolbar:highlights:popup:heading:no-highlights'>
          {(msg: Element | string) => msg}
        </FormattedMessage>
        <NoHighlightsTip />
      </HStyled.GeneralCenterText>
    </Styled.Highlights>;
  }

  return <React.Fragment>
    {isLoading ? <Styled.LoaderWrapper><Loader large /></Styled.LoaderWrapper> : null}
    {orderedHighlights && <Styled.Highlights>
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
        <Styled.HighlightsChapter dangerouslySetInnerHTML={{ __html: location.title }} />
      </Styled.HighlightsChapterWrapper>
      {pages.map(({pageId, highlights}) => {
        const page = assertDefined(
          archiveTreeSectionIsChapter(location)
            ? findArchiveTreeNode(location, stripIdVersion(pageId))
            : location,
          `Page is undefined in SectionHighlights`
        );
        return <Styled.HighlightWrapper key={pageId}>
          {!pageIdIsSameAsSectionId && <Styled.HighlightSection
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
