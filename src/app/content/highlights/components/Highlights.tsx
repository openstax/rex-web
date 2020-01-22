import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import myHighlightsEmptyImage from '../../../../assets/MHpage-empty-logged-in.png';
import htmlMessage from '../../../components/htmlMessage';
import Loader from '../../../components/Loader';
import { assertDefined } from '../../../utils';
import { LinkedArchiveTreeNode } from '../../types';
import { archiveTreeSectionIsChapter, findArchiveTreeNode } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import * as selectors from '../selectors';
import { SummaryHighlights } from '../types';
import * as HStyled from './HighlightStyles';
import * as Styled from './ShowMyHighlightsStyles';

// tslint:disable-next-line: variable-name
const NoHighlightsTip = htmlMessage(
  'i18n:toolbar:highlights:popup:heading:no-highlights-tip',
  (props) => <span {...props} />
);

// tslint:disable-next-line: variable-name
const Highlights = () => {
  const locationFilters = useSelector(selectors.highlightLocationFilters);
  const highlights = useSelector(selectors.summaryHighlights);
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

  if (!isLoading && highlights && Object.keys(highlights).length === 0) {
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
    {highlights && <Styled.Highlights>
      {Array.from(locationFilters).map(([id, location]) => {
        if (!highlights[id]) { return null; }
        return <SectionHighlights
          key={id}
          location={location}
          highlights={highlights}
        />;
      })}
    </Styled.Highlights>}
  </React.Fragment>;
};

export default Highlights;

interface SectionHighlightsProps {
  location: LinkedArchiveTreeNode;
  highlights: SummaryHighlights;
}

// tslint:disable-next-line: variable-name
export const SectionHighlights = ({ location, highlights }: SectionHighlightsProps) => {
  const pageIdIsSameAsSectionId = highlights[location.id][location.id];
  return (
    <React.Fragment>
      <Styled.HighlightsChapter
        dangerouslySetInnerHTML={{ __html: location.title }}
      />
      {Object.entries(highlights[location.id]).map(([pageId, pageHighlights]) => {
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
          {pageHighlights.map((item) => {
            return (
              <Styled.HighlightOuterWrapper key={item.id}>
                <Styled.HighlightContentWrapper color={item.color}>
                  <Styled.HighlightContent
                    className='summary-highlight-content'
                    dangerouslySetInnerHTML={{ __html: item.highlightedContent }}
                  />
                  {item.annotation ? (
                    <Styled.HighlightNote>
                      <span>
                        <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:text'>
                          {(msg: Element | string) => msg}
                        </FormattedMessage>
                      </span>
                      {item.annotation}
                    </Styled.HighlightNote>
                  ) : null}
                </Styled.HighlightContentWrapper>
              </Styled.HighlightOuterWrapper>
            );
          })}
        </Styled.HighlightWrapper>;
      })}
    </React.Fragment>
  );
};
